import { vol } from "memfs";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CheckContext } from "../../lib/types.js";

vi.mock("node:fs", async () => {
  const memfs = await vi.importActual<typeof import("memfs")>("memfs");
  return memfs.fs;
});

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
    vol.reset();
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

  it("reads local manifest for local source type", async () => {
    const manifest = JSON.stringify({ name: "Local App" });
    vol.fromJSON({ "/entry/dolphin-depot.json": manifest });

    const ctx = makeCtx({
      dir: "/entry",
      repoOwner: undefined,
      repoName: undefined,
      defaultBranch: undefined,
      sourceConfig: { source: { type: "local" } },
    });
    const result = await manifestExists(ctx);

    expect(result.passed).toBe(true);
    expect(result.message).toMatch(/local/);
    expect(ctx.manifest).toEqual({ name: "Local App" });
    expect(mockedGetRawFile).not.toHaveBeenCalled();
  });

  it("fails when local manifest is missing", async () => {
    vol.fromJSON({ "/entry": null });

    const ctx = makeCtx({
      dir: "/entry",
      repoOwner: undefined,
      repoName: undefined,
      defaultBranch: undefined,
      sourceConfig: { source: { type: "local" } },
    });
    const result = await manifestExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/not found/);
  });

  it("fails when local manifest has invalid JSON", async () => {
    vol.fromJSON({ "/entry/dolphin-depot.json": "{bad json" });

    const ctx = makeCtx({
      dir: "/entry",
      repoOwner: undefined,
      repoName: undefined,
      defaultBranch: undefined,
      sourceConfig: { source: { type: "local" } },
    });
    const result = await manifestExists(ctx);

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/not valid JSON/);
  });
});
