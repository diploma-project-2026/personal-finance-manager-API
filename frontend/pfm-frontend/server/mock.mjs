import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

const users = new Map(),
  sessions = new Map();
const month = new Date().toISOString().slice(0, 7);
const seed = () => ({
  currency: "EUR",
  categories: [
    { id: "food", name: "Groceries", type: "expense" },
    {
      id: "transport",
      name: "Transport",
      type: "expense",
    },
    { id: "shopping", name: "Shopping", type: "expense" },
    {
      id: "utilities",
      name: "Utilities",
      type: "expense",
    },
    { id: "fun", name: "Entertainment", type: "expense" },
    { id: "salary", name: "Salary", type: "income" },
  ],
  transactions: [
    {
      id: "t1",
      merchant: "Salary",
      amount: 2100,
      date: month + "-01",
      categoryId: "salary",
      type: "income",
      notes: "",
    },
    {
      id: "t2",
      merchant: "MAXIMA",
      amount: 24.95,
      date: month + "-03",
      categoryId: "food",
      type: "expense",
      notes: "",
    },
    {
      id: "t3",
      merchant: "Public transport",
      amount: 32,
      date: month + "-04",
      categoryId: "transport",
      type: "expense",
      notes: "",
    },
    {
      id: "t4",
      merchant: "Electricity",
      amount: 85,
      date: month + "-05",
      categoryId: "utilities",
      type: "expense",
      notes: "",
    },
  ],
  budgets: [
    { id: "b1", categoryId: "food", month, limit: 500 },
    {
      id: "b2",
      categoryId: "transport",
      month,
      limit: 150,
    },
    { id: "b3", categoryId: "utilities", month, limit: 120 },
  ],
  goals: [{ id: "g1", name: "New laptop", target: 1200, saved: 600 }],
  receipts: [],
});
const reply = (res, status, data) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
};
const fail = (status, message) => Object.assign(new Error(message), { status });
const body = async (req) => {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 15_000_000) throw fail(400, "File is too large");
  }
  try {
    return JSON.parse(raw || "{}");
  } catch {
    throw fail(400, "Invalid JSON");
  }
};
const valid = (condition, message) => {
  if (!condition) throw fail(400, message);
};
const publicUser = (u) => ({ name: u.name, email: u.email });

