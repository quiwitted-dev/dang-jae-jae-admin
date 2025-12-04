import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import ModalProvider from '@/components/providers/ModalProviders';
import { cookies } from 'next/headers';
import { getUser } from '@/services/user.api.server';

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
  const user = await getUser();

  const isLoggedIn = !!user;
  return (
    <html lang="ko">
      <body
        className={`${playfairDisplay.variable} antialiased bg-black text-white font-sans`}
      >
        <Header isLoggedIn={isLoggedIn} />
        <main className="pt-16">{children}</main>
        <ModalProvider />
        <script
          type="text/javascript"
          src="//dapi.kakao.com/v2/maps/sdk.js?appkey=6d905d8b087267b63d28b411765e6994&autoload=false&libraries=services"
        ></script>
        <footer className="text-center my-2">
          당신의재재
          <br />
          사업자등록번호 | 475-46-01292 대표 | 이필순
          <br />
          주소 | 경기도 용인시 수지구 용구대로2790번길 7, 3층 302호 <br />
          연락처 | 010 2465 9954
        </footer>
      </body>
    </html>
  );
}
