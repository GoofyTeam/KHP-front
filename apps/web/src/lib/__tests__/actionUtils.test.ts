import { handleActionError, executeHttpAction } from "../actionUtils";

describe("handleActionError", () => {
  test("extracts first error from 422 JSON blob in message", () => {
    const errorPayload = { errors: { name: ["Name already taken"] } };
    const err = new Error(`422: ${JSON.stringify(errorPayload)}`);
    const res = handleActionError(err, "Error: ");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Error: Name already taken");
    }
  });

  test("falls back to error.message", () => {
    const err = new Error("Boom");
    const res = handleActionError(err);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("Boom");
  });
});

describe("executeHttpAction", () => {
  test("wraps success results", async () => {
    const res = await executeHttpAction(async () => 42);
    expect(res).toEqual({ success: true, data: 42 });
  });

  test("wraps errors via handleActionError", async () => {
    const errorPayload = { errors: { test: ["Failed"] } };
    const res = await executeHttpAction(async () => {
      throw new Error(`422: ${JSON.stringify(errorPayload)}`);
    });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error).toBe("Failed");
  });
});
