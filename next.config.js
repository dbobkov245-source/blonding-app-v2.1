/** @type {import('next').NextConfig} */

// 1. Импортируем 'next-pwa'
const withPWA = require('next-pwa')({
  dest: 'public', // Куда складывать service-worker
  register: true, // Автоматически регистрировать
  skipWaiting: true, // Не ждать, пока пользователь закроет вкладку
  disable: process.env.NODE_ENV === 'development' // Отключаем в режиме разработки
});

// 2. Оборачиваем наш конфиг в 'withPWA'
const nextConfig = withPWA({
  reactStrictMode: true,
  // (здесь могут быть другие твои настройки, если они появятся)
});

module.exports = nextConfig;
