'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Wand2 } from 'lucide-react';

interface AIPromptBoxProps {
  onGenerate: (prompt: string, presetName?: string) => Promise<void>;
  isLoading?: boolean;
}

const QUICK_MOOD_PRESETS = [
  { label: '🌧️ เหงาๆ', prompt: 'ขอเพลงแนวเหงาๆ เศร้าๆ ซึ้งๆ ฟังตอนฝนตก', color: 'hover:border-[#4a7fa8]/60 hover:text-[#a8d1f0]' },
  { label: '🔥 มันสุดเหวี่ยง', prompt: 'ขอเพลงตื๊ดๆ จังหวะมันส์ๆ เบสหนักๆ ชวนเต้นสุดเหวี่ยง', color: 'hover:border-[#a83232]/60 hover:text-[#ff9999]' },
  { label: '💖 คลั่งรัก', prompt: 'ขอเพลงรักอบอุ่น โรแมนติก ฟีลกู๊ด กำลังอินเลิฟ', color: 'hover:border-[#a84f7a]/60 hover:text-[#ffaed6]' },
  { label: '🍃 ผ่อนคลาย', prompt: 'ขอเพลงชิลๆ สบายๆ ผ่อนคลาย ฟังสบายอารมณ์ acoustic lofi', color: 'hover:border-[#1ed760]/50 hover:text-white' },
  { label: '🎯 สมาธิขั้นสุด', prompt: 'ขอเพลง instrumental โฟกัส อ่านหนังสือ มีสมาธิขั้นสุด ไม่กวนสมอง', color: 'hover:border-[#9b7fe8]/60 hover:text-[#c4aaff]' },
  { label: '🏡 อยากกลับบ้าน', prompt: 'ขอเพลงคิดถึงบ้าน อบอุ่น nostalgia ฟังสบายๆ อบอุ่นหัวใจ', color: 'hover:border-[#c4a84f]/60 hover:text-[#ffd166]' },
];

export function AIPromptBox({ onGenerate, isLoading = false }: AIPromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setActivePreset(null);
    onGenerate(prompt.trim());
  };

  const handlePresetClick = (preset: (typeof QUICK_MOOD_PRESETS)[0]) => {
    setPrompt(preset.prompt);
    setActivePreset(preset.label);
    onGenerate(preset.prompt, preset.label);
  };

  return (
    <div className="bg-[#121f18]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur relative overflow-hidden">
      {/* Subtle glow when loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#1ed760]/5 via-transparent to-[#1ed760]/5 animate-pulse pointer-events-none rounded-2xl" />
      )}

      <div className="flex items-center gap-2 mb-3">
        <Wand2 className={`w-5 h-5 text-[#1ed760] ${isLoading ? 'animate-spin' : 'animate-pulse'}`} />
        <h2 className="text-base font-bold text-white tracking-wide">
          AI Smart Recommend
        </h2>
        {isLoading && (
          <span className="text-xs text-[#7bc99a] animate-pulse ml-auto">
            กำลังวิเคราะห์อารมณ์...
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setActivePreset(null); }}
          placeholder="บอกอารมณ์ด้วยภาษาธรรมชาติ เช่น 'ชิลๆ ขับรถตอนกลางคืน' หรือ 'เศร้าอยู่คนเดียว'..."
          disabled={isLoading}
          className="flex-1 bg-[#0b1410] border border-[#2c4d3a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#688a75] focus:outline-none focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760]/40 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1ed760] hover:bg-[#1db954] active:scale-95 text-[#06140a] font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-[#1ed760]/30"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>สร้าง</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* 6 Quick Mood Presets */}
      <div>
        <div className="text-xs font-semibold text-[#86a894] mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Quick Mood Presets
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_MOOD_PRESETS.map((preset) => {
            const isActive = activePreset === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                disabled={isLoading}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 disabled:opacity-40
                  ${isActive
                    ? 'bg-[#1ed760]/20 border-[#1ed760]/60 text-[#1ed760] font-semibold shadow-sm shadow-[#1ed760]/10'
                    : `bg-[#16291f] border-[#264734] text-[#c2e2ce] ${preset.color}`
                  }`}
              >
                {preset.label}
                {isActive && isLoading && <span className="ml-1">·</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
