const fs = require("fs");
const path = require("path");

const marker = "<!-- test-manifest-results -->";

module.exports = async ({ github, context, dir }) => {
    const read = (name) => {
        const file = path.join(dir, name);
        return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    };

    const testResults = read("comment.md");
    if (!testResults) return;

    const issueNumber = Number(read("pr-number"));
    if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
        throw new Error("Invalid PR number in artifact");
    }

    const validateOutput = read("validate.txt");

    let body = `${marker}\n## Manifest Validation Results\n\n`;

    if (validateOutput) {
        body += `### Schema Validation\n\n\`\`\`\n${validateOutput}\n\`\`\`\n\n`;
    }

    body += `### Build Test\n\n`;
    body += testResults;

    const { data: comments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
    });

    const existing = comments.find((c) => c.body?.includes(marker));

    if (existing) {
        await github.rest.issues.updateComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: existing.id,
            body,
        });
    } else {
        await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: issueNumber,
            body,
        });
    }
};
