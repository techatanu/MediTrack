import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./session", () => ({ getToken: vi.fn(() => "tok-123") }));

const { default: api, getErrorMessage, setUnauthorizedHandler } = await import("./api");
const reports = await import("../services/reportsService");
const auth = await import("../services/authService");

// Fake transport: records each request and answers with the queued response.
let requests;
let respond;
beforeEach(() => {
  requests = [];
  respond = () => ({ status: 200, data: { data: {} } });
  api.defaults.adapter = async (config) => {
    requests.push(config);
    const { status, data } = respond(config);
    const response = { status, data, headers: {}, config, statusText: "" };
    if (status >= 400) {
      const err = new Error(`Request failed with status code ${status}`);
      Object.assign(err, { response, config, isAxiosError: true });
      throw err;
    }
    return response;
  };
});
afterEach(() => setUnauthorizedHandler(null));

describe("api client", () => {
  test("attaches the bearer token", async () => {
    await api.get("/reports");
    expect(requests[0].headers.Authorization).toBe("Bearer tok-123");
  });

  test("calls the unauthorized handler on a 401 from a protected endpoint", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    respond = () => ({ status: 401, data: { error: { message: "Session expired" } } });

    await expect(api.get("/reports")).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  test.each(["/users/login", "/users/signup"])("does not log out on a 401 from %s", async (url) => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    respond = () => ({ status: 401, data: { error: { message: "Invalid email or password" } } });

    await expect(api.post(url, {})).rejects.toThrow();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test("does not log out on other errors", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    respond = () => ({ status: 403, data: { error: { message: "Current password is incorrect" } } });

    await expect(api.put("/users/profile/password", {})).rejects.toThrow();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});

describe("getErrorMessage", () => {
  const httpError = (data) => ({ response: { status: 400, data } });

  test("prefers the first field-level validation message", () => {
    const err = httpError({ error: { message: "Validation failed", details: [{ field: "body.password", message: "Password must be at least 8 characters" }] } });
    expect(getErrorMessage(err)).toBe("Password must be at least 8 characters");
  });

  test("falls back to the error message, then the fallback", () => {
    expect(getErrorMessage(httpError({ error: { message: "Doctor not found" } }))).toBe("Doctor not found");
    expect(getErrorMessage(httpError("<html>"), "Upload failed")).toBe("Upload failed");
  });

  test("reports network failures distinctly", () => {
    expect(getErrorMessage(new Error("Network Error"))).toMatch(/network error/i);
  });
});

describe("services", () => {
  test("login unwraps { user, token }", async () => {
    respond = () => ({ status: 200, data: { data: { user: { firstName: "Ada" }, token: "t" } } });
    await expect(auth.login("a@b.co", "pw")).resolves.toEqual({ user: { firstName: "Ada" }, token: "t" });
    expect(requests[0]).toMatchObject({ method: "post", url: "/users/login" });
  });

  test("listReports passes params and returns reports with pagination", async () => {
    respond = () => ({ status: 200, data: { data: [{ _id: "1" }], pagination: { total: 1 } } });
    const result = await reports.listReports({ limit: 50, search: "cbc" });
    expect(requests[0].params).toEqual({ limit: 50, search: "cbc" });
    expect(result).toEqual({ reports: [{ _id: "1" }], pagination: { total: 1 } });
  });

  test("createReport sends multipart form data, not JSON", async () => {
    respond = () => ({ status: 201, data: { data: { _id: "r1" } } });
    const file = new Blob(["%PDF-1.4"], { type: "application/pdf" });

    await reports.createReport({ title: "CBC", category: "Lab", reportDate: "2024-01-01", doctor: "", file });

    const sent = requests[0].data;
    expect(sent).toBeInstanceOf(FormData);
    expect(sent.get("title")).toBe("CBC");
    expect(sent.get("image")).toBeInstanceOf(Blob);
    expect(sent.has("doctor")).toBe(false);
    expect(String(requests[0].headers["Content-Type"] ?? "")).not.toMatch(/json/);
  });
});
