import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ru">
        <Head>
          {/* Viewport для мобильных устройств - КРИТИЧНО для APK */}
          <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, viewport-fit=cover" />

          {/* TWA/APK оптимизация */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Blonding" />
          <meta name="application-name" content="Blonding App" />

          {/* Favicon */}
          <link rel="icon" href="/icon-192x192.png" />

          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* PWA Meta Tags */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Blonding" />
          <meta name="application-name" content="Blonding App" />
          <meta name="msapplication-TileColor" content="#8b5cf6" />
          <meta name="msapplication-TileImage" content="/icon-144x144.png" />

          {/* Icons for iOS */}
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

          {/* Theme Color */}
          <meta name="theme-color" content="#8b5cf6" />
          <meta name="theme-color" media="(prefers-color-scheme: light)" content="#8b5cf6" />
          <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#6d28d9" />

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Blonding App" />
          <meta property="og:title" content="Blonding App - Обучение Блондированию" />
          <meta property="og:description" content="PWA для обучения техникам блондирования с AI-консультантом и интерактивными тестами" />
          <meta property="og:image" content="/icon-512x512.png" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Blonding App" />
          <meta name="twitter:description" content="Обучение техникам блондирования с AI" />
          <meta name="twitter:image" content="/icon-512x512.png" />

          {/* Service Worker Registration - для PWABuilder */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('Service Worker registered:', registration.scope);
                      },
                      function(err) {
                        console.log('Service Worker registration failed:', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
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
