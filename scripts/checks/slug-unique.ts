import type { CheckContext, CheckResult } from "../lib/types.js";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugUnique(ctx: CheckContext): CheckResult {
  if (!SLUG_PATTERN.test(ctx.slug)) {
    return {
      check: "slug-unique",
      passed: false,
      message: `Invalid slug format "${ctx.slug}". Must match: lowercase alphanumeric, hyphens allowed between words`,
    };
  }

  const duplicates = ctx.allSlugs.filter((s) => s === ctx.slug);
  if (duplicates.length > 1) {
    return {
      check: "slug-unique",
      passed: false,
      message: `Duplicate slug "${ctx.slug}" found`,
    };
  }

  return { check: "slug-unique", passed: true, message: "Slug is valid and unique" };
}
