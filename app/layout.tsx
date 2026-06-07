import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Header from '@/components/layout/Header';
import ModalProvider from '@/components/providers/ModalProviders';
import { getUser } from '@/services/user.api.server';
import { ToastProvider } from '@/components/providers/ToastProvider';
import Footer from '@/components/layout/Footer';
import LogoutUnauthorized from '@/components/common/LogoutUnauthorized';
import { cookies } from 'next/headers';

// Playfair Display Google 폰트 설정
const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '재재인포컴 | 데이터 기반 정비사업 분석 플랫폼',
  description: '재건축 재개발 리모델링 가로정비 지역주택까지 정비사업장의 상세 수치 기반의 스마트한 사업지 비교 분석 시스템입니다.',
  other: {
    'naver-site-verification': '427b353fe4505f1f00a52281d7c903243a70242d',
  },
  openGraph: {
    title: '재재인포컴 | 데이터로 증명하는 정비사업 분석 플랫폼',
    description: '인허가 기반 상세 데이터로 투자 후보지를 스마트하게 비교 분석하세요.',
    url: 'https://www.jaejaeinfo.com',
    type: 'website',
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const hasAuthCookie = !!(await cookieStore).get('userAccessToken');
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
<h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
  재재인포컴 - 데이터 기반 정비사업 투자 분석 및 비교 시스템
</h1>
        <Suspense fallback={null}>
          <Header isLoggedIn={isLoggedIn} />
        </Suspense>
        <main>
          {!user && hasAuthCookie && <LogoutUnauthorized />}
          {children}
        </main>
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
