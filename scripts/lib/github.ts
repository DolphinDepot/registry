const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "dolphin-depot-registry",
};

if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

export async function getRepoInfo(
    owner: string,
    repo: string,
): Promise<{ exists: boolean; default_branch?: string }> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers,
    });

    if (res.status === 200) {
        const data = (await res.json()) as { default_branch: string };
        return { exists: true, default_branch: data.default_branch };
    }

    return { exists: false };
}

export async function getRawFile(
    owner: string,
    repo: string,
    branch: string,
    path: string,
): Promise<{ found: boolean; content?: string }> {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(url, { headers });

    if (res.status === 200) {
        return { found: true, content: await res.text() };
    }

    return { found: false };
}
