import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

// Must import after stubbing global fetch
import { getRepoInfo, getRawFile } from "../github.js";

describe("getRepoInfo", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("returns exists and default_branch on 200", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({ default_branch: "main" }),
    });

    const result = await getRepoInfo("owner", "repo");

    expect(result).toEqual({ exists: true, default_branch: "main" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/owner/repo",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("returns exists=false on 404", async () => {
    fetchMock.mockResolvedValue({ status: 404 });

    const result = await getRepoInfo("owner", "nonexistent");

    expect(result).toEqual({ exists: false });
  });
});

describe("getRawFile", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("returns content on 200", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      text: async () => '{"name":"app"}',
    });

    const result = await getRawFile("owner", "repo", "main", "dolphin-depot.json");

    expect(result).toEqual({ found: true, content: '{"name":"app"}' });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://raw.githubusercontent.com/owner/repo/main/dolphin-depot.json",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });

  it("returns found=false on 404", async () => {
    fetchMock.mockResolvedValue({ status: 404 });

    const result = await getRawFile("owner", "repo", "main", "missing.json");

    expect(result).toEqual({ found: false });
  });
});

describe("auth header", () => {
  const originalToken = process.env.GITHUB_TOKEN;

  afterEach(() => {
    vi.resetModules();
    if (originalToken !== undefined) {
      process.env.GITHUB_TOKEN = originalToken;
    } else {
      delete process.env.GITHUB_TOKEN;
    }
  });

  it("sets Authorization header when GITHUB_TOKEN is present", async () => {
    process.env.GITHUB_TOKEN = "test-token-123";
    vi.resetModules();

    const localFetch = vi.fn().mockResolvedValue({ status: 404 });
    vi.stubGlobal("fetch", localFetch);

    const { getRepoInfo: freshGetRepoInfo } = await import("../github.js");
    await freshGetRepoInfo("owner", "repo");

    const callHeaders = localFetch.mock.calls[0][1].headers;
    expect(callHeaders).toHaveProperty("Authorization", "Bearer test-token-123");
  });

  it("omits Authorization header when GITHUB_TOKEN is absent", async () => {
    delete process.env.GITHUB_TOKEN;
    vi.resetModules();

    const localFetch = vi.fn().mockResolvedValue({ status: 404 });
    vi.stubGlobal("fetch", localFetch);

    const { getRepoInfo: freshGetRepoInfo } = await import("../github.js");
    await freshGetRepoInfo("owner", "repo");

    const callHeaders = localFetch.mock.calls[0][1].headers;
    expect(callHeaders).not.toHaveProperty("Authorization");
  });
});
