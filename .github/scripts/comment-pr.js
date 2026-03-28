const marker = "<!-- test-manifest-results -->";

module.exports = async ({ github, context }) => {
    const comment = process.env.COMMENT_BODY;
    if (!comment) return;

    const body = `${marker}\n## Manifest Test Results\n\n${comment}`;

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
