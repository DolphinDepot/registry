import { describe, it, expect } from "vitest";
import { manifestAscii } from "../manifest-ascii.js";
import type { CheckContext, Manifest } from "../../lib/types.js";

function makeCtx(manifest?: Manifest): CheckContext {
    return { slug: "test-app", dir: "/tmp", allSlugs: ["test-app"], manifest };
}

const validManifest: Manifest = {
    name: "Test App",
    author: "tester",
    description_short: "A test application",
    description_long: "A longer description - with ASCII hyphen.",
    category: "games",
    license: { spdx: "MIT" },
    source: {
        type: "github_release",
        repository: "owner/repo",
        asset_pattern: "*.dol",
    },
    treatments: [{ treatment: "archive.extract", arguments: ["*.zip", "."] }],
};

describe("manifestAscii", () => {
    it("passes with an ASCII-only manifest", () => {
        const result = manifestAscii(makeCtx(validManifest));

        expect(result.passed).toBe(true);
        expect(result.check).toBe("manifest-ascii");
    });

    it("passes when optional description_long is missing", () => {
        const { description_long, ...withoutLong } = validManifest;
        const result = manifestAscii(makeCtx(withoutLong as Manifest));

        expect(result.passed).toBe(true);
    });

    it("skips when manifest is not fetched", () => {
        const result = manifestAscii(makeCtx());

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/Skipped/);
    });

    it("fails on em dashes in description_long (cubiboot regression)", () => {
        const result = manifestAscii(
            makeCtx({
                ...validManifest,
                description_long:
                    "Cubiboot New UI uses the native GameCube menu to present games and homebrew from ODE devices—including FlippyDrive, CUBE-ODE, and GC Loader—and SD card adapters.",
            }),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/description_long/);
        expect(result.message).toMatch(/U\+2014/);
    });

    it("fails on non-ASCII in name, author, and description_short", () => {
        for (const field of ["name", "author", "description_short"] as const) {
            const result = manifestAscii(
                makeCtx({ ...validManifest, [field]: "café" }),
            );

            expect(result.passed).toBe(false);
            expect(result.message).toMatch(new RegExp(field));
        }
    });

    it("fails on non-ASCII in nested fields", () => {
        const result = manifestAscii(
            makeCtx({
                ...validManifest,
                license: { spdx: "MIT", notes: "Licence — see file" },
            }),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/license\.notes/);
    });
});
