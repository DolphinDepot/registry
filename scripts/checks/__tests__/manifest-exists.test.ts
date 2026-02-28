import { vol } from "memfs";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CheckContext } from "../../lib/types.js";

vi.mock("node:fs", async () => {
    const memfs = await vi.importActual<typeof import("memfs")>("memfs");
    return memfs.fs;
});

import { manifestExists } from "../manifest-exists.js";

function makeCtx(overrides?: Partial<CheckContext>): CheckContext {
    return {
        slug: "test-app",
        dir: "/tmp",
        allSlugs: ["test-app"],
        ...overrides,
    };
}

describe("manifestExists", () => {
    beforeEach(() => {
        vol.reset();
    });

    it("reads local manifest", async () => {
        const manifest = JSON.stringify({ name: "Local App" });
        vol.fromJSON({ "/entry/manifest.json": manifest });

        const ctx = makeCtx({
            dir: "/entry",
        });
        const result = await manifestExists(ctx);

        expect(result.passed).toBe(true);
        expect(result.message).toMatch(/found and valid JSON/);
        expect(ctx.manifest).toEqual({ name: "Local App" });
    });

    it("fails when local manifest is missing", async () => {
        vol.fromJSON({ "/entry": null });

        const ctx = makeCtx({
            dir: "/entry",
        });
        const result = await manifestExists(ctx);

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(
            /not found in entry directory or not readable/,
        );
    });

    it("fails when local manifest has invalid JSON", async () => {
        vol.fromJSON({ "/entry/manifest.json": "{bad json" });

        const ctx = makeCtx({
            dir: "/entry",
        });
        const result = await manifestExists(ctx);

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/not valid JSON/);
    });
});
