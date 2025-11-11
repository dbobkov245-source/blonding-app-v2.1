import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ru">
        <Head>
          {/* ✅ КРИТИЧНО: Подключите манифест для PWA */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* ✅ PWA Meta Tags */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Blonding App" />
          <meta name="application-name" content="Blonding App" />
          <meta name="msapplication-TileColor" content="#8b5cf6" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          
          {/* ✅ Icons for iOS */}
          <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
          
          {/* ✅ Theme */}
          <meta name="theme-color" content="#8b5cf6" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
