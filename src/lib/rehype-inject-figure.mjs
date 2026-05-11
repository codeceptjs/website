import { visit } from 'unist-util-visit';
import { fromHtml } from 'hast-util-from-html';
import fs from 'node:fs';
import path from 'node:path';

const DOCS_ROOT = path.join(process.cwd(), 'src', 'content', 'docs');
const PUBLIC_ROOT = path.join(process.cwd(), 'public');

function fileSlug(filePath) {
  if (!filePath) return null;
  const rel = path.relative(DOCS_ROOT, filePath);
  if (rel.startsWith('..')) return null;
  return rel.replace(/\.(md|mdx)$/i, '').split(path.sep).join('/');
}

function headingText(node) {
  let out = '';
  visit(node, 'text', (n) => { out += n.value; });
  return out.trim();
}

const svgCache = new Map();
function loadInlineSvg(srcUrl) {
  if (svgCache.has(srcUrl)) return svgCache.get(srcUrl);
  const filePath = path.join(PUBLIC_ROOT, srcUrl.replace(/^\//, ''));
  const raw = fs.readFileSync(filePath, 'utf8');
  // Parse as a fragment so we get the <svg> root element back as a hast node.
  const tree = fromHtml(raw, { fragment: true });
  const svgNode = tree.children.find(
    (c) => c.type === 'element' && c.tagName === 'svg'
  );
  if (!svgNode) throw new Error(`No <svg> root in ${filePath}`);
  svgCache.set(srcUrl, svgNode);
  return svgNode;
}

function buildFigureChild(cfg) {
  // Inline SVG content so the browser uses the page's loaded fonts. An <img>
  // tag would render the SVG in "secure static mode" — external @font-face
  // declarations don't load there, so titles fall back to serif.
  if (cfg.src.toLowerCase().endsWith('.svg')) {
    const svgNode = loadInlineSvg(cfg.src);
    const cloned = structuredClone(svgNode);
    cloned.properties = cloned.properties ?? {};
    // Drop fixed width/height so it scales to the figure's max-width.
    delete cloned.properties.width;
    delete cloned.properties.height;
    if (cfg.alt && !cloned.properties.role) {
      cloned.properties.role = 'img';
      cloned.properties['aria-label'] = cfg.alt;
    }
    return cloned;
  }
  const imgProps = { src: cfg.src, alt: cfg.alt ?? '', loading: 'lazy' };
  if (cfg.width) imgProps.width = cfg.width;
  if (cfg.height) imgProps.height = cfg.height;
  return { type: 'element', tagName: 'img', properties: imgProps, children: [] };
}

function buildFigure(cfg) {
  const children = [buildFigureChild(cfg)];
  if (cfg.captionHtml) {
    const parsed = fromHtml(cfg.captionHtml, { fragment: true });
    children.push({
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: parsed.children,
    });
  } else if (cfg.caption) {
    children.push({
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: [{ type: 'text', value: cfg.caption }],
    });
  }
  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: cfg.className ? [cfg.className] : ['injected-figure'] },
    children,
  };
}

export default function rehypeInjectFigure(options = {}) {
  const injections = options.injections ?? [];
  const bySlug = new Map();
  for (const cfg of injections) {
    if (!cfg.slug || !cfg.afterHeading || !cfg.src) {
      console.warn('[rehype-inject-figure] skipping invalid entry:', cfg);
      continue;
    }
    if (!bySlug.has(cfg.slug)) bySlug.set(cfg.slug, []);
    bySlug.get(cfg.slug).push(cfg);
  }

  return (tree, file) => {
    const slug = fileSlug(file?.path);
    if (!slug) return;
    const entries = bySlug.get(slug);
    if (!entries?.length) return;

    const remaining = new Map(entries.map((e) => [e.afterHeading.trim().toLowerCase(), e]));

    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index == null) return;
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const key = headingText(node).toLowerCase();
      const cfg = remaining.get(key);
      if (!cfg) return;
      remaining.delete(key);

      // If `replace` is set, swap the next matching sibling within the section
      // (i.e. before the next heading of any level) with the figure.
      if (cfg.replace) {
        for (let i = index + 1; i < parent.children.length; i++) {
          const sibling = parent.children[i];
          if (sibling.type !== 'element') continue;
          if (/^h[1-6]$/.test(sibling.tagName)) break; // crossed section boundary
          if (sibling.tagName === cfg.replace) {
            parent.children.splice(i, 1, buildFigure(cfg));
            return [visit.SKIP, i + 1];
          }
        }
        console.warn(
          `[rehype-inject-figure] ${slug}.md: no <${cfg.replace}> found after "${cfg.afterHeading}" — falling back to insert-after-heading`
        );
      }

      // `before: true` puts the figure immediately before the matched heading
      // instead of after — useful when the heading marks the start of the
      // section the diagram introduces.
      const insertAt = cfg.before ? index : index + 1;
      parent.children.splice(insertAt, 0, buildFigure(cfg));
      return [visit.SKIP, insertAt + 1];
    });

    for (const [, cfg] of remaining) {
      console.warn(
        `[rehype-inject-figure] ${slug}.md: heading "${cfg.afterHeading}" not found — figure ${cfg.src} not injected`
      );
    }
  };
}
