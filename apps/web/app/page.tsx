'use client';

import React from 'react';
import Link from 'next/link';
import { Music, Sparkles, Disc, Radio, ArrowRight } from 'lucide-react';
import { BackgroundVibe } from '../components/BackgroundVibe';

export default function LandingPage() {
  const spotifyLoginUrl = 'http://127.0.0.1:3000/auth/spotify/login';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background botanical foliage, vines and flowers */}
      <BackgroundVibe theme="NATURE" />

      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* Animated Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#132c1f] border border-[#214f34] text-[#1ed760] text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Intelligent Music Generator V2</span>
        </div>

        {/* Brand Logo & Name */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1ed760] to-[#0f6832] flex items-center justify-center shadow-lg shadow-[#1ed760]/20">
            <Music className="w-8 h-8 text-[#05160b]" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white">
            Audio<span className="text-[#1ed760]">Vibe</span>
          </h1>
        </div>

        {/* Slogan */}
        <p className="text-xl font-medium text-[#c8e6d4] italic mb-6">
          &ldquo;Play music... With your style&rdquo;
        </p>

        {/* Description */}
        <p className="text-sm text-[#8ea899] max-w-md leading-relaxed mb-10">
          สร้างและแนะนำเพลย์ลิสต์เพลงตามอารมณ์ด้วยคำสั่งภาษาธรรมชาติ (Natural Language Prompt) 
          พร้อมการวิเคราะห์ 7 มิติเสียงเชิงลึก (Radar Chart) และเชื่อมต่อไปยัง Spotify ได้จริง
        </p>

        {/* Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <a
            href={spotifyLoginUrl}
            className="flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-extrabold text-base bg-[#1ed760] hover:bg-[#1db954] text-[#051409] shadow-xl shadow-[#1ed760]/25 transition-all hover:scale-105 active:scale-95"
          >
            <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Connect to your Spotify account</span>
          </a>

          {/* Quick Studio Demo Access */}
          <Link
            href="/studio"
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm bg-[#13281c] hover:bg-[#1a3827] border border-[#275038] text-[#cbead6] transition-all hover:scale-105"
          >
            <span>เข้าสู่ Studio ตรง</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-3 mt-14 w-full pt-8 border-t border-[#1b3b29]/60">
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#0e1c15]/60 border border-[#1b3627]">
            <Radio className="w-5 h-5 text-[#1ed760] mb-1" />
            <span className="text-xs font-semibold text-white">7-Axis Radar</span>
            <span className="text-[11px] text-[#70947e]">วิเคราะห์มิติเสียง</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#0e1c15]/60 border border-[#1b3627]">
            <Sparkles className="w-5 h-5 text-[#1ed760] mb-1" />
            <span className="text-xs font-semibold text-white">AI Recommend</span>
            <span className="text-[11px] text-[#70947e]">เข้าใจภาษาธรรมชาติ</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-[#0e1c15]/60 border border-[#1b3627]">
            <Disc className="w-5 h-5 text-[#1ed760] mb-1" />
            <span className="text-xs font-semibold text-white">Spotify Sync</span>
            <span className="text-[11px] text-[#70947e]">ส่งออกเพลย์ลิสต์จริง</span>
          </div>
        </div>
      </div>
    </main>
  );
}
