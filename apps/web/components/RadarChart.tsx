'use client';

import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { AudioFeatures } from '../store/usePlaylistStore';

interface RadarChartProps {
  features?: Partial<AudioFeatures> | null;
  title?: string;
}

export function AudioRadarChart({
  features,
  title = '7-Axis Audio Vibe Target',
}: RadarChartProps) {
  const chartData = [
    { subject: 'Danceability', value: features?.danceability ?? 0.7, fullMark: 1.0 },
    { subject: 'Valence', value: features?.valence ?? 0.6, fullMark: 1.0 },
    { subject: 'Energy', value: features?.energy ?? 0.8, fullMark: 1.0 },
    { subject: 'Acousticness', value: features?.acousticness ?? 0.3, fullMark: 1.0 },
    { subject: 'Instrumental', value: features?.instrumentalness ?? 0.2, fullMark: 1.0 },
    { subject: 'Liveness', value: features?.liveness ?? 0.4, fullMark: 1.0 },
    { subject: 'Speechiness', value: features?.speechiness ?? 0.1, fullMark: 1.0 },
  ];

  return (
    <div className="bg-[#121d17]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-[#a9edbd] uppercase">
            {title}
          </h3>
          <p className="text-xs text-[#7ea08d]">
            เวกเตอร์ 7 มิติเสียงเป้าหมายที่คำนวณจากอารมณ์ของคุณ
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1b3b29] text-[#1ed760] font-bold border border-[#1ed760]/30">
          AI Target Vector
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Radar Graphic */}
        <div className="w-full h-64 md:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#2c4a39" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#a2c4b0', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 1.0]}
                tick={{ fill: '#6c8f79', fontSize: 10 }}
              />
              <Radar
                name="Target Vibe"
                dataKey="value"
                stroke="#1ed760"
                fill="#1ed760"
                fillOpacity={0.45}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>

        {/* 7 Dimensions Stats Breakdown */}
        <div className="bg-[#0b1410] border border-[#1f3a2b] rounded-xl p-3 space-y-1.5 text-xs">
          <div className="font-semibold text-[#8eb09c] pb-1 border-b border-[#1b3425] flex justify-between">
            <span>Dimension</span>
            <span>Target Stat</span>
          </div>
          {chartData.map((d) => (
            <div key={d.subject} className="flex items-center justify-between">
              <span className="text-[#a5c7b3]">{d.subject}:</span>
              <span className="font-mono font-bold text-[#1ed760]">
                {(d.value * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
