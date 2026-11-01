'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Wand2, RefreshCw, PlusCircle } from 'lucide-react';

export type PlaylistModifyAction = 'replace' | 'add';

interface AIPromptBoxProps {
  onGenerate: (
    prompt: string,
    presetName?: string,
    modifyAction?: PlaylistModifyAction,
  ) => Promise<void>;
  isLoading?: boolean;
  mode?: 'create' | 'modify';
  accentColor?: string;
  accentGlow?: string;
}

const QUICK_MOOD_PRESETS = [
  { label: '🌧️ เหงาๆ', prompt: 'ขอเพลงแนวเหงาๆ เศร้าๆ ซึ้งๆ ฟังตอนฝนตก', color: 'hover:border-[#4a7fa8]/60 hover:text-[#a8d1f0]' },
  { label: '🔥 มันสุดเหวี่ยง', prompt: 'ขอเพลงตื๊ดๆ จังหวะมันส์ๆ เบสหนักๆ ชวนเต้นสุดเหวี่ยง', color: 'hover:border-[#a83232]/60 hover:text-[#ff9999]' },
  { label: '💖 คลั่งรัก', prompt: 'ขอเพลงรักอบอุ่น โรแมนติก ฟีลกู๊ด กำลังอินเลิฟ', color: 'hover:border-[#a84f7a]/60 hover:text-[#ffaed6]' },
  { label: '🍃 ผ่อนคลาย', prompt: 'ขอเพลงชิลๆ สบายๆ ผ่อนคลาย ฟังสบายอารมณ์ acoustic lofi', color: 'hover:border-[#1ed760]/50 hover:text-white' },
  { label: '🎯 สมาธิขั้นสุด', prompt: 'ขอเพลง instrumental โฟกัส อ่านหนังสือ มีสมาธิขั้นสุด ไม่กวนสมอง', color: 'hover:border-[#9b7fe8]/60 hover:text-[#c4aaff]' },
  { label: '🏡 อยากกลับบ้าน', prompt: 'ขอเพลงคิดถึงบ้าน อบอุ่น nostalgia ฟังสบายๆ อบอุ่นหัวใจ', color: 'hover:border-[#c4a84f]/60 hover:text-[#ffd166]' },
];

