// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // site: 'https://tu-dominio.com', // descomenta y pon tu dominio para activar canonical y Open Graph url
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: 'Big Shoulders Display',
      cssVariable: '--font-display',
      provider: fontProviders.fontsource(),
      weights: [800, 900],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial Narrow', 'sans-serif'],
    },
    {
      name: 'Archivo',
      cssVariable: '--font-body',
      provider: fontProviders.fontsource(),
      weights: [400, 500, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'B612 Mono',
      cssVariable: '--font-label',
      provider: fontProviders.fontsource(),
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