export async function api(req, res) {
  try {
    await new Promise((r) => setTimeout(r, 160));
    const path = new URL(req.url, "http://localhost").pathname
      .split("/")
      .filter(Boolean);
    const method = req.method;
    const [resource, id, action] = path;
    const cookies = Object.fromEntries(
      (req.headers.cookie || "").split(";").map((s) => s.trim().split("=")),
    );
    let user = sessions.get(cookies.pfm_session);
    if (resource === "demo" && method === "POST") {
      user = { name: "Demo user", email: "demo@example.test", data: seed() };
      return login(user);
    }
    if (
      resource === "auth" &&
      ["login", "register"].includes(id) &&
      method === "POST"
    ) {
      const b = await body(req);
      const email = String(b.email || "")
        .trim()
        .toLowerCase();
      valid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Enter a valid email");
      valid(
        typeof b.password === "string" && b.password.length >= 8,
        "Password must contain at least 8 characters",
      );
      if (id === "register") {
        valid(typeof b.name === "string" && b.name.trim(), "Name is required");
        if (users.has(email)) throw fail(409, "Account already exists");
        const salt = randomUUID();
        user = {
          name: b.name.trim(),
          email,
          salt,
          hash: scryptSync(b.password, salt, 64),
          data: { ...seed(), transactions: [], budgets: [], goals: [] },
        };
        users.set(email, user);
      } else {
        user = users.get(email);
        if (
          !user ||
          !timingSafeEqual(user.hash, scryptSync(b.password, user.salt, 64))
        )
          throw fail(401, "Invalid email or password");
      }
      return login(user);
    }

    function login(u) {
      const token = randomUUID();
      sessions.set(token, u);
      res.setHeader(
        "Set-Cookie",
        `pfm_session=${token}; HttpOnly; SameSite=Lax; Path=/`,
      );
      return reply(res, 200, publicUser(u));
    }

    if (resource === "auth" && id === "logout" && method === "POST") {
      sessions.delete(cookies.pfm_session);
      res.setHeader(
        "Set-Cookie",
        "pfm_session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/",
      );
      return reply(res, 200, {});
    }
    if (!user) throw fail(401, "Please sign in");
    if (resource === "auth" && id === "me")
      return reply(res, 200, publicUser(user));
    const d = user.data;
    if (resource === "data" && method === "GET") return reply(res, 200, d);
    if (resource === "settings" && method === "PATCH") {
      const b = await body(req);
      valid(b.currency === "EUR", "Demo supports EUR only");
      return reply(res, 200, d);
    }
    if (resource === "simulate") {
      const code = Number(id);
      if ([401, 403, 404, 500].includes(code))
        throw fail(code, "Simulated API error");
    }
    if (
      !["transactions", "budgets", "goals", "categories", "receipts"].includes(
        resource,
      )
    )
      throw fail(404, "Resource not found");
    const list = d[resource];
    if (method === "GET")
      return reply(
        res,
        200,
        id
          ? (list.find((x) => x.id === id) ??
              (() => {
                throw fail(404, "Not found");
              })())
          : list,
      );
    if (id && !list.some((x) => x.id === id))
      throw fail(404, "Record not found");
    if (
      resource === "receipts" &&
      id &&
      action === "confirm" &&
      method === "POST"
    ) {
      const receipt = list.find((x) => x.id === id);
      valid(receipt.status === "DONE", "Receipt is not ready");
      if (receipt.transactionId)
        throw fail(409, "Receipt has already been confirmed");
      const b = await body(req);
      valid(
        b.type === "expense" &&
          typeof b.merchant === "string" &&
          b.merchant.trim() &&
          typeof b.amount === "number" &&
          Number.isFinite(b.amount) &&
          b.amount > 0 &&
          /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
          d.categories.some(
            (c) => c.id === b.categoryId && c.type === "expense",
          ),
        "Enter valid expense details",
      );
      const transaction = {
        id: randomUUID(),
        merchant: b.merchant.trim(),
        date: b.date,
        amount: b.amount,
        categoryId: b.categoryId,
        type: "expense",
        notes: b.notes || "",
        items: b.items || [],
      };
      Object.assign(receipt, {
        merchant: transaction.merchant,
        date: transaction.date,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        items: transaction.items,
        transactionId: transaction.id,
      });
      d.transactions.unshift(transaction);
      return reply(res, 200, d);
    }
    if (method === "DELETE") {
      if (
        resource === "categories" &&
        (d.transactions.some((x) => x.categoryId === id) ||
          d.budgets.some((x) => x.categoryId === id))
      )
        throw fail(409, "Category is in use");
      d[resource] = list.filter((x) => x.id !== id);
      return reply(res, 200, d);
    }
    if (!["POST", "PATCH"].includes(method))
      throw fail(404, "Unsupported operation");
    const b = await body(req);
    const old = list.find((x) => x.id === id);
    const item = { ...old, ...b, id: id || randomUUID() };
    const positive = (x) =>
      typeof x === "number" && Number.isFinite(x) && x > 0;
    const cat = d.categories.find((x) => x.id === item.categoryId);
    if (resource === "transactions") {
      valid(
        positive(item.amount) &&
          typeof item.merchant === "string" &&
          item.merchant.trim() &&
          /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
          cat?.type === item.type,
        "Enter valid transaction details",
      );
    }
    if (resource === "budgets") {
      valid(
        positive(item.limit) &&
          cat?.type === "expense" &&
          /^\d{4}-\d{2}$/.test(item.month),
        "Enter valid budget details",
      );
      valid(
        !list.some(
          (x) =>
            x.id !== item.id &&
            x.categoryId === item.categoryId &&
            x.month === item.month,
        ),
        "Budget already exists for this category and month",
      );
    }
    if (resource === "goals")
      valid(
        typeof item.name === "string" &&
          item.name.trim() &&
          positive(item.target) &&
          Number.isFinite(item.saved) &&
          item.saved >= 0,
        "Enter valid goal details",
      );
    if (resource === "categories")
      valid(
        typeof item.name === "string" &&
          item.name.trim() &&
          ["income", "expense"].includes(item.type),
        "Enter valid category details",
      );
    if (resource === "receipts" && method === "POST") {
      valid(
        typeof b.fileName === "string" &&
          typeof b.image === "string" &&
          /^data:image\/(png|jpeg|webp);base64,/.test(b.image),
        "Upload a JPG, PNG or WebP image",
      );
      Object.assign(item, {
        status: "PROCESSING",
        merchant: "Demo merchant",
        date: new Date().toISOString().slice(0, 10),
        amount: 24.95,
        categoryId: "food",
        items: [{ name: "Sample item", quantity: 1, price: 24.95 }],
      });
      setTimeout(() => {
        item.status = b.simulateFailure === true ? "FAILED" : "DONE";
      }, 1800);
    }
    if (resource === "receipts" && method === "PATCH") {
      valid(old.status === "DONE", "Receipt is not ready");
      item.status = "DONE";
    }
    if (old) list[list.indexOf(old)] = item;
    else list.unshift(item);
    return reply(res, 200, resource === "receipts" ? item : d);
  } catch (e) {
    reply(res, e.status || 500, {
      message: e.status ? e.message : "Unexpected server error",
    });
    if (!e.status) console.error(e);
  }
}
