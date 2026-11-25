import { createServer } from "node:http";
import assert from "node:assert/strict";
import { api } from "./mock.mjs";

const server = createServer(api);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let cookie = "";

async function req(path, method = "GET", body) {
  const r = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}

try {
  assert.equal((await req("/data")).status, 401);
  cookie = (await req("/demo", "POST")).cookie;
  assert.ok(cookie);
  assert.equal((await req("/data")).data.transactions.length, 4);
  const expense = {
    merchant: "Smoke test",
    amount: 12.5,
    date: "2026-11-25",
    categoryId: "food",
    type: "expense",
    notes: "",
  };
  assert.equal(
    (await req("/transactions", "POST", expense)).data.transactions.length,
    5,
  );
  assert.equal(
    (await req("/transactions", "POST", { amount: -1 })).status,
    400,
  );
  const budget = { categoryId: "shopping", month: "2026-11", limit: 100 };
  assert.equal((await req("/budgets", "POST", budget)).status, 200);
  assert.equal((await req("/budgets", "POST", budget)).status, 400);
  for (const code of [401, 403, 404, 500])
    assert.equal((await req("/simulate/" + code)).status, code);
  const receipt = await req("/receipts", "POST", {
    fileName: "test.png",
    image: "data:image/png;base64,AA==",
  });
  assert.equal(receipt.data.status, "PROCESSING");
  const failure = await req("/receipts", "POST", {
    fileName: "failure.png",
    image: "data:image/png;base64,AA==",
    simulateFailure: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 1900));
  assert.equal((await req("/receipts/" + receipt.data.id)).data.status, "DONE");
  assert.equal(
    (await req("/receipts/" + failure.data.id)).data.status,
    "FAILED",
  );
  const confirmation = await req(
    "/receipts/" + receipt.data.id + "/confirm",
    "POST",
    expense,
  );
  assert.equal(confirmation.status, 200);
  assert.equal(confirmation.data.transactions.length, 6);
  assert.equal(
    (await req("/receipts/" + receipt.data.id + "/confirm", "POST", expense))
      .status,
    409,
  );
  const original = cookie;
  cookie = (await req("/demo", "POST")).cookie;
  assert.equal((await req("/data")).data.transactions.length, 4);
  cookie = original;
  assert.equal((await req("/data")).data.transactions.length, 6);
  console.log(
    "PASS: auth, session isolation, transactions, validation, budgets, status errors, receipt success/failure and confirmation",
  );
} finally {
  server.close();
}
