import { describe, it, expect } from "vitest";
import { slugUnique } from "../slug-unique.js";
import type { CheckContext } from "../../lib/types.js";

function makeCtx(slug: string, allSlugs: string[]): CheckContext {
  return { slug, dir: "/tmp", allSlugs };
}

describe("slugUnique", () => {
  it("passes with a valid unique slug", () => {
    const result = slugUnique(makeCtx("my-cool-app", ["my-cool-app", "other-app"]));

    expect(result.passed).toBe(true);
  });

  it("passes with a single-word slug", () => {
    const result = slugUnique(makeCtx("app", ["app"]));

    expect(result.passed).toBe(true);
  });

  it("fails with uppercase characters", () => {
    const result = slugUnique(makeCtx("MyApp", ["MyApp"]));

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Invalid slug format/);
  });

  it("fails with spaces", () => {
    const result = slugUnique(makeCtx("my app", ["my app"]));

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Invalid slug format/);
  });

  it("fails with a leading hyphen", () => {
    const result = slugUnique(makeCtx("-my-app", ["-my-app"]));

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Invalid slug format/);
  });

  it("fails with a trailing hyphen", () => {
    const result = slugUnique(makeCtx("my-app-", ["my-app-"]));

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Invalid slug format/);
  });

  it("fails with consecutive hyphens", () => {
    const result = slugUnique(makeCtx("my--app", ["my--app"]));

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Invalid slug format/);
  });

  it("fails with a duplicate slug", () => {
    const result = slugUnique(makeCtx("my-app", ["my-app", "my-app"]));

    expect(result.passed).toBe(false);
    expect(result.message).toMatch(/Duplicate slug/);
  });
});
