import { visit } from 'unist-util-visit';
import path from 'node:path';

const DOCS_ROOT = path.join(process.cwd(), 'src', 'content', 'docs');

// Only the generated unified-API pages have `I.method()` headings.
const TARGET_SLUGS = new Set(['web-api', 'mobile-api']);

// Generated headings are exactly `I.<method>()` (see generate-unified-api.mjs).
const METHOD_HEADING = /^I\.[A-Za-z_$][\w$]*\(\)$/;

const HEADINGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function fileSlug(filePath) {
  if (!filePath) return null;
  const rel = path.relative(DOCS_ROOT, filePath);
  if (rel.startsWith('..')) return null;
  return rel.replace(/\.(md|mdx)$/i, '').split(path.sep).join('/');
}

function textContent(node) {
  let out = '';
  visit(node, 'text', (n) => { out += n.value; });
  return out;
}

// Find the first text node and its parent array so we can split it in place.
function firstTextSlot(node) {
  if (!node.children) return null;
  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];
    if (child.type === 'text' && child.value.length > 0) {
      return { siblings: node.children, index: i };
    }
    if (child.type === 'element') {
      const found = firstTextSlot(child);
      if (found) return found;
    }
  }
  return null;
}

// Wrap the leading `I.` of `I.method()` headings in <span class="search-strip">.
// The page still renders `I.method()` (span keeps the text, so the heading slug
// stays e.g. `iclick`), but docs-scraper's `selectors_exclude: [".search-strip"]`
// removes the prefix before indexing, so search matches `method()` at word 0.
export default function rehypeSearchStrip() {
  return (tree, file) => {
    const slug = fileSlug(file?.path);
    if (!slug || !TARGET_SLUGS.has(slug)) return;

    visit(tree, 'element', (node) => {
      if (!HEADINGS.has(node.tagName)) return;
      if (!METHOD_HEADING.test(textContent(node).trim())) return;

      const slot = firstTextSlot(node);
      if (!slot) return;
      const textNode = slot.siblings[slot.index];
      if (!textNode.value.startsWith('I.')) return;

      const span = {
        type: 'element',
        tagName: 'span',
        properties: { className: ['search-strip'] },
        children: [{ type: 'text', value: 'I.' }],
      };
      const rest = { type: 'text', value: textNode.value.slice(2) };
      slot.siblings.splice(slot.index, 1, span, rest);
    });
  };
}
