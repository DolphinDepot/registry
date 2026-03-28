import type { CheckContext, CheckResult } from "../lib/types.js";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugValid(ctx: CheckContext): CheckResult {
    if (!SLUG_PATTERN.test(ctx.slug)) {
        return {
            check: "slug-valid",
            passed: false,
            message: `Invalid slug format "${ctx.slug}". Must match: lowercase alphanumeric, hyphens allowed between words`,
        };
    }

    return {
        check: "slug-valid",
        passed: true,
        message: "Slug format is valid",
    };
}
