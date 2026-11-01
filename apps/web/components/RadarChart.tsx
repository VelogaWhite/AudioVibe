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
  title = '7-AXIS AUDIO VIBE VECTOR PROFILE',
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
      <div className="flex-1 min-h-[160px] bg-[#121d17]/90 border border-[#234230] rounded-2xl p-3.5 shadow-lg backdrop-blur flex flex-col">
        <div className="mb-1 shrink-0">
          <h3 className="text-xs font-bold tracking-wider text-[#a9edbd] uppercase">
            {title}
          </h3>
          <p className="text-[11px] text-[#7ea08d]">
            เวกเตอร์ 7 มิติเสียงเป้าหมายที่คำนวณจากอารมณ์ของคุณ
          </p>
        </div>

        <div className="flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart cx="50%" cy="50%" outerRadius="68%" data={chartData}>
              <PolarGrid stroke="#2c4a39" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#a2c4b0', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 1.0]}
                tick={{ fill: '#6c8f79', fontSize: 9 }}
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
      </div>

      {/* Card 2: 7 Dimensions Stats Breakdown */}
      <div className="shrink-0 bg-[#0b1410]/95 border border-[#1f3a2b] rounded-2xl p-3 shadow-lg backdrop-blur space-y-1 text-[11px]">
        <div className="font-semibold text-[#8eb09c] pb-1 border-b border-[#1b3425] flex justify-between">
          <span>Dimension</span>
          <span>Target Stat</span>
        </div>
        {chartData.map((d) => (
          <div key={d.subject} className="flex items-center justify-between leading-tight">
            <span className="text-[#a5c7b3]">{d.subject}:</span>
            <span className="font-mono font-bold text-[#1ed760]">
              {(d.value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
