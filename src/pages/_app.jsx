import React from 'react';
import Layout from '../components/Layout'; // 1. Импортируем наш Layout
import '../index.css'; 

export default function MyApp({ Component, pageProps }) {
  return (
    // 2. Оборачиваем все страницы в Layout
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
