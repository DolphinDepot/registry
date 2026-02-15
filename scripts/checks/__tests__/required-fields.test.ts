import { describe, it, expect } from "vitest";
import { requiredFields } from "../required-fields.js";
import type { CheckContext } from "../../lib/types.js";

function makeCtx(overrides?: Partial<CheckContext>): CheckContext {
  return { slug: "test-app", dir: "/tmp", allSlugs: ["test-app"], ...overrides };
}

describe("requiredFields", () => {
  it("passes with a valid source config", () => {
    const ctx = makeCtx({
      sourceConfig: {
        source: { type: "github", repository: "https://github.com/owner/repo" },
      },
    });
    const result = requiredFields(ctx);

    expect(result.passed).toBe(true);
    expect(result.check).toBe("required-fields");
  });

  it("fails when sourceConfig is missing (YAML parse failed)", () => {
    const ctx = makeCtx();
    const result = requiredFields(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Skipped/);
  });

  it("fails with missing required fields", () => {
    const ctx = makeCtx({
      sourceConfig: { source: { type: "github" } } as any,
    });
    const result = requiredFields(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/repository/);
  });

  it("fails with wrong source.type", () => {
    const ctx = makeCtx({
      sourceConfig: {
        source: { type: "gitlab", repository: "https://github.com/owner/repo" },
      },
    });
    const result = requiredFields(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/type/);
  });

  it("fails with a bad repository URL", () => {
    const ctx = makeCtx({
      sourceConfig: {
        source: { type: "github", repository: "not-a-url" },
      },
    });
    const result = requiredFields(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/repository/);
  });
});
