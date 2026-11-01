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
  accentColor?: string;
  accentGlow?: string;
}

export function AudioRadarChart({
  features,
  title = '7-AXIS AUDIO VIBE VECTOR PROFILE',
  accentColor = '#ffffff',
  accentGlow = 'rgba(255, 255, 255, 0.2)',
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
    <div className="flex-1 min-h-0 flex flex-col gap-2.5">
      {/* Card 1: 7-Axis Radar Graphic */}
      <div
        style={{
          borderColor: `${accentColor}38`,
          boxShadow: `0 0 28px ${accentGlow}, 0 8px 30px rgba(0,0,0,0.5)`,
        }}
        className="flex-1 min-h-[160px] bg-[#121216]/75 border rounded-2xl p-3.5 backdrop-blur-xl flex flex-col transition-all duration-500"
      >
        <div className="mb-1 shrink-0">
          <h3
            style={{ color: accentColor }}
            className="text-xs font-bold tracking-wider uppercase transition-colors duration-500"
          >
            {title}
          </h3>
          <p className="text-[11px] text-white/55">
            เวกเตอร์ 7 มิติเสียงเป้าหมายที่คำนวณจากอารมณ์ของคุณ
          </p>
        </div>

        <div className="flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart cx="50%" cy="50%" outerRadius="68%" data={chartData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.14)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'rgba(255, 255, 255, 0.78)', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 1.0]}
                tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 9 }}
              />
              <Radar
                name="Target Vibe"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2}
                fill={accentColor}
                fillOpacity={0.38}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2: 7 Dimensions Stats Breakdown */}
      <div
        style={{
          borderColor: `${accentColor}30`,
          boxShadow: `0 0 22px ${accentGlow}`,
        }}
        className="shrink-0 bg-[#101014]/80 border rounded-2xl p-3 backdrop-blur-xl space-y-1 text-[11px] transition-all duration-500"
      >
        <div className="font-semibold text-white/60 pb-1 border-b border-white/10 flex justify-between">
          <span>Dimension</span>
          <span>Target Stat</span>
        </div>
        {chartData.map((d) => (
          <div key={d.subject} className="flex items-center justify-between leading-tight">
            <span className="text-white/75">{d.subject}:</span>
            <span
              style={{ color: accentColor }}
              className="font-mono font-bold transition-colors duration-500"
            >
              {(d.value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
