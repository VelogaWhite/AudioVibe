import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';

const promptFont = Prompt({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-prompt',
});

export const metadata: Metadata = {
  title: 'AudioVibe — Intelligent Music Playlist Generator',
  description:
    'Web Application แนะนำและสร้างเพลย์ลิสต์เพลงตามอารมณ์ด้วยคำสั่งภาษาธรรมชาติและวิเคราะห์ 7 มิติเสียง',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`dark ${promptFont.variable}`}>
      <body className={`${promptFont.className} min-h-screen bg-[#070d0a] text-[#eef8f2] antialiased`}>
        {children}
      </body>
    </html>
  );
}
