/**
 * CodeceptJS GitHub star count, fetched once per build and shared by every
 * page that renders the header. Never throws: on network errors or rate
 * limits it resolves to `null` and the header shows the link without a count.
 */
const REPO = 'codeceptjs/CodeceptJS';

let starsPromise: Promise<number | null> | undefined;

async function fetchStars(): Promise<number | null> {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const { stargazers_count } = await res.json();
    return typeof stargazers_count === 'number' ? stargazers_count : null;
  } catch {
    return null;
  }
}

export function getGithubStars(): Promise<number | null> {
  starsPromise ??= fetchStars();
  return starsPromise;
}

/** 4123 → "4.1k", 812 → "812". */
export function formatStars(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(count);
}
