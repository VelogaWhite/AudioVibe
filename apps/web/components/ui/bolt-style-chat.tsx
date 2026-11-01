'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  SendHorizontal,
  Loader2,
} from 'lucide-react'

export interface MoodPreset {
  label: string
  prompt: string
}

export const QUICK_MOOD_PRESETS: MoodPreset[] = [
  {
    label: '🌧️ เหงาๆ',
    prompt: 'ขอเพลงแนวเหงาๆ เศร้าๆ ซึ้งๆ ฟังตอนฝนตก',
  },
  {
    label: '🔥 มันสุดเหวี่ยง',
    prompt: 'ขอเพลงตื๊ดๆ จังหวะมันส์ๆ เบสหนักๆ ชวนเต้นสุดเหวี่ยง',
  },
  {
    label: '💖 คลั่งรัก',
    prompt: 'ขอเพลงรักอบอุ่น โรแมนติก ฟีลกู๊ด กำลังอินเลิฟ',
  },
  {
    label: '🍃 ผ่อนคลาย',
    prompt: 'ขอเพลงชิลๆ สบายๆ ผ่อนคลาย ฟังสบายอารมณ์ acoustic lofi',
  },
  {
    label: '🎯 สมาธิขั้นสุด',
    prompt: 'ขอเพลง instrumental โฟกัส อ่านหนังสือ มีสมาธิขั้นสุด ไม่กวนสมอง',
  },
  {
    label: '🏡 อยากกลับบ้าน',
    prompt: 'ขอเพลงคิดถึงบ้าน อบอุ่น nostalgia ฟังสบายๆ อบอุ่นหัวใจ',
  },
]

// CHAT INPUT (AudioVibe Prompt Input with White Glow)
function ChatInput({
  onSend,
  placeholder = 'พิมพ์อารมณ์ แนวเพลง หรือศิลปินที่อยากฟัง เช่น ขอเพลงร็อกยุค 90s มันส์ๆ...',
  isLoading = false,
}: {
  onSend?: (message: string) => void
  placeholder?: string
  isLoading?: boolean
}) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend?.(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative w-full max-w-[680px] mx-auto">
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-white/25 via-white/10 to-transparent pointer-events-none" />
      <div className="relative rounded-2xl bg-[#141417]/95 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_0_35px_rgba(255,255,255,0.12),0_8px_30px_rgba(0,0,0,0.65)]">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            disabled={isLoading}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent text-[15px] text-white placeholder-[#7a7a82] px-5 pt-5 pb-3 focus:outline-none min-h-[80px] max-h-[180px] disabled:opacity-50"
            style={{ height: '80px' }}
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-3.5 pt-1">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Sparkles className="size-3.5 text-white/80" />
            <span>วิเคราะห์อารมณ์เพลง 7 มิติเสียงด้วย AI</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-white hover:bg-white/90 text-[#0a0a0c] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-[0_0_24px_rgba(255,255,255,0.45)] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>กำลังสร้าง...</span>
              </>
            ) : (
              <>
                <span>สร้างเพลย์ลิสต์</span>
                <SendHorizontal className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Ray Background with White Glow & Vinyl Image inside the bottom horizon circle
function RayBackground({ vinylImageSrc = '/vinyl-bg.jpg' }: { vinylImageSrc?: string }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-[#0a0a0c]" />

      {/* Ambient White Radial Glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[4000px] h-[1800px] sm:w-[6000px]"
        style={{
          background:
            'radial-gradient(circle at center 800px, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.25) 14%, rgba(255, 255, 255, 0.12) 18%, rgba(255, 255, 255, 0.05) 22%, rgba(10, 10, 12, 0.2) 25%)',
        }}
      />

      {/* Glowing White Horizon Arc + Vinyl Record Image inside the bottom circle */}
      <div
        className="absolute top-[175px] left-1/2 w-[1600px] h-[1600px] sm:top-1/2 sm:w-[3043px] sm:h-[2865px]"
        style={{ transform: 'translate(-50%) rotate(180deg)' }}
      >
        {/* Innermost Circle containing the Vinyl Record Image */}
        <div
          className="absolute w-full h-full rounded-full -mt-[13px] overflow-hidden"
          style={{
            background: '#0a0a0c',
            border: '14px solid #ffffff',
            transform: 'rotate(180deg)',
            zIndex: 5,
          }}
        >
          {/* Visible top cap of the circle (bottom portion of the viewport) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen max-w-[1800px] h-[55vh] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vinylImageSrc}
              alt="Vinyl Record Background"
              className="w-full h-full object-cover object-center opacity-85 scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(10,10,12,0.35) 35%, rgba(10,10,12,0.78) 100%)',
              }}
            />
          </div>
        </div>

        {/* White Glowing Concentric Rings */}
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c] -mt-[11px]"
          style={{
            border: '23px solid rgba(255, 255, 255, 0.85)',
            transform: 'rotate(180deg)',
            zIndex: 4,
          }}
        />
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c] -mt-[8px]"
          style={{
            border: '23px solid rgba(255, 255, 255, 0.6)',
            transform: 'rotate(180deg)',
            zIndex: 3,
          }}
        />
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c] -mt-[4px]"
          style={{
            border: '23px solid rgba(255, 255, 255, 0.35)',
            transform: 'rotate(180deg)',
            zIndex: 2,
          }}
        />
        <div
          className="absolute w-full h-full rounded-full bg-[#0a0a0c]"
          style={{
            border: '20px solid rgba(255, 255, 255, 0.2)',
            boxShadow:
              '0 -18px 45px rgba(255, 255, 255, 0.65), 0 -4px 20px rgba(255, 255, 255, 0.45)',
            transform: 'rotate(180deg)',
            zIndex: 1,
          }}
        />
      </div>
    </div>
  )
}

