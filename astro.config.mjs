import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Pages are prerendered. /api/* and /admin run as Vercel functions.
export default defineConfig({
  site: 'https://laroyaltine.example',
  adapter: vercel(),
  devToolbar: { enabled: false },
  security: {
    allowedDomains: [
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
      { hostname: '*.vercel.app', protocol: 'https' },
    ],
  },
});
