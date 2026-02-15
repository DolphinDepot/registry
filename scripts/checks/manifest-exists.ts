import { getRawFile } from "../lib/github.js";
import type { CheckContext, CheckResult } from "../lib/types.js";

export async function manifestExists(ctx: CheckContext): Promise<CheckResult> {
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
