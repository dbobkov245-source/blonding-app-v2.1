import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import InstallPrompt from '../components/InstallPrompt';
import '../index.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <InstallPrompt />
    </Layout>
  );
}

export default MyApp;
