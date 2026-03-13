# CodeceptJS Website (Astro)

This repository hosts the CodeceptJS documentation website built with Astro/Starlight.

## Local development

```bash
npm i
npm run dev
```

## Content sync (4.x flow)

The docs sync flow is now:

1. Sync changelog from CodeceptJS `4.x`:

```bash
npm run sync:changelog
```

2. Regenerate unified API pages:

```bash
npm run generate:unified-api
```

3. Build:

```bash
npm run build
```

You can also run the compatibility helper:

```bash
./runok.js update
```

This command now runs `sync:changelog` + `generate:unified-api` (legacy 3.x VuePress sync was removed).
