import type { CheckResult } from "./types.js";

const isCI = !!process.env.GITHUB_ACTIONS;

export function reportEntry(slug: string, results: CheckResult[]): void {
  const allPassed = results.every((r) => r.passed);
  const icon = allPassed ? "\u2705" : "\u274c";

  console.log(`\n${icon} ${slug}`);

  for (const r of results) {
    const status = r.passed ? "  \u2714" : "  \u2718";
    console.log(`${status} ${r.check}: ${r.message}`);

    if (!r.passed && isCI) {
      console.log(`::error::${slug}: ${r.check} - ${r.message}`);
    }
  }
}

export function reportSummary(total: number, failed: number): void {
  console.log(`\n--- Summary ---`);
  console.log(`Total entries: ${total}`);
  console.log(`Passed: ${total - failed}`);
  console.log(`Failed: ${failed}`);
}
