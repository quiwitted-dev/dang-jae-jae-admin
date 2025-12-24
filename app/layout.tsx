import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Header from '@/components/layout/Header';
import ModalProvider from '@/components/providers/ModalProviders';
import { cookies } from 'next/headers';
import { getUser } from '@/services/user.api.server';
import { ToastProvider } from '@/components/providers/ToastProvider';
import Footer from '@/components/layout/Footer';

// Playfair Display Google 폰트 설정
const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '당재재',
  description: '당재재',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    user = await getUser();
  } catch (error) {
    user = null;
  }

  const isLoggedIn = !!user;
  return (
    <html lang="ko">
      <body
        className={`${playfairDisplay.variable} antialiased bg-black text-white font-sans`}
      >
        <Suspense fallback={null}>
          <Header isLoggedIn={isLoggedIn} />
        </Suspense>
        <main>{children}</main>
        <ModalProvider />
        <ToastProvider />
        <script
          type="text/javascript"
          src="//dapi.kakao.com/v2/maps/sdk.js?appkey=0dacc0c4e114487ed38c366e80cd1d4b&autoload=false&libraries=services"
        ></script>
        <Footer />
      </body>
    </html>
  );
}
