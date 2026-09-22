/**
 * Blog posts under src/content/docs/blog, newest first (by frontmatter `date`).
 * Read from disk so astro.config.mjs can build the Blog sidebar and every
 * "Blog" link points at the latest post without manual edits.
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'docs', 'blog');

export interface BlogPost {
  label: string;
  link: string;
  date: string;
}

function frontmatterField(frontmatter: string, field: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return match?.[1].trim().replace(/^(['"])(.*)\1$/, '$2');
}

export function getBlogPosts(): BlogPost[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => {
      const text = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      const slug = file.replace(/\.mdx?$/, '');
      return {
        label: frontmatterField(frontmatter, 'title') ?? slug,
        link: `blog/${slug}`,
        date: frontmatterField(frontmatter, 'date') ?? '',
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Absolute URL of the newest post, e.g. `/blog/codeceptjs-4-2/`. */
export function latestBlogPostUrl(): string {
  const [latest] = getBlogPosts();
  return latest ? `/${latest.link}/` : '/release/';
}
