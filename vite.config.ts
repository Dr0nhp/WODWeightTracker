import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/** GitHub Pages base: `/repo/` for project sites, `/` for `<user>.github.io` repos. */
function appBase(): string {
  const explicit = process.env.VITE_BASE_PATH?.trim();
  if (explicit) {
    const withSlash = explicit.startsWith('/') ? explicit : `/${explicit}`;
    return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
  }

  const gh = process.env.GITHUB_REPOSITORY;
  if (gh) {
    const repo = gh.split('/')[1];
    if (!repo) return '/';
    if (/^[^/]+\.github\.io$/i.test(repo)) return '/';
    return `/${repo}/`;
  }

  return '/';
}

function manifestIconHref(base: string): string {
  if (base === '/') return '/favicon.svg';
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmed}/favicon.svg`;
}

const base = appBase();

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'WoD Weight Tracker',
        short_name: 'WoD Tracker',
        description: 'CrossFit & Olympic lifting weights, 1RM trends, local-first.',
        theme_color: '#0c1222',
        background_color: '#0c1222',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        icons: [
          {
            src: manifestIconHref(base),
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
});
