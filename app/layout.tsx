import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '숫자 매칭 퍼즐',
  description: '상위 1%만 맞히는 비밀번호 추리 게임',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#1F2937" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
