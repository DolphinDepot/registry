import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CheckContext } from "../../lib/types.js";

vi.mock("../../lib/github.js", () => ({
  getRawFile: vi.fn(),
}));

import { manifestExists } from "../manifest-exists.js";
import { getRawFile } from "../../lib/github.js";

const mockedGetRawFile = vi.mocked(getRawFile);

function makeCtx(overrides?: Partial<CheckContext>): CheckContext {
  return {
    slug: "test-app",
    dir: "/tmp",
    allSlugs: ["test-app"],
    repoOwner: "owner",
    repoName: "repo",
    defaultBranch: "main",
    ...overrides,
  };
}

describe("manifestExists", () => {
  beforeEach(() => {
    mockedGetRawFile.mockReset();
  });

  it("passes when dolphin-depot.json is found with valid JSON", async () => {
    const manifest = JSON.stringify({ name: "Test App" });
    mockedGetRawFile.mockResolvedValue({ found: true, content: manifest });

    const ctx = makeCtx();
    const result = await manifestExists(ctx);

    expect(result.passed).toBe(true);
    expect(ctx.manifest).toEqual({ name: "Test App" });
  });

  it("fails when dolphin-depot.json is not found", async () => {
    mockedGetRawFile.mockResolvedValue({ found: false });

    const ctx = makeCtx();
    const result = await manifestExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/not found/);
  });

  it("fails when dolphin-depot.json contains invalid JSON", async () => {
    mockedGetRawFile.mockResolvedValue({ found: true, content: "{bad json" });

    const ctx = makeCtx();
    const result = await manifestExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/not valid JSON/);
  });

  it("skips when repo info is missing", async () => {
    const ctx = makeCtx({ repoOwner: undefined, repoName: undefined, defaultBranch: undefined });
    const result = await manifestExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/repo check failed/i);
  });
});
