'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface AIPromptBoxProps {
  onGenerate: (prompt: string, presetName?: string) => Promise<void>;
  isLoading?: boolean;
}

const QUICK_MOOD_PRESETS = [
  { label: '🌧️ เหงาๆ', prompt: 'ขอเพลงแนวเหงาๆ เศร้าๆ ซึ้งๆ ฟังตอนฝนตก' },
  { label: '🔥 มันสุดเหวี่ยง', prompt: 'ขอเพลงตื๊ดๆ จังหวะมันส์ๆ เบสหนักๆ ชวนเต้นสุดเหวี่ยง' },
  { label: '💖 คลั่งรัก', prompt: 'ขอเพลงรักอบอุ่น โรแมนติก ฟีลกู๊ด กำลังอินเลิฟ' },
  { label: '🍃 ผ่อนคลาย', prompt: 'ขอเพลงชิลๆ สบายๆ ผ่อนคลาย ฟังสบายอารมณ์ acoustic lofi' },
  { label: '🎯 สมาธิขั้นสุด', prompt: 'ขอเพลง instrumental โฟกัส อ่านหนังสือ มีสมาธิขั้นสุด ไม่กวนสมอง' },
  { label: '🏡 อยากกลับบ้าน', prompt: 'ขอเพลงคิดถึงบ้าน อบอุ่น nostalgia ฟังสบายๆ อบอุ่นหัวใจ' },
];

export function AIPromptBox({ onGenerate, isLoading = false }: AIPromptBoxProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim());
  };

  const handlePresetClick = (preset: (typeof QUICK_MOOD_PRESETS)[0]) => {
    setPrompt(preset.prompt);
    onGenerate(preset.prompt, preset.label);
  };

  return (
    <div className="bg-[#121f18]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-[#1ed760] animate-pulse" />
        <h2 className="text-base font-bold text-white tracking-wide">
          AI Smart Recommend
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1b3b29] text-[#1ed760] font-medium">
          NLP Prompt
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="บอกอารมณ์ของคุณด้วยภาษาธรรมชาติ เช่น 'อยากได้เพลงชิลๆ ขับรถตอนกลางคืน'..."
          disabled={isLoading}
          className="flex-1 bg-[#0b1410] border border-[#2c4d3a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#688a75] focus:outline-none focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1ed760] hover:bg-[#1db954] text-[#06140a] font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-[#1ed760]/20"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>สร้าง</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* 6 Quick Mood Presets */}
      <div>
        <div className="text-xs font-semibold text-[#86a894] mb-2 uppercase tracking-wider">
          Quick Mood Presets (ปุ่มลัดตามอารมณ์):
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_MOOD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full bg-[#16291f] hover:bg-[#1f3d2e] border border-[#264734] hover:border-[#1ed760]/50 text-[#c2e2ce] hover:text-white transition-all disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
