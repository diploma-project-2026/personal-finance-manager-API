export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const messages: Record<number, string> = {
  401: "Please sign in again.",
  403: "You do not have permission.",
  404: "The requested record was not found.",
  500: "Server error. Please try again.",
};
export async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  try {
    const r = await fetch(`/api/${path}`, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await r.json();
    if (r.status === 401 && !path.startsWith("auth/"))
      window.dispatchEvent(new Event("pfm:session-expired"));
    if (!r.ok)
      throw new ApiError(
        r.status,
        path.startsWith("auth/login")
          ? data.message
          : messages[r.status] || data.message || "Request failed",
      );
    return data as T;
  } catch (e) {
    console.error("API request failed", path, e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, "Network error. Check your connection and retry.");
  }
}
