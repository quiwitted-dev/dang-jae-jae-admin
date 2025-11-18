import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import ModalProvider from '@/components/providers/ModalProviders';
import { cookies } from 'next/headers';

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
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('userAccessToken');

  const isLoggedIn = !!accessToken;
  return (
    <html lang="ko">
      <body
        className={`${playfairDisplay.variable} antialiased bg-black text-white font-sans`}
      >
        <Header isLoggedIn={isLoggedIn} />
        {children}
        <ModalProvider />
        <script
          type="text/javascript"
          src="//dapi.kakao.com/v2/maps/sdk.js?appkey=6d905d8b087267b63d28b411765e6994"
        ></script>
      </body>
    </html>
  );
}
