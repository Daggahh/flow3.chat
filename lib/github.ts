const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

interface GitHubRepoStats {
  stargazers_count: number;
  forks_count: number;
}

export async function getGitHubStats(
  owner: string,
  repo: string
): Promise<GitHubRepoStats | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    // Add authorization header if token exists
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();
    return {
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub stats:", error);
    return null;
  }
}
