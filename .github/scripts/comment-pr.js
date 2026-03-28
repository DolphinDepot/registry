const marker = "<!-- test-manifest-results -->";

module.exports = async ({ github, context }) => {
    const testResults = process.env.COMMENT_BODY;
    if (!testResults) return;

    const validateOutput = process.env.VALIDATE_OUTPUT || "";

    let body = `${marker}\n## Manifest Validation Results\n\n`;

    if (validateOutput) {
        body += `### Schema Validation\n\n\`\`\`\n${validateOutput}\n\`\`\`\n\n`;
    }

    body += `### Build Test\n\n`;
    body += testResults;

    const { data: comments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
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
            issue_number: context.issue.number,
            body,
        });
    }
};
