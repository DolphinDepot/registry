import { readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { manifestExists } from "./checks/manifest-exists.js";
import { manifestValid } from "./checks/manifest-valid.js";
import { manifestAscii } from "./checks/manifest-ascii.js";
import { slugValid } from "./checks/slug-valid.js";
import { reportEntry, reportSummary } from "./lib/reporter.js";
import type { CheckContext, CheckResult } from "./lib/types.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY_DIR = join(ROOT, "registry");

function getAllSlugs(): string[] {
    if (!existsSync(REGISTRY_DIR)) return [];
    return readdirSync(REGISTRY_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
}

function getChangedSlugs(): string[] {
    try {
        const baseRef = process.env.BASE_REF;
        const diffTarget = baseRef ? `origin/${baseRef}...HEAD` : "HEAD~1";

        const diff = execSync(`git diff --name-only ${diffTarget}`, {
            cwd: ROOT,
            encoding: "utf-8",
        });

        const slugs = new Set<string>();

        for (const line of diff.split("\n")) {
            const match = line.match(/^registry\/([^/]+)\/.+$/);
            if (match) slugs.add(match[1]);
        }

        return [...slugs];
    } catch {
        console.log(
            "Could not detect changed files via git diff, falling back to --all",
        );
        return getAllSlugs();
    }
}

async function validateEntry(
    slug: string,
    allSlugs: string[],
): Promise<boolean> {
    const dir = join(REGISTRY_DIR, slug);
    const ctx: CheckContext = { slug, dir, allSlugs };
    const results: CheckResult[] = [
        await manifestExists(ctx),
        manifestValid(ctx),
        manifestAscii(ctx),
        slugValid(ctx),
    ];

    reportEntry(slug, results);

    return results.every((r) => r.passed);
}

async function main(): Promise<void> {
    const allFlag = process.argv.includes("--all");
    const allSlugs = getAllSlugs();
    const slugsToValidate = allFlag ? allSlugs : getChangedSlugs();

    if (slugsToValidate.length === 0) {
        console.log("No registry entries to validate.");
        return;
    }

    console.log(`Validating ${slugsToValidate.length} entries...`);

    let failed = 0;

    for (const slug of slugsToValidate) {
        const passed = await validateEntry(slug, allSlugs);
        if (!passed) failed++;
    }

    reportSummary(slugsToValidate.length, failed);

    if (failed > 0) process.exit(1);
}

main();