export function AIPromptBox({
  onGenerate,
  isLoading = false,
  mode = 'create',
  accentColor = '#ffffff',
  accentGlow = 'rgba(255, 255, 255, 0.25)',
}: AIPromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [modifyAction, setModifyAction] = useState<PlaylistModifyAction>('replace');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setActivePreset(null);
    void onGenerate(prompt.trim(), undefined, mode === 'modify' ? modifyAction : undefined);
  };

  const handlePresetClick = (preset: (typeof QUICK_MOOD_PRESETS)[0]) => {
    setPrompt(preset.prompt);
    setActivePreset(preset.label);
    void onGenerate(preset.prompt, preset.label);
  };

  const handleModifyActionClick = (action: PlaylistModifyAction) => {
    setModifyAction(action);
    if (prompt.trim() && !isLoading) {
      void onGenerate(prompt.trim(), undefined, action);
    }
  };

  const isCompact = mode === 'modify';

  return (
    <div
      style={{
        borderColor: `${accentColor}38`,
        boxShadow: `0 0 28px ${accentGlow}, 0 8px 30px rgba(0,0,0,0.5)`,
      }}
      className={`bg-[#121216]/75 border rounded-2xl ${
        isCompact ? 'p-3' : 'p-5'
      } backdrop-blur-xl relative overflow-hidden w-full shrink-0 transition-all duration-500`}
    >
      {isLoading && (
        <div
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}15, transparent)`,
          }}
          className="absolute inset-0 animate-pulse pointer-events-none rounded-2xl"
        />
      )}

      <div className={`flex items-center gap-2 ${isCompact ? 'mb-2' : 'mb-3'}`}>
        <Wand2
          style={{ color: accentColor }}
          className={`${isCompact ? 'w-3.5 h-3.5' : 'w-5 h-5'} transition-colors duration-500 ${
            isLoading ? 'animate-spin' : 'animate-pulse'
          }`}
        />
        <h2
          className={`${
            isCompact ? 'text-xs' : 'text-base'
          } font-bold text-white tracking-wide`}
        >
          Smart Custom Playlist
        </h2>
        {isLoading && (
          <span
            style={{ color: accentColor }}
            className="text-[11px] animate-pulse ml-auto"
          >
            กำลังวิเคราะห์อารมณ์...
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className={`flex gap-2 ${isCompact ? 'mb-2' : 'mb-4'}`}
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setActivePreset(null);
          }}
          placeholder={
            mode === 'modify'
              ? 'พิมพ์แนวเพลงหรืออารมณ์ที่ต้องการเปลี่ยนหรือเพิ่มในเพลย์ลิสต์นี้...'
              : "บอกอารมณ์ด้วยภาษาธรรมชาติ เช่น 'ชิลๆ ขับรถตอนกลางคืน' หรือ 'เศร้าอยู่คนเดียว'..."
          }
          disabled={isLoading}
          className={`flex-1 bg-[#0b0b0f]/90 border border-white/15 rounded-xl px-3.5 ${
            isCompact ? 'py-1.5 text-xs' : 'py-3 text-sm'
          } text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all disabled:opacity-50`}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 20px ${accentGlow}`,
          }}
          className={`flex items-center justify-center gap-1.5 px-4 ${
            isCompact ? 'py-1.5 text-xs' : 'py-3 text-sm'
          } rounded-xl hover:opacity-90 active:scale-95 text-[#0a0a0c] font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span>
                {mode === 'modify'
                  ? modifyAction === 'replace'
                    ? 'เปลี่ยนเพลง'
                    : 'เพิ่มเพลง'
                  : 'สร้าง'}
              </span>
              <Send className="w-3 h-3" />
            </>
          )}
        </button>
      </form>

      {mode === 'create' ? (
        <div>
          <div className="text-xs font-semibold text-white/60 mb-2.5 uppercase tracking-wider flex items-center gap-1.5">
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
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 disabled:opacity-40 cursor-pointer
                    ${
                      isActive
                        ? 'bg-white/20 border-white/60 text-white font-semibold'
                        : `bg-white/[0.06] border-white/15 text-white/80 ${preset.color}`
                    }`}
                >
                  {preset.label}
                  {isActive && isLoading && <span className="ml-1">·</span>}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleModifyActionClick('replace')}
            disabled={isLoading}
            style={
              modifyAction === 'replace'
                ? {
                    borderColor: accentColor,
                    color: accentColor,
                    backgroundColor: `${accentColor}1a`,
                    boxShadow: `0 0 16px ${accentGlow}`,
                  }
                : undefined
            }
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-bold transition-all duration-300 disabled:opacity-40 cursor-pointer ${
              modifyAction === 'replace'
                ? ''
                : 'bg-white/[0.05] border-white/15 text-white/75 hover:border-white/40 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>เปลี่ยนเพลงในเพลย์ลิสต์</span>
          </button>

          <button
            type="button"
            onClick={() => handleModifyActionClick('add')}
            disabled={isLoading}
            style={
              modifyAction === 'add'
                ? {
                    borderColor: accentColor,
                    color: accentColor,
                    backgroundColor: `${accentColor}1a`,
                    boxShadow: `0 0 16px ${accentGlow}`,
                  }
                : undefined
            }
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-bold transition-all duration-300 disabled:opacity-40 cursor-pointer ${
              modifyAction === 'add'
                ? ''
                : 'bg-white/[0.05] border-white/15 text-white/75 hover:border-white/40 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3 h-3" />
            <span>เพิ่มเพลงเข้าเพลย์ลิสต์</span>
          </button>
        </div>
      )}
    </div>
  );
}
