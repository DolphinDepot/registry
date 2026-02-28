import { accessSync, constants, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CheckContext, CheckResult } from "../lib/types.js";

export async function manifestExists(ctx: CheckContext): Promise<CheckResult> {
    const manifestPath = join(ctx.dir, "manifest.json");
    let raw: string;

    try {
        accessSync(manifestPath, constants.F_OK | constants.R_OK);
    } catch (err) {
        return {
            check: "manifest-exists",
            passed: false,
            message:
                "manifest.json not found in entry directory or not readable",
        };
    }

    try {
        ctx.manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
        return {
            check: "manifest-exists",
            passed: true,
            message: "manifest.json found and valid JSON",
        };
    } catch {
        return {
            check: "manifest-exists",
            passed: false,
            message: "manifest.json exists but is not valid JSON",
        };
    }
}
