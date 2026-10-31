'use client';

import React from 'react';

export type ThemeVibe = 'NATURE' | 'LOVE';

interface BackgroundVibeProps {
  theme: ThemeVibe;
}

export function BackgroundVibe({ theme }: BackgroundVibeProps) {
  const isLove = theme === 'LOVE';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-700 ease-in-out"
      style={{
        backgroundColor: isLove ? '#0d0208' : '#050907',
      }}
    >
      {/* Dynamic Ambient Radial Glows */}
      <div
        className={`absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-all duration-700 ease-in-out ${
          isLove
            ? 'bg-gradient-to-br from-[#ff2a7a] via-[#991b4f] to-transparent'
            : 'bg-gradient-to-br from-[#1ed760] via-[#0f6832] to-transparent'
        }`}
      />
      <div
        className={`absolute bottom-[-150px] right-[-100px] w-[550px] h-[550px] rounded-full blur-[130px] opacity-30 transition-all duration-700 ease-in-out ${
          isLove
            ? 'bg-gradient-to-tl from-[#e11d48] via-[#700f33] to-transparent'
            : 'bg-gradient-to-tl from-[#176239] via-[#082816] to-transparent'
        }`}
      />

      {/* THEME 1: NATURE (พืชพรรณ เถาวัลย์เลื้อยไม้ และดอกไม้) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          isLove ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            {/* Seamless Botanical Repeating Pattern (Vines, Leaves, Flowers) */}
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
                {/* Petals */}
                <circle cx="0" cy="-7" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="7" cy="-2" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="4" cy="6" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="-4" cy="6" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                <circle cx="-7" cy="-2" r="5" fill="#38a169" fillOpacity="0.1" stroke="#1ed760" strokeWidth="0.6" strokeOpacity="0.2" />
                {/* Center pistil */}
                <circle cx="0" cy="0" r="2.5" fill="#ffd166" fillOpacity="0.2" stroke="#1ed760" strokeWidth="0.5" strokeOpacity="0.3" />
              </g>

              {/* Smaller Flower (ดอกตูม/ดอกเล็ก) */}
              <g transform="translate(18, 115) scale(0.5)">
                <circle cx="0" cy="-6" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="6" cy="0" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="0" cy="6" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="-6" cy="0" r="4" fill="#1ed760" fillOpacity="0.09" />
                <circle cx="0" cy="0" r="2" fill="#8ce4aa" fillOpacity="0.25" />
              </g>

              {/* Little Sprout Tendrils (หนวดไม้เลื้อย) */}
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
            {/* Monstera / Fern Silhouette Leaves */}
            <path
              d="M70 70 C 110 50, 130 90, 85 105 Z"
              fill="#1ed760"
              fillOpacity="0.3"
            />
            <path
              d="M130 110 C 180 90, 195 130, 145 145 Z"
              fill="#2ee573"
              fillOpacity="0.25"
            />
            <path
              d="M180 160 C 230 140, 250 180, 200 195 Z"
              fill="#1ed760"
              fillOpacity="0.3"
            />
          </svg>
        </div>
      </div>

      {/* THEME 2: LOVE (เพลงรัก โทนชมพูมืด ลวดลายหัวใจและแสงโรแมนติก) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          isLove ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            {/* Seamless Heart Repeating Pattern */}
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

              {/* Romantic Sparkles / Star Cross */}
              <g transform="translate(25, 95)">
                <path
                  d="M0 -4 L0 4 M-4 0 L4 0"
                  stroke="#ffaed6"
                  strokeWidth="0.8"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                />
              </g>
              <g transform="translate(115, 45)">
                <path
                  d="M0 -3 L0 3 M-3 0 L3 0"
                  stroke="#ffaed6"
                  strokeWidth="0.7"
                  strokeOpacity="0.2"
                  strokeLinecap="round"
                />
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
    </div>
  );
}
