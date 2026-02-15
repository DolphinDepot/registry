import { getRepoInfo } from "../lib/github.js";
import type { CheckContext, CheckResult } from "../lib/types.js";

export async function repoExists(ctx: CheckContext): Promise<CheckResult> {
  if (!ctx.sourceConfig) {
    return {
      check: "repo-exists",
      passed: false,
      message: "Skipped (no source config)",
    };
  }

  if (ctx.sourceConfig.source.type === "local") {
    return {
      check: "repo-exists",
      passed: true,
      message: "Skipped (local source)",
    };
  }

  const url = ctx.sourceConfig.source.repository!;
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)$/);

  if (!match) {
    return {
      check: "repo-exists",
      passed: false,
      message: `Cannot parse repository URL: ${url}`,
    };
  }

  ctx.repoOwner = match[1];
  ctx.repoName = match[2];

  const info = await getRepoInfo(ctx.repoOwner, ctx.repoName);

  if (info.exists) {
    ctx.defaultBranch = info.default_branch;
    return {
      check: "repo-exists",
      passed: true,
      message: `Repository exists (default branch: ${info.default_branch})`,
    };
  }

  return {
    check: "repo-exists",
    passed: false,
    message: `Repository not found: ${url}`,
  };
}
