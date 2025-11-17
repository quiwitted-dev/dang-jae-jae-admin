import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import ModalProvider from '@/components/providers/ModalProviders';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${playfairDisplay.variable} antialiased bg-black text-white font-sans`}
      >
        <Header />
        {children}
        <ModalProvider />
      </body>
    </html>
  );
}
