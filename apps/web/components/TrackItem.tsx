'use client';

import React from 'react';
import { Trash2, GripVertical, ArrowUp, ArrowDown, Music2, Sparkles, ExternalLink, Clock } from 'lucide-react';
import { Track } from '../store/usePlaylistStore';

interface TrackItemProps {
  track: Track;
  index: number;
  totalTracks: number;
  onRemove: (trackId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Color coding by energy level for visual flair
function getEnergyColor(energy: number): string {
  if (energy >= 0.75) return 'text-[#ff8c69] border-[#6b3020]'; // high energy - orange
  if (energy >= 0.5) return 'text-[#ffd166] border-[#5a4a10]';  // mid energy - yellow
  return 'text-[#8ce4aa] border-[#234230]';                       // low energy - green
}

export function TrackItem({
  track,
  index,
  totalTracks,
  onRemove,
  onMove,
}: TrackItemProps) {
  const f = track.audioFeatures;

  return (
    <article className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0e1913]/90 hover:bg-[#15251c] border border-[#1e3829] hover:border-[#2d573f] transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag handle / Reorder buttons */}
        <div className="flex items-center text-[#557863] group-hover:text-[#90b89f] transition-colors">
          <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
          <div className="flex flex-col ml-0.5">
            <button
              onClick={() => onMove(index, index - 1)}
              disabled={index === 0}
              title="เลื่อนขึ้น"
              className="p-0.5 hover:text-[#1ed760] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onMove(index, index + 1)}
              disabled={index === totalTracks - 1}
              title="เลื่อนลง"
              className="p-0.5 hover:text-[#1ed760] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Index number */}
        <span className="text-xs font-mono text-[#587a66] w-5 text-right shrink-0">
          {index + 1}
        </span>

        {/* Album Cover */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a2f24] shrink-0 border border-[#234231] shadow-md">
          {track.albumCoverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumCoverUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#416850]">
              <Music2 className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#1ed760] transition-colors max-w-[200px] sm:max-w-none">
              {track.title}
            </h4>
            {track.matchScore && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#143d26] text-[#1ed760] border border-[#1ed760]/30 shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                {track.matchScore}% Match
              </span>
            )}
          </div>

          {/* Artist / Album / Duration row */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-[#89ab97] truncate">
              {track.artistName}
              {track.albumName ? (
                <span className="text-[#5e7d6b]"> • {track.albumName}</span>
              ) : null}
            </p>
            {track.durationMs && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-[#5e7d6b] shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {formatDuration(track.durationMs)}
              </span>
            )}
          </div>

          {/* Audio Feature Chips (When Available) */}
          {f && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded bg-[#162a1f] border ${getEnergyColor(f.energy)}`}>
                ⚡ {(f.energy * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#162a1f] text-[#c4aaff] border border-[#3d2d5a]">
                💃 {(f.danceability * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#162a1f] text-[#ffaed6] border border-[#5a2040]">
                🎭 {(f.valence * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#162a1f] text-[#a8d8ea] border border-[#1e3d4a]">
                🎸 {(f.acousticness * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center justify-end gap-1.5 shrink-0">
        {/* Spotify external link (if available) */}
        {track.spotifyUrl && (
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="เปิดใน Spotify"
            className="p-2 rounded-lg text-[#1ed760]/50 hover:text-[#1ed760] hover:bg-[#1ed760]/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {/* Remove button */}
        <button
          onClick={() => onRemove(track.id)}
          title="ลบเพลงออกจากเพลย์ลิสต์"
          className="p-2 rounded-lg text-[#7c9d89] hover:text-[#ff6b6b] hover:bg-[#341818] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
