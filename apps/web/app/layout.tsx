import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="th" className="dark">
      <body className="min-h-screen bg-[#070d0a] text-[#eef8f2] antialiased">
        {children}
      </body>
    </html>
  );
}
