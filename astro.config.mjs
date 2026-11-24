import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  site: 'https://mutulab.pages.dev',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
});
