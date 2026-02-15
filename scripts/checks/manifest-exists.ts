import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRawFile } from "../lib/github.js";
import type { CheckContext, CheckResult } from "../lib/types.js";

export async function manifestExists(ctx: CheckContext): Promise<CheckResult> {
  if (ctx.sourceConfig?.source.type === "local") {
    const manifestPath = join(ctx.dir, "dolphin-depot.json");
    let raw: string;
    try {
      raw = readFileSync(manifestPath, "utf-8");
    } catch {
      return {
        check: "manifest-exists",
        passed: false,
        message: "dolphin-depot.json not found in entry directory",
      };
    }
    try {
      ctx.manifest = JSON.parse(raw);
      return {
        check: "manifest-exists",
        passed: true,
        message: "dolphin-depot.json found (local)",
      };
    } catch {
      return {
        check: "manifest-exists",
        passed: false,
        message: "dolphin-depot.json exists but is not valid JSON",
      };
    }
  }

  if (!ctx.repoOwner || !ctx.repoName || !ctx.defaultBranch) {
    return {
      check: "manifest-exists",
      passed: false,
      message: "Skipped (repo check failed)",
    };
  }

  const result = await getRawFile(
    ctx.repoOwner,
    ctx.repoName,
    ctx.defaultBranch,
    "dolphin-depot.json",
  );

  if (result.found && result.content) {
    try {
      ctx.manifest = JSON.parse(result.content);
      return {
        check: "manifest-exists",
        passed: true,
        message: "dolphin-depot.json found",
      };
    } catch {
      return {
        check: "manifest-exists",
        passed: false,
        message: "dolphin-depot.json exists but is not valid JSON",
      };
    }
  }

  return {
    check: "manifest-exists",
    passed: false,
    message: "dolphin-depot.json not found in repository root",
  };
}
