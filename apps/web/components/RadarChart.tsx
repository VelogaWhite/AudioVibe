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

export function AudioRadarChart({ features, title = '7-Axis Audio Vibe' }: RadarChartProps) {
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
    <div className="bg-[#121d17]/80 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold tracking-wider text-[#a9edbd] uppercase">
          {title}
        </h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#1b3b29] text-[#1ed760] font-medium">
          AI Analysis
        </span>
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
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
              name="Vibe Profile"
              dataKey="value"
              stroke="#1ed760"
              fill="#1ed760"
              fillOpacity={0.45}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
