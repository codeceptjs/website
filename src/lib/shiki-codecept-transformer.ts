import type { ShikiTransformer, ThemedToken } from "shiki";

/**
 * Splits Shiki tokens so that the CodeceptJS DSL identifiers get the same
 * highlight as on the landing-page IDE component:
 *
 *   - `I` (the actor) → pink
 *   - `Feature`, `Scenario`, `Before`, `After`, ... → purple keyword
 *
 * Operates via Shiki's `tokens` hook, the only transformer hook that
 * Expressive Code currently supports. Each token may have whitespace folded
 * into it (e.g. `"    I"`), so we split on whole-word matches and re-emit
 * a fresh sequence of tokens, applying our color overrides through the
 * existing dual-theme mechanism (`color` + `--shiki-dark` CSS var).
 */

const CODECEPT_KEYWORDS = [
  "Feature",
  "Scenario",
  "xScenario",
  "Before",
  "After",
  "BeforeSuite",
  "AfterSuite",
  "Background",
  "Data",
];

const SPECIAL_RE = new RegExp(
  `\\b(I|${CODECEPT_KEYWORDS.join("|")})\\b`,
  "g"
);

type SpecialKind = "actor" | "keyword" | null;

const specialKindFor = (text: string): SpecialKind => {
  if (text === "I") return "actor";
  if (CODECEPT_KEYWORDS.includes(text)) return "keyword";
  return null;
};

// Set color + bold on the token. Light-mode color is rendered as-is;
// dark-mode override is applied via CSS attribute selectors on
// `[style*="--0:#..."][style*="fw:bold"]` (see custom.css).
const colorize = (
  base: ThemedToken,
  text: string,
  kind: SpecialKind
): ThemedToken => {
  if (!kind) {
    return { ...base, content: text };
  }
  const lightColor = kind === "actor" ? "#db2777" : "#7c3aed";
  return {
    ...base,
    content: text,
    color: lightColor,
    fontStyle: 2,
  };
};

export const codeceptShikiTransformer: ShikiTransformer = {
  name: "codecept-dsl-highlight",
  tokens(lines) {
    return lines.map((line) => {
      const out: ThemedToken[] = [];
      for (const tok of line) {
        const text = tok.content;
        SPECIAL_RE.lastIndex = 0;
        if (!SPECIAL_RE.test(text)) {
          out.push(tok);
          continue;
        }
        let lastIdx = 0;
        SPECIAL_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = SPECIAL_RE.exec(text)) !== null) {
          if (m.index > lastIdx) {
            out.push(colorize(tok, text.slice(lastIdx, m.index), null));
          }
          out.push(colorize(tok, m[1], specialKindFor(m[1])));
          lastIdx = m.index + m[1].length;
        }
        if (lastIdx < text.length) {
          out.push(colorize(tok, text.slice(lastIdx), null));
        }
      }
      return out;
    });
  },
};
