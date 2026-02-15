import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CheckContext } from "../../lib/types.js";

vi.mock("../../lib/github.js", () => ({
  getRepoInfo: vi.fn(),
}));

import { repoExists } from "../repo-exists.js";
import { getRepoInfo } from "../../lib/github.js";

const mockedGetRepoInfo = vi.mocked(getRepoInfo);

function makeCtx(overrides?: Partial<CheckContext>): CheckContext {
  return { slug: "test-app", dir: "/tmp", allSlugs: ["test-app"], ...overrides };
}

describe("repoExists", () => {
  beforeEach(() => {
    mockedGetRepoInfo.mockReset();
  });

  it("passes when the repository exists", async () => {
    mockedGetRepoInfo.mockResolvedValue({ exists: true, default_branch: "main" });

    const ctx = makeCtx({
      sourceConfig: {
        source: { type: "github", repository: "https://github.com/owner/repo" },
      },
    });
    const result = await repoExists(ctx);

    expect(result.passed).toBe(true);
    expect(ctx.repoOwner).toBe("owner");
    expect(ctx.repoName).toBe("repo");
    expect(ctx.defaultBranch).toBe("main");
  });

  it("fails when the repository does not exist", async () => {
    mockedGetRepoInfo.mockResolvedValue({ exists: false });

    const ctx = makeCtx({
      sourceConfig: {
        source: { type: "github", repository: "https://github.com/owner/repo" },
      },
    });
    const result = await repoExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/not found/i);
  });

  it("skips when sourceConfig is missing", async () => {
    const ctx = makeCtx();
    const result = await repoExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/no source config/i);
  });

  it("skips with pass for local source type", async () => {
    const ctx = makeCtx({
      sourceConfig: { source: { type: "local" } },
    });
    const result = await repoExists(ctx);

    expect(result.passed).toBe(true);
    expect(result.message).toMatch(/local source/i);
    expect(mockedGetRepoInfo).not.toHaveBeenCalled();
  });

  it("fails when repository URL cannot be parsed", async () => {
    const ctx = makeCtx({
      sourceConfig: {
        source: { type: "github", repository: "https://gitlab.com/owner/repo" },
      },
    });
    const result = await repoExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Cannot parse/);
  });
});
