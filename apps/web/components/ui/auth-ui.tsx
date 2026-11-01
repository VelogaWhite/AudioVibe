"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Music, Sparkles, Disc, Radio } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BackgroundVibe } from "../BackgroundVibe";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    textArray.length,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse text-[#1ed760]">{cursor}</span>
    </span>
  );
}

export interface AuthSlideContent {
  image: {
    src: string;
    alt: string;
    position?: string;
  };
  quote: {
    text: string;
    author: string;
  };
}

export interface AuthUIProps {
  slides?: AuthSlideContent[];
  intervalMs?: number;
}

const DEFAULT_ARTIST_SLIDES: AuthSlideContent[] = [
  {
    image: {
      src: "/artists/artist-1.jpg",
      alt: "aespa - K-Pop & Rock Vibe",
      position: "center top",
    },
    quote: {
      text: "Next level energy, tailored to every beat.",
      author: "aespa • K-Pop & Modern Vibe",
    },
  },
  {
    image: {
      src: "/artists/artist-2.jpg",
      alt: "Nirvana - Grunge & Alternative Rock",
      position: "center top",
    },
    quote: {
      text: "Come as you are — raw emotion in every chord.",
      author: "Nirvana • Grunge & Alternative Rock",
    },
  },
  {
    image: {
      src: "/artists/artist-3.jpg",
      alt: "Carabao - ตำนานเพลงเพื่อชีวิต",
      position: "center center",
    },
    quote: {
      text: "บทเพลงเพื่อชีวิต ที่สะท้อนทุกจังหวะอารมณ์ของคุณ",
      author: "คาราบาว • Thai Folk & Rock Legend",
    },
  },
  {
    image: {
      src: "/artists/artist-4.jpg",
      alt: "Bruno Mars - 24K Magic Pop & Funk",
      position: "center top",
    },
    quote: {
      text: "24K Magic groove for your ultimate party playlist.",
      author: "Bruno Mars • Pop, Funk & R&B",
    },
  },
  {
    image: {
      src: "/artists/artist-5.jpg?v=2",
      alt: "Ink Waruntorn - ชอบอยู่คนเดียว",
      position: "center top",
    },
    quote: {
      text: "เปลี่ยนความเหงาเป็นเพลย์ลิสต์ที่เข้าใจคุณที่สุด",
      author: "Ink Waruntorn • Synth-Pop Vibe",
    },
  },
];

export function AuthUI({
  slides = DEFAULT_ARTIST_SLIDES,
  intervalMs = 4500,
}: AuthUIProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const spotifyLoginUrl = `${
    process.env.NEXT_PUBLIC_CORE_API_URL || "http://localhost:3001"
  }/auth/spotify/login`;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  const currentSlide = slides[activeIndex] || slides[0];

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2 relative overflow-hidden bg-[#06110b]">
      {/* Left Column: AudioVibe Landing & Spotify Connect */}
      <div className="relative flex min-h-screen items-center justify-center p-6 md:p-12 overflow-hidden">
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

          {/* Call To Action Button */}
          <div className="flex w-full justify-center">
            <a
              href={spotifyLoginUrl}
              className="w-full flex items-center justify-center gap-3 py-4 px-10 rounded-2xl font-extrabold text-base bg-[#1ed760] hover:bg-[#1db954] text-[#051409] shadow-xl shadow-[#1ed760]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Disc
                className="w-5 h-5 animate-spin"
                style={{ animationDuration: "4s" }}
              />
              <span>Connect to your Spotify account</span>
            </a>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 mt-14 w-full pt-8 border-t border-[#1b3b29]/60">
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#0e1c15]/60 border border-[#1b3627]">
              <Radio className="w-5 h-5 text-[#1ed760] mb-1" />
              <span className="text-xs font-semibold text-white">
                7-Axis Radar
              </span>
              <span className="text-[11px] text-[#70947e]">
                วิเคราะห์มิติเสียง
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#0e1c15]/60 border border-[#1b3627]">
              <Sparkles className="w-5 h-5 text-[#1ed760] mb-1" />
              <span className="text-xs font-semibold text-white">
                AI Recommend
              </span>
              <span className="text-[11px] text-[#70947e]">
                เข้าใจภาษาธรรมชาติ
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-[#0e1c15]/60 border border-[#1b3627]">
              <Disc className="w-5 h-5 text-[#1ed760] mb-1" />
              <span className="text-xs font-semibold text-white">
                Spotify Sync
              </span>
              <span className="text-[11px] text-[#70947e]">
                ส่งออกเพลย์ลิสต์จริง
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: 5-Image Auto-Slideshow with Smooth Crossfade & Typewriter Quote */}
      <div className="hidden md:block relative min-h-screen overflow-hidden bg-[#050e09] border-l border-[#1b3627]/60">
        {slides.map((slide, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <div
              key={slide.image.src}
              aria-hidden={!isCurrent}
              className={cn(
                "absolute inset-0 bg-cover bg-no-repeat transition-all duration-1000 ease-in-out",
                isCurrent ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none",
              )}
              style={{
                backgroundImage: `url(${slide.image.src})`,
                backgroundPosition: slide.image.position || "center top",
              }}
            />
          );
        })}

        {/* Soft gradient overlays for readability and seamless transition */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#06110b] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#05100a] via-[#05100a]/80 to-transparent pointer-events-none" />

        {/* Typewriter Quote & Slide Indicators */}
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-6 pb-10">
          <blockquote className="space-y-2 text-center max-w-lg px-4">
            <p className="text-lg font-semibold text-white drop-shadow-md min-h-[28px]">
              &ldquo;
              <Typewriter
                key={currentSlide.quote.text}
                text={currentSlide.quote.text}
                speed={50}
              />
              &rdquo;
            </p>
            <cite className="block text-sm font-medium text-[#9ec5ad] not-italic">
              — {currentSlide.quote.author}
            </cite>
          </blockquote>

          {/* Subtle progress dots */}
          <div className="flex items-center gap-2 mt-4">
            {slides.map((s, idx) => (
              <button
                key={s.image.src}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`ดูรูปที่ ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === activeIndex
                    ? "w-6 bg-[#1ed760]"
                    : "w-1.5 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
