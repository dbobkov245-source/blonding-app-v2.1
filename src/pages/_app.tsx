import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../index.css'; // Твой global css

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
