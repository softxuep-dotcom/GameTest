# Monster Mail: Night Shift

A compact 2D browser game built with Phaser 3, TypeScript, and Vite. You are the lone clerk at a supernatural post office: inspect each parcel, uncover clues, and stamp it **Accept**, **Return**, or **Quarantine** before the night runs out.

## Play locally

Requires Node.js 20.19+.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

Keyboard controls:

- `1`, `2`, `3`: X-ray, Listen, Aura
- `A`, `R`, `Q`: Accept, Return, Quarantine
- Mouse and touch are fully supported.

## Quality checks

```bash
npm run check
npm test
npm run build
```

## Platform builds

The normal build runs without a portal SDK. Dedicated modes add the matching official SDK script at build time:

```bash
npm run build:poki
npm run build:crazygames
```

Upload the contents of `dist-poki` or `dist-crazygames` as a ZIP, with `index.html` at the ZIP root. Both adapters pause audio during ads, send gameplay start/stop events, and expose one optional rewarded revive.

Before submission, test each build in the portal's official preview/QA tool. Portal ad calls intentionally fall back to no-op behavior during local development.

## Project structure

- `src/game/simulation`: engine-independent run state and rules
- `src/game/content`: shifts, customers, cases, and upgrades
- `src/phaser`: canvas rendering and generated character/parcel art
- `src/ui`: responsive DOM HUD and menus
- `src/platform`: Poki, CrazyGames, and local adapters
- `public/assets`: optimized shipping assets
- `art-source`: source artwork and generation notes
- `marketing`: ready-to-upload landscape, thumbnail, and square store art

## Shipping notes

- Logical canvas: 1280×720, responsive 16:9 landscape layout
- Persistent data: local best score, best night, play count, and mute setting
- Audio: synthesized at runtime with Web Audio; no downloaded sound files
- Text: local system fonts; no remote font request
- Generated art and third-party notices: see [ART_SOURCES.md](./ART_SOURCES.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)
