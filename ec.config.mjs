import { defineEcConfig } from '@astrojs/starlight/expressive-code';
import { codeceptDark, codeceptLight } from './src/lib/shiki-themes.ts';
import { codeceptShikiTransformer } from './src/lib/shiki-codecept-transformer.ts';

export default defineEcConfig({
  themes: [codeceptDark, codeceptLight],
  themeCssSelector: (theme) =>
    theme.name === 'codecept-dark'
      ? '[data-theme="dark"]'
      : '[data-theme="light"]',
  styleOverrides: {
    codeFontFamily:
      "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    codeFontSize: '15px',
    codeLineHeight: '2',
    codePaddingBlock: '1.1rem',
    codePaddingInline: '1.1rem',
    borderRadius: '0.5rem',
    frames: {
      shadowColor: 'rgba(0, 0, 0, 0.08)',
    },
  },
  shiki: {
    transformers: [codeceptShikiTransformer],
  },
});
