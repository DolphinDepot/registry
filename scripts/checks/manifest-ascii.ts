import type { CheckContext, CheckResult } from "../lib/types.js";

function collectNonAscii(value: unknown, path: string, out: string[]): void {
    if (typeof value === "string") {
        const bad = [
            ...new Set([...value].filter((ch) => ch.codePointAt(0)! > 127)),
        ];
        for (const ch of bad) {
            const code = ch
                .codePointAt(0)!
                .toString(16)
                .toUpperCase()
                .padStart(4, "0");
            out.push(
                `${path || "/"} contains non-ASCII character U+${code} (${ch})`,
            );
        }
    } else if (Array.isArray(value)) {
        value.forEach((item, i) => collectNonAscii(item, `${path}[${i}]`, out));
    } else if (value !== null && typeof value === "object") {
        for (const [key, item] of Object.entries(value)) {
            collectNonAscii(item, path ? `${path}.${key}` : key, out);
        }
    }
}

export function manifestAscii(ctx: CheckContext): CheckResult {
    if (!ctx.manifest) {
        return {
            check: "manifest-ascii",
            passed: false,
            message: "Skipped (manifest not fetched)",
        };
    }

    const offenders: string[] = [];
    collectNonAscii(ctx.manifest, "", offenders);

    if (offenders.length === 0) {
        return {
            check: "manifest-ascii",
            passed: true,
            message: "Manifest contains only ASCII characters",
        };
    }

    return {
        check: "manifest-ascii",
        passed: false,
        message: offenders.join("; "),
    };
}
