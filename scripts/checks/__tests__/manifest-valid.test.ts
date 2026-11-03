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
    license: { spdx: "MIT" },
    source: {
        type: "github_release",
        repository: "owner/repo",
        asset_pattern: "*.dol",
    },
    treatments: [{ treatment: "archive.extract", arguments: ["*.zip", "."] }],
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

    it("fails when license is missing", () => {
        const { license, ...withoutLicense } = validManifest;
        const result = manifestValid(makeCtx(withoutLicense as Manifest));

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/license/);
    });

    it("fails when license.spdx is missing", () => {
        const result = manifestValid(
            makeCtx({ ...validManifest, license: {} as any }),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/spdx/);
    });

    it("accepts NOASSERTION with notes for unclear licenses", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                license: {
                    spdx: "NOASSERTION",
                    notes: "Author unknown, no LICENSE file found.",
                },
            }),
        );

        expect(result.passed).toBe(true);
    });

    it("accepts a relative license url", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                license: { spdx: "MIT", url: "LICENSE.md" },
            }),
        );

        expect(result.passed).toBe(true);
    });

    it("accepts compound SPDX expressions", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                license: { spdx: "MIT OR Apache-2.0" },
            }),
        );

        expect(result.passed).toBe(true);
    });

    it("accepts external_resources of type assets alongside source", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                external_resources: [
                    {
                        type: "assets",
                        label: "Original DOOM WAD",
                        url: "https://example.com/doom",
                        notes: "Place doom1.wad next to the .dol after install",
                    },
                ],
            }),
        );

        expect(result.passed).toBe(true);
    });

    it("accepts external download in place of source", () => {
        const { source, ...withoutSource } = validManifest;
        const result = manifestValid(
            makeCtx({
                ...(withoutSource as Manifest),
                external_resources: [
                    {
                        type: "download",
                        label: "Download from author's site",
                        url: "https://example.com/app.zip",
                        notes: "License does not permit redistribution",
                    },
                ],
            }),
        );

        expect(result.passed).toBe(true);
    });

    it("fails when neither source nor a download external_resource is present", () => {
        const { source, ...withoutSource } = validManifest;
        const result = manifestValid(makeCtx(withoutSource as Manifest));

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/source|external_resources/);
    });

    it("fails when source is omitted and external_resources only has assets", () => {
        const { source, ...withoutSource } = validManifest;
        const result = manifestValid(
            makeCtx({
                ...(withoutSource as Manifest),
                external_resources: [
                    {
                        type: "assets",
                        label: "Extra assets",
                        url: "https://example.com/assets",
                    },
                ],
            }),
        );

        expect(result.passed).toBe(false);
    });

    it("fails when external_resources entry has unknown type", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                external_resources: [
                    {
                        type: "manual" as any,
                        label: "Foo",
                        url: "https://example.com/foo",
                    },
                ],
            }),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/type/);
    });

    it("fails when external_resources url is not absolute", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                external_resources: [
                    {
                        type: "assets",
                        label: "Local file",
                        url: "not-a-url",
                    },
                ],
            }),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/url|uri/);
    });

    it("fails when a text field has leading or trailing whitespace", () => {
        const result = manifestValid(
            makeCtx({ ...validManifest, description_short: "A test app " }),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/description_short/);
    });

    it("accepts multi-line text without surrounding whitespace", () => {
        const result = manifestValid(
            makeCtx({ ...validManifest, name: "Test\nApp" }),
        );

        expect(result.passed).toBe(true);
    });

    it("fails when platforms or peripherals contain duplicates", () => {
        const result = manifestValid(
            makeCtx({
                ...validManifest,
                platforms: ["gamecube", "gamecube"],
                peripherals: ["controller", "controller"],
            } as any),
        );

        expect(result.passed).toBe(false);
        expect(result.message).toMatch(/platforms.*duplicate/);
        expect(result.message).toMatch(/peripherals.*duplicate/);
    });
});
