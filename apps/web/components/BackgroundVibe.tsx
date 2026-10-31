'use client';

import React from 'react';
import { ThemeVibe } from '../store/usePlaylistStore';

interface BackgroundVibeProps {
  theme: ThemeVibe;
}

export function BackgroundVibe({ theme }: BackgroundVibeProps) {
  // Theme Background Base Colors
  const bgColors: Record<ThemeVibe, string> = {
    NATURE: '#050907',
    LOVE: '#0d0208',
    RAINY: '#050c14',
    FIRE: '#140502',
  };

  // Top Ambient Glows
  const topGlowGradients: Record<ThemeVibe, string> = {
    NATURE: 'bg-gradient-to-br from-[#1ed760] via-[#0f6832] to-transparent',
    LOVE: 'bg-gradient-to-br from-[#ff2a7a] via-[#991b4f] to-transparent',
    RAINY: 'bg-gradient-to-br from-[#38bdf8] via-[#1e3a8a] to-transparent',
    FIRE: 'bg-gradient-to-br from-[#ff3b00] via-[#b91c1c] to-transparent',
  };

  // Bottom Ambient Glows
  const bottomGlowGradients: Record<ThemeVibe, string> = {
    NATURE: 'bg-gradient-to-tl from-[#176239] via-[#082816] to-transparent',
    LOVE: 'bg-gradient-to-tl from-[#e11d48] via-[#700f33] to-transparent',
    RAINY: 'bg-gradient-to-tl from-[#0284c7] via-[#0c1f36] to-transparent',
    FIRE: 'bg-gradient-to-tl from-[#ea580c] via-[#450a0a] to-transparent',
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: bgColors[theme] }}
    >
      {/* Dynamic Ambient Radial Glow 1 (Top Left) */}
      <div
        className={`absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-all duration-700 ease-in-out ${topGlowGradients[theme]}`}
      />

      {/* Dynamic Ambient Radial Glow 2 (Bottom Right) */}
      <div
        className={`absolute bottom-[-150px] right-[-100px] w-[550px] h-[550px] rounded-full blur-[130px] opacity-35 transition-all duration-700 ease-in-out ${bottomGlowGradients[theme]}`}
      />

      {/* =========================================================================
          THEME 1: NATURE (พืชพรรณ เถาวัลย์เลื้อยไม้ และดอกไม้)
          ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          theme === 'NATURE' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="nature-pattern"
              x="0"
              y="0"
              width="140"
              height="140"
              patternUnits="userSpaceOnUse"
            >
              {/* Curved Vines (เถาวัลย์เลื้อย) */}
              <path
                d="M10 0 C 40 40, 20 80, 50 140"
                fill="none"
                stroke="#1ed760"
                strokeWidth="1.2"
                strokeOpacity="0.12"
              />
              <path
                d="M70 0 C 100 50, 80 90, 120 140"
                fill="none"
                stroke="#2a6f44"
                strokeWidth="1"
                strokeOpacity="0.1"
              />
              <path
                d="M0 60 C 50 40, 90 70, 140 50"
                fill="none"
                stroke="#1ed760"
                strokeWidth="1"
                strokeOpacity="0.08"
                strokeDasharray="4 3"
              />

              {/* Foliage / Leaves (ใบไม้) */}
              <path
                d="M32 30 C 45 22, 50 35, 32 40 C 25 35, 22 25, 32 30 Z"
                fill="#1ed760"
                fillOpacity="0.09"
                stroke="#2ee573"
                strokeWidth="0.8"
                strokeOpacity="0.18"
              />
              <path
                d="M26 68 C 12 60, 10 78, 25 80 C 32 75, 32 66, 26 68 Z"
                fill="#247a47"
                fillOpacity="0.11"
                stroke="#1ed760"
                strokeWidth="0.8"
                strokeOpacity="0.16"
              />
              <path
                d="M92 25 C 105 18, 112 32, 95 36 C 88 32, 85 22, 92 25 Z"
                fill="#1ed760"
                fillOpacity="0.08"
                stroke="#1ed760"
                strokeWidth="0.8"
                strokeOpacity="0.14"
              />
              <path
                d="M102 105 C 118 96, 122 114, 105 118 C 98 112, 95 102, 102 105 Z"
                fill="#2aa35b"
                fillOpacity="0.09"
                stroke="#2ee573"
                strokeWidth="0.8"
                strokeOpacity="0.18"
              />

              {/* Delicate 5-Petal Flower (ดอกไม้ 5 กลีบ) */}
              <g transform="translate(68, 80) scale(0.7)">
                <circle cx="0" cy="-7" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="7" cy="-2" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="4" cy="6" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="-4" cy="6" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="-7" cy="-2" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="0" cy="0" r="2.5" fill="#ffd166" fillOpacity="0.2" stroke="#1ed760" strokeWidth="0.5" strokeOpacity="0.3" />
              </g>

              {/* Smaller Flower */}
              <g transform="translate(18, 115) scale(0.5)">
                <circle cx="0" cy="-6" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="6" cy="0" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="0" cy="6" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="-6" cy="0" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="0" cy="0" r="2" fill="#8ce4aa" fillOpacity="0.25" />
              </g>

              {/* Little Sprout Tendrils */}
              <path
                d="M48 95 Q 60 90, 58 105 Q 52 110, 48 102"
                fill="none"
                stroke="#1ed760"
                strokeWidth="0.8"
                strokeOpacity="0.14"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nature-pattern)" />
        </svg>

        {/* Large Decorative Corner Botanical Vines */}
        <div className="absolute -top-12 -left-12 w-96 h-96 opacity-15 pointer-events-none">
          <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 10 C 60 120, 160 140, 280 200"
              stroke="#1ed760"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M10 10 C 120 40, 180 120, 220 280"
              stroke="#2ee573"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M70 70 C 110 50, 130 90, 85 105 Z" fill="#1ed760" fillOpacity="0.3" />
            <path d="M130 110 C 180 90, 195 130, 145 145 Z" fill="#2ee573" fillOpacity="0.25" />
            <path d="M180 160 C 230 140, 250 180, 200 195 Z" fill="#1ed760" fillOpacity="0.3" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          THEME 2: LOVE (เพลงรัก โทนชมพูมืด ลวดลายหัวใจ)
          ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          theme === 'LOVE' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="love-heart-pattern"
              x="0"
              y="0"
              width="130"
              height="130"
              patternUnits="userSpaceOnUse"
            >
              {/* Primary Heart */}
              <path
                d="M35 25 C 35 15, 20 15, 20 28 C 20 40, 35 50, 35 50 C 35 50, 50 40, 50 28 C 50 15, 35 15, 35 25 Z"
                fill="#ff2a7a"
                fillOpacity="0.1"
                stroke="#ff4d8d"
                strokeWidth="1"
                strokeOpacity="0.25"
              />

              {/* Secondary Tilted Heart */}
              <g transform="translate(90, 80) rotate(-15) scale(0.8)">
                <path
                  d="M20 15 C 20 8, 10 8, 10 18 C 10 26, 20 33, 20 33 C 20 33, 30 26, 30 18 C 30 8, 20 8, 20 15 Z"
                  fill="#ff6b9d"
                  fillOpacity="0.12"
                  stroke="#ff85a2"
                  strokeWidth="0.9"
                  strokeOpacity="0.28"
                />
              </g>

              {/* Cute Mini Sparkle Heart */}
              <g transform="translate(85, 20) scale(0.55)">
                <path
                  d="M20 15 C 20 8, 10 8, 10 18 C 10 26, 20 33, 20 33 C 20 33, 30 26, 30 18 C 30 8, 20 8, 20 15 Z"
                  fill="#f43f5e"
                  fillOpacity="0.15"
                  stroke="#fb7185"
                  strokeWidth="1.2"
                  strokeOpacity="0.35"
                />
              </g>

              {/* Dotted Floating Love Vine Wave */}
              <path
                d="M0 65 Q 35 45, 65 65 T 130 65"
                fill="none"
                stroke="#ff4d8d"
                strokeWidth="0.9"
                strokeOpacity="0.15"
                strokeDasharray="3 4"
              />

              {/* Romantic Sparkles */}
              <g transform="translate(25, 95)">
                <path d="M0 -4 L0 4 M-4 0 L4 0" stroke="#ffaed6" strokeWidth="0.8" strokeOpacity="0.25" strokeLinecap="round" />
              </g>
              <g transform="translate(115, 45)">
                <path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#ffaed6" strokeWidth="0.7" strokeOpacity="0.2" strokeLinecap="round" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#love-heart-pattern)" />
        </svg>

        {/* Big Romantic Heart Aura in top right corner */}
        <div className="absolute -top-10 -right-10 w-96 h-96 opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 65 C 100 35, 60 35, 60 70 C 60 100, 100 130, 100 130 C 100 130, 140 100, 140 70 C 140 35, 100 35, 100 65 Z"
              fill="url(#heart-gradient)"
              stroke="#ff4d8d"
              strokeWidth="2"
            />
            <defs>
              <linearGradient id="heart-gradient" x1="60" y1="35" x2="140" y2="130">
                <stop stopColor="#ff2a7a" stopOpacity="0.4" />
                <stop offset="1" stopColor="#881337" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* =========================================================================
          THEME 3: RAINY (แนวเพลงเหงาๆ เศร้าๆ ฟ้าคลึ้ม เมฆฝนและสายฝนตก)
          ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          theme === 'RAINY' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="rainy-pattern"
              x="0"
              y="0"
              width="150"
              height="150"
              patternUnits="userSpaceOnUse"
            >
              {/* Slanted Falling Raindrops (สายฝนตกโปรยปราย) */}
              <line x1="15" y1="10" x2="10" y2="35" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.22" strokeLinecap="round" />
              <line x1="35" y1="70" x2="30" y2="95" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.18" strokeLinecap="round" />
              <line x1="55" y1="20" x2="50" y2="45" stroke="#93c5fd" strokeWidth="1.2" strokeOpacity="0.25" strokeLinecap="round" />
              <line x1="75" y1="80" x2="70" y2="105" stroke="#38bdf8" strokeWidth="1.1" strokeOpacity="0.2" strokeLinecap="round" />
              <line x1="95" y1="15" x2="90" y2="40" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.16" strokeLinecap="round" />
              <line x1="115" y1="60" x2="110" y2="85" stroke="#93c5fd" strokeWidth="1.3" strokeOpacity="0.22" strokeLinecap="round" />
              <line x1="135" y1="25" x2="130" y2="50" stroke="#38bdf8" strokeWidth="1.1" strokeOpacity="0.2" strokeLinecap="round" />
              <line x1="145" y1="95" x2="140" y2="120" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.17" strokeLinecap="round" />

              {/* Miniature Raindrops (หยดน้ำฝน) */}
              <circle cx="22" cy="52" r="1.5" fill="#38bdf8" fillOpacity="0.2" />
              <circle cx="82" cy="125" r="1.5" fill="#60a5fa" fillOpacity="0.2" />
              <circle cx="125" cy="15" r="1.5" fill="#93c5fd" fillOpacity="0.25" />

              {/* Stylized Rain Cloud (เมฆฝนปุยโปร่งแสง) */}
              <path
                d="M20 70 C 15 70, 10 65, 12 58 C 12 50, 20 46, 26 48 C 30 40, 42 40, 46 48 C 52 48, 56 52, 54 60 C 58 64, 56 70, 50 70 Z"
                fill="#1e3a8a"
                fillOpacity="0.18"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeOpacity="0.28"
              />

              {/* Second Cloud in pattern */}
              <path
                d="M90 120 C 86 120, 82 116, 84 110 C 84 104, 90 100, 96 102 C 99 95, 108 95, 112 101 C 117 101, 120 105, 119 111 C 122 115, 120 120, 115 120 Z"
                fill="#0f172a"
                fillOpacity="0.25"
                stroke="#60a5fa"
                strokeWidth="0.8"
                strokeOpacity="0.22"
              />

              {/* Rain Ripple on Water (ระลอกน้ำฝน) */}
              <ellipse cx="65" cy="138" rx="8" ry="2" fill="none" stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.16" />
              <ellipse cx="120" cy="40" rx="6" ry="1.5" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.14" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rainy-pattern)" />
        </svg>

        {/* Large Overcast Raincloud Silhouette (Top Left Corner) */}
        <div className="absolute -top-16 -left-16 w-[450px] h-[300px] opacity-25 pointer-events-none">
          <svg viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 180 C 20 180, 10 150, 30 130 C 20 90, 70 60, 110 90 C 140 40, 220 40, 260 90 C 310 80, 350 120, 330 160 C 360 180, 340 220, 290 220 C 270 220, 150 220, 50 180 Z"
              fill="url(#rain-cloud-grad)"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            {/* Hanging rain streaks under cloud */}
            <line x1="80" y1="210" x2="65" y2="260" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
            <line x1="140" y1="220" x2="125" y2="275" stroke="#60a5fa" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
            <line x1="200" y1="220" x2="185" y2="270" stroke="#93c5fd" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
            <line x1="260" y1="215" x2="245" y2="265" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
            <defs>
              <linearGradient id="rain-cloud-grad" x1="50" y1="50" x2="300" y2="220">
                <stop stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="0.6" stopColor="#0f172a" stopOpacity="0.4" />
                <stop offset="1" stopColor="#0284c7" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* =========================================================================
          THEME 4: FIRE (แนวเพลงมันส์สุดเหวี่ยง สีแดงส้ม เปลวไฟและประกายสะเก็ดไฟ)
          ========================================================================= */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          theme === 'FIRE' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="fire-pattern"
              x="0"
              y="0"
              width="140"
              height="140"
              patternUnits="userSpaceOnUse"
            >
              {/* Stylized Flame Tongue 1 (เปลวไฟหลัก) */}
              <path
                d="M35 85 C 30 70, 20 60, 28 45 C 33 35, 42 42, 40 32 C 45 42, 55 50, 48 65 C 55 58, 54 75, 45 85 Z"
                fill="#ef4444"
                fillOpacity="0.14"
                stroke="#ff4500"
                strokeWidth="1"
                strokeOpacity="0.32"
              />

              {/* Smaller Flame Tongue 2 */}
              <g transform="translate(85, 25) scale(0.75)">
                <path
                  d="M35 85 C 30 70, 20 60, 28 45 C 33 35, 42 42, 40 32 C 45 42, 55 50, 48 65 C 55 58, 54 75, 45 85 Z"
                  fill="#f97316"
                  fillOpacity="0.16"
                  stroke="#fb923c"
                  strokeWidth="1.2"
                  strokeOpacity="0.35"
                />
              </g>

              {/* Wild Rising Flame Wave Line */}
              <path
                d="M0 120 Q 30 95, 60 115 T 120 100 T 140 120"
                fill="none"
                stroke="#ff4500"
                strokeWidth="1"
                strokeOpacity="0.18"
              />

              {/* Glowing Ember Sparkles (สะเก็ดไฟลอย) */}
              <g transform="translate(20, 20)">
                <path d="M0 -4 L0 4 M-4 0 L4 0" stroke="#fba040" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
                <circle cx="0" cy="0" r="1.2" fill="#ffd166" fillOpacity="0.4" />
              </g>
              <g transform="translate(110, 85)">
                <path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#ff4500" strokeWidth="0.9" strokeOpacity="0.3" strokeLinecap="round" />
                <circle cx="0" cy="0" r="1" fill="#ffa07a" fillOpacity="0.35" />
              </g>
              <g transform="translate(65, 15) scale(0.8)">
                <path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
              </g>

              {/* Floating Ash / Ember Dots (เม็ดไฟประกายลอย) */}
              <circle cx="48" cy="18" r="1.5" fill="#f97316" fillOpacity="0.3" />
              <circle cx="85" cy="115" r="2" fill="#ef4444" fillOpacity="0.25" />
              <circle cx="125" cy="45" r="1.5" fill="#ffd166" fillOpacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fire-pattern)" />
        </svg>

        {/* Roaring Bottom Flame Aura Graphic */}
        <div className="absolute -bottom-12 -right-12 w-[420px] h-[360px] opacity-25 pointer-events-none">
          <svg viewBox="0 0 350 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 280 C 60 220, 40 170, 80 120 C 100 90, 130 110, 140 70 C 160 110, 200 130, 180 180 C 220 140, 250 180, 230 220 C 270 190, 290 230, 270 280 Z"
              fill="url(#big-flame-gradient)"
              stroke="#ff4500"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            {/* Inner Core Flame */}
            <path
              d="M130 280 C 110 240, 100 200, 130 160 C 145 140, 160 160, 170 130 C 180 160, 210 180, 195 210 C 220 190, 230 220, 215 280 Z"
              fill="#fbbf24"
              fillOpacity="0.25"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
            <defs>
              <linearGradient id="big-flame-gradient" x1="180" y1="70" x2="180" y2="280" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffedd5" stopOpacity="0.6" />
                <stop offset="0.3" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="0.8" stopColor="#b91c1c" stopOpacity="0.2" />
                <stop offset="1" stopColor="#450a0a" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
