import pwa from 'next-pwa';

/** @type {import('next').NextConfig} */
const withPWA = pwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = withPWA({
  reactStrictMode: true,
});

export default nextConfig;
