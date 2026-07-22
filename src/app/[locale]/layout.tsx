import type { Metadata } from 'next';
import { Inter, Brygada_1918 } from 'next/font/google';
import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Lightbox from '@/components/Lightbox';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const brygada = Brygada_1918({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-brygada',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title') || 'Văn hóa Chăm — Khánh Hòa',
    description: t('desc') || 'Di sản sống trong dòng chảy Việt Nam',
    icons: {
      icon: '/favicon.png',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang={locale} className={`${inter.variable} ${brygada.variable} scroll-smooth`}>
      <body>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });

                // Tự động phát hiện và gửi sự kiện Tìm kiếm về GA4 khi có tham số q, s, hoặc search trên URL
                try {
                  const urlParams = new URLSearchParams(window.location.search);
                  const searchWord = urlParams.get('q') || urlParams.get('s') || urlParams.get('search');
                  if (searchWord) {
                    gtag('event', 'search', {
                      search_term: searchWord
                    });
                  }

                  // Tự động phát hiện và gửi sự kiện Quét mã QR khi phát hiện truy cập từ mã QR
                  const isFromQr = urlParams.get('utm_source') === 'qr' || 
                                   urlParams.get('qr') === 'true' || 
                                   urlParams.get('ref') === 'qr' || 
                                   urlParams.get('utm_medium') === 'qr' ||
                                   !!urlParams.get('qr_id');
                  if (isFromQr) {
                    gtag('event', 'qr_scan', {
                      qr_id: urlParams.get('qr_id') || urlParams.get('utm_campaign') || 'default'
                    });
                  }
                } catch (e) {
                  console.error('GA4 custom event tracking error:', e);
                }
              `}
            </Script>
          </>
        )}
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          <div className="relative min-h-screen flex flex-col justify-between">
            {children}
          </div>
          <Footer locale={locale} />
          <Lightbox />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
