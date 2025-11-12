import pwa from 'next-pwa';

/** @type {import('next').NextConfig} */
const withPWA = pwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // ✅ Стабильность сборки
  buildExcludes: [/middleware-manifest.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig = withPWA({
  reactStrictMode: true,
  // swcMinify: true, // ❌ Устарело в Next.js 15, удалено
});

export default nextConfig;
