import { vol } from "memfs";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CheckContext } from "../../lib/types.js";

vi.mock("node:fs", async () => {
  const memfs = await vi.importActual<typeof import("memfs")>("memfs");
  return memfs.fs;
});

import { yamlSyntax } from "../yaml-syntax.js";

function makeCtx(overrides?: Partial<CheckContext>): CheckContext {
  return { slug: "test-app", dir: "/entry", allSlugs: ["test-app"], ...overrides };
}

describe("yamlSyntax", () => {
  beforeEach(() => {
    vol.reset();
  });

  it("parses valid YAML and sets ctx.sourceConfig", () => {
    vol.fromJSON({
      "/entry/source.yaml": "source:\n  type: github\n  repository: https://github.com/owner/repo\n",
    });
    const ctx = makeCtx();
    const result = yamlSyntax(ctx);

    expect(result.passed).toBe(true);
    expect(result.check).toBe("yaml-syntax");
    expect(ctx.sourceConfig).toEqual({
      source: { type: "github", repository: "https://github.com/owner/repo" },
    });
  });

  it("fails on invalid YAML", () => {
    vol.fromJSON({
      "/entry/source.yaml": ":\n  - :\n  bad: [unterminated",
    });
    const ctx = makeCtx();
    const result = yamlSyntax(ctx);

    expect(result.passed).toBe(false);
    expect(ctx.sourceConfig).toBeUndefined();
  });

  it("fails when source.yaml is missing", () => {
    vol.fromJSON({ "/entry": null });
    const ctx = makeCtx();
    const result = yamlSyntax(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/ENOENT|no such file/i);
  });
});
