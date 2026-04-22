import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    routes: {
      extend: {
        include: [{ pattern: '/api/*' }],
      },
    },
  }),
  // CSP not configured here — music has no security middleware. CF Pages
  // headers can carry CSP if needed; see shared/types/security.ts.
  vite: {
    define: {
      'process.env': {},
    },
  },
});
