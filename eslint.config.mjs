import jsonc from "eslint-plugin-jsonc";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

// Formatting problems are reported as warnings; everything else is an error.
const warn = (rules) =>
    Object.fromEntries(
        Object.entries(rules).map(([name, value]) => [
            name,
            Array.isArray(value) ? ["warn", ...value.slice(1)] : "warn",
        ]),
    );

export default [
    {
        ignores: ["node_modules/", ".claude/", "package-lock.json"],
    },

    // JSON: correctness from jsonc's recommended set, layout matching
    // JSON.stringify(value, null, 4) with a trailing newline.
    ...jsonc.configs["flat/recommended-with-json"],
    {
        files: ["**/*.json"],
        plugins: { "@stylistic": stylistic },
        rules: warn({
            "jsonc/indent": ["error", 4],
            "jsonc/key-spacing": "error",
            "jsonc/comma-style": "error",
            "jsonc/object-curly-newline": ["error", { minProperties: 1 }],
            "jsonc/object-property-newline": "error",
            "jsonc/array-bracket-newline": ["error", { minItems: 1 }],
            "jsonc/array-element-newline": "error",
            "@stylistic/eol-last": "error",
            "@stylistic/no-trailing-spaces": "error",
            "@stylistic/no-multiple-empty-lines": ["error", { max: 0 }],
        }),
    },

    // TypeScript
    ...tseslint.configs.recommended.map((config) => ({
        ...config,
        files: ["**/*.ts"],
    })),
    {
        files: ["**/*.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { ignoreRestSiblings: true },
            ],
        },
    },
    {
        // Tests deliberately pass malformed manifests.
        files: ["**/__tests__/**/*.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    {
        files: ["**/*.ts"],
        plugins: { "@stylistic": stylistic },
        rules: warn({
            ...stylistic.configs.customize({
                indent: 4,
                quotes: "double",
                semi: true,
                commaDangle: "always-multiline",
                braceStyle: "1tbs",
                arrowParens: true,
            }).rules,
            "@stylistic/quotes": [
                "error",
                "double",
                { avoidEscape: true, allowTemplateLiterals: "always" },
            ],
            "@stylistic/quote-props": ["error", "as-needed"],
            "@stylistic/operator-linebreak": [
                "error",
                "after",
                {
                    overrides: {
                        "?": "before",
                        ":": "before",
                        "|": "before",
                        "&": "before",
                    },
                },
            ],
        }),
    },
];
