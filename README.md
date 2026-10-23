# INFINITE — Generative Art Studio

A browser-based generative artwork built with React, TypeScript, Vite, and Canvas 2D. The canvas draws a procedurally generated organic silhouette as a continuously cycling stack of colored paper-like layers.

## Run locally

Install Node.js 18 or newer, then run:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```sh
npm run build
npm run preview
```

## Controls

- Draw a replacement silhouette with a mouse, trackpad, or touchscreen; use **Reset shape** to restore the original.
- Select a preset palette or customize two or three colors.
- Adjust animation speed, contour spacing, layer count, rotation, and shape complexity.
- Reverse the travel direction, pause/resume, or reset the complete artwork.
- The animation starts paused when the operating system requests reduced motion.
