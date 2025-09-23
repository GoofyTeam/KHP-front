import { extractApiErrorMessage } from "../error-utils";

describe("extractApiErrorMessage", () => {
  test("returns message from error.data string", () => {
    const err = { data: "Simple error" };
    expect(extractApiErrorMessage(err)).toBe("Simple error");
  });

  test("returns message from error.data.message", () => {
    const err = { data: { message: "Backend said no" } };
    expect(extractApiErrorMessage(err)).toBe("Backend said no");
  });

  test("returns first message from error.data.errors object", () => {
    const err = {
      data: { errors: { name: ["Name taken"], other: "ignored" } },
    };
    expect(extractApiErrorMessage(err)).toBe("Name taken");
  });

  test("falls back to error.message", () => {
    const err = new Error("Network failed");
    expect(extractApiErrorMessage(err)).toBe("Network failed");
  });

  test("generic message for unknown shapes", () => {
    expect(extractApiErrorMessage(123)).toMatch(/An error occurred/);
  });
});
