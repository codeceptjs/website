# CodeceptJS Website (Astro)

This repository hosts the CodeceptJS documentation website built with Astro/Starlight.

## Local development

```bash
npm i
npm run dev
```

## Content sync (4.x flow)

The docs sync flow is now:

1. Regenerate unified API pages:

```bash
npm run generate:unified-api
```

2. Build:

```bash
npm run build
```

You can also run the compatibility helper:

```bash
bunosh docs:update
```

This command now runs `generate:unified-api` (legacy 3.x VuePress sync was removed).