// ANNOUNCEMENT BADGE COMPONENT (White Glow)
function AnnouncementBadge({ text }: { text: string }) {
  return (
    <div
      className="relative inline-flex items-center gap-2 px-5 py-2 min-h-[38px] rounded-full text-xs sm:text-sm overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))',
        backdropFilter: 'blur(20px) saturate(140%)',
        boxShadow:
          'inset 0 1px rgba(255,255,255,0.3), inset 0 -1px rgba(0,0,0,0.2), 0 8px 32px -8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.12), 0 0 0 1px rgba(255,255,255,0.15)',
      }}
    >
      <span
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none opacity-80 mix-blend-overlay"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(255, 255, 255, 0.35) 0%, transparent 70%)',
        }}
      />
      <span
        className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-[110px] opacity-80"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)',
          filter: 'blur(0.5px)',
        }}
      />
      <Sparkles className="size-3.5 relative z-10 text-white" />
      <span className="relative z-10 text-white font-medium tracking-wide">
        {text}
      </span>
    </div>
  )
}

// QUICK MOOD PRESETS COMPONENT (Replaces Figma/GitHub Import Buttons)
function QuickMoodButtons({
  presets = QUICK_MOOD_PRESETS,
  onSelectPreset,
  isLoading = false,
}: {
  presets?: MoodPreset[]
  onSelectPreset?: (prompt: string, label: string) => void
  isLoading?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3 max-w-[720px] w-full px-2">
      <span className="text-xs font-medium uppercase tracking-widest text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
        หรือเลือก Quick Mood Presets
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectPreset?.(preset.prompt, preset.label)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-white/25 bg-[#0a0a0c]/75 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_12px_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:border-white/60 cursor-pointer"
          >
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// MAIN BOLT CHAT COMPONENT ADAPTED FOR AUDIOVIBE PAGE 3
export interface BoltChatProps {
  titlePrefix?: string
  titleHighlight?: string
  subtitle?: string
  announcementText?: string
  placeholder?: string
  vinylImageSrc?: string
  isLoading?: boolean
  onGenerate?: (prompt: string, presetLabel?: string) => Promise<void> | void
}

export function BoltStyleChat({
  titlePrefix = 'Play Music with',
  titleHighlight = 'Your Style',
  subtitle = 'พิมพ์บอกอารมณ์ แนวเพลง หรือเลือก Mood Preset ด้านล่างเพื่อสร้างเพลย์ลิสต์ใหม่ด้วย AI',
  announcementText = 'AI Playlist Generator',
  placeholder = 'พิมพ์อารมณ์ แนวเพลง หรือศิลปินที่อยากฟัง เช่น ขอเพลงร็อกยุค 90s มันส์ๆ...',
  vinylImageSrc = '/vinyl-bg.jpg',
  isLoading = false,
  onGenerate,
}: BoltChatProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden bg-[#0a0a0c]">
      <RayBackground vinylImageSrc={vinylImageSrc} />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4">
        {/* Announcement badge */}
        <div className="mb-5">
          <AnnouncementBadge text={announcementText} />
        </div>

        {/* Title section */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-[0_2px_15px_rgba(0,0,0,0.5)]">
            {titlePrefix}{' '}
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent italic drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              {titleHighlight}
            </span>
          </h1>
          <p className="text-sm sm:text-base font-medium text-white/70 max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Chat input */}
        <div className="w-full max-w-[700px] mb-6 sm:mb-7">
          <ChatInput
            placeholder={placeholder}
            isLoading={isLoading}
            onSend={(msg) => onGenerate?.(msg)}
          />
        </div>

        {/* 6 Quick Mood Presets */}
        <QuickMoodButtons
          isLoading={isLoading}
          onSelectPreset={(prompt, label) => onGenerate?.(prompt, label)}
        />
      </div>
    </div>
  )
}
