import type { ThemeRegistration } from "shiki";

/**
 * Custom Shiki themes that mirror the hero panel palette.
 * Light/dark mode tokens match the hero's CSS vars (--hc-key, --hc-str, --hc-I, --hc-txt).
 */

export const codeceptLight: ThemeRegistration = {
  name: "codecept-light",
  type: "light",
  bg: "#ffffff",
  fg: "#1f2937",
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#1f2937",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#6b7280", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.declaration",
        "keyword.import",
      ],
      settings: { foreground: "#7c3aed" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
      settings: { foreground: "#0369a1" },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: "#b45309" },
    },
    {
      scope: ["constant.language.boolean", "constant.language.null"],
      settings: { foreground: "#7c3aed" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function"],
      settings: { foreground: "#1f2937", fontStyle: "" },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.class", "support.type"],
      settings: { foreground: "#db2777" },
    },
    {
      scope: ["variable.parameter"],
      settings: { foreground: "#1f2937" },
    },
    {
      scope: ["variable.other.property", "meta.property.object"],
      settings: { foreground: "#1f2937" },
    },
    {
      scope: ["punctuation", "punctuation.accessor", "meta.brace", "meta.delimiter"],
      settings: { foreground: "#4b5563" },
    },
    {
      scope: ["keyword.operator"],
      settings: { foreground: "#4b5563" },
    },
  ],
};

export const codeceptDark: ThemeRegistration = {
  name: "codecept-dark",
  type: "dark",
  bg: "#0d1117",
  fg: "#c9d1d9",
  colors: {
    "editor.background": "#0d1117",
    "editor.foreground": "#c9d1d9",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8b949e", fontStyle: "italic" },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "storage",
        "storage.type",
        "storage.modifier",
        "keyword.declaration",
        "keyword.import",
      ],
      settings: { foreground: "#c084fc" },
    },
    {
      scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"],
      settings: { foreground: "#7dd3fc" },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: "#fbbf24" },
    },
    {
      scope: ["constant.language.boolean", "constant.language.null"],
      settings: { foreground: "#c084fc" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call entity.name.function"],
      settings: { foreground: "#e5e7eb", fontStyle: "" },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.class", "support.type"],
      settings: { foreground: "#f472b6" },
    },
    {
      scope: ["variable.parameter"],
      settings: { foreground: "#c9d1d9" },
    },
    {
      scope: ["variable.other.property", "meta.property.object"],
      settings: { foreground: "#c9d1d9" },
    },
    {
      scope: ["punctuation", "punctuation.accessor", "meta.brace", "meta.delimiter"],
      settings: { foreground: "#9ca3af" },
    },
    {
      scope: ["keyword.operator"],
      settings: { foreground: "#9ca3af" },
    },
  ],
};
