import { describe, it, expect } from "vitest";
import { manifestValid } from "../manifest-valid.js";
import type { CheckContext, Manifest } from "../../lib/types.js";

function makeCtx(manifest?: Manifest): CheckContext {
    return { slug: "test-app", dir: "/tmp", allSlugs: ["test-app"], manifest };
}

const validManifest: Manifest = {
    name: "Test App",
    author: "tester",
    description_short: "A test application",
    category: "games",
    source: {
        type: "github_release",
        repository: "owner/repo",
        asset_pattern: "*.dol",
    },
    treatments: [{ treatment: "decompress", arguments: ["zip"] }],
};

describe("manifestValid", () => {
    it("passes with a valid manifest", () => {
        const result = manifestValid(makeCtx(validManifest));

        expect(result.passed).toBe(true);
        expect(result.check).toBe("manifest-valid");
    });

    it("skips when manifest is not fetched", () => {
        const result = manifestValid(makeCtx());

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/Skipped/);
    });

    it("fails with missing required fields", () => {
        const result = manifestValid(makeCtx({ name: "Test App" } as any));

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(
            /maintainer|description_short|category|source|treatments/,
        );
    });

    it("fails with an invalid category", () => {
        const result = manifestValid(
            makeCtx({ ...validManifest, category: "invalid-cat" } as any),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/category/);
    });

    it("fails with bad treatment shape", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                treatments: [{ treatment: "decompress" }] as any,
            }),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/arguments/);
    });
});
