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
        {/* 구글 애드센스 스크립트 (ca-pub- 뒤의 숫자를 본인 아이디로 변경하세요) */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4424569297437395" 
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
