import json from "@eslint/json";

const local = {
    rules: {
        "eol-last": {
            meta: {
                type: "layout",
                fixable: "whitespace",
                messages: { missing: "Newline required at end of file." },
            },
            create(context) {
                return {
                    Document(node) {
                        const text = context.sourceCode.text;
                        if (text.length > 0 && !text.endsWith("\n")) {
                            context.report({
                                node,
                                loc: context.sourceCode.getLoc(node).end,
                                messageId: "missing",
                                fix: (fixer) =>
                                    fixer.insertTextAfterRange(
                                        [text.length, text.length],
                                        "\n",
                                    ),
                            });
                        }
                    },
                };
            },
        },
    },
};

export default [
    {
        ignores: ["node_modules/", ".claude/", "package-lock.json"],
    },
    {
        files: ["**/*.json"],
        language: "json/json",
        plugins: { json, local },
        rules: {
            ...json.configs.recommended.rules,
            "json/top-level-interop": "error",
            "local/eol-last": "error",
        },
    },
];
