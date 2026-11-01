'use client';

import React from 'react';
import { Trash2, GripVertical, ArrowUp, ArrowDown, Music2, Sparkles, ExternalLink, Clock } from 'lucide-react';
import { Track } from '../store/usePlaylistStore';

interface TrackItemProps {
  track: Track;
  index: number;
  totalTracks: number;
  onRemove: (trackId: string) => void | Promise<void>;
  onMove: (fromIndex: number, toIndex: number) => void | Promise<void>;
  accentColor?: string;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function getEnergyColor(energy: number): string {
  if (energy >= 0.75) return 'text-[#ff8c69] border-[#ff8c69]/30';
  if (energy >= 0.5) return 'text-[#ffd166] border-[#ffd166]/30';
  return 'text-[#8ce4aa] border-[#8ce4aa]/30';
}

export function TrackItem({
  track,
  index,
  totalTracks,
  onRemove,
  onMove,
  accentColor = '#ffffff',
}: TrackItemProps) {
  const f = track.audioFeatures;
  const handleDragStart = (event: React.DragEvent<HTMLElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isInteger(sourceIndex) && sourceIndex !== index) {
      void onMove(sourceIndex, index);
    }
  };

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="group flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-xl bg-[#0e0e13]/85 hover:bg-white/[0.08] border border-white/10 hover:border-white/30 transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag handle / Reorder buttons */}
        <div className="flex items-center text-white/35 group-hover:text-white/75 transition-colors shrink-0">
          <GripVertical className="w-3 h-3 cursor-grab active:cursor-grabbing" />
          <div className="flex flex-col ml-0.5">
            <button
              type="button"
              onClick={() => onMove(index, index - 1)}
              disabled={index === 0}
              title="เลื่อนขึ้น"
              className="hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowUp className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove(index, index + 1)}
              disabled={index === totalTracks - 1}
              title="เลื่อนลง"
              className="hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Index number */}
        <span className="text-[11px] font-mono text-white/45 w-4 text-right shrink-0">
          {index + 1}
        </span>

        {/* Compact Album Cover */}
        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white/[0.06] shrink-0 border border-white/15">
          {track.albumCoverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumCoverUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40">
              <Music2 className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Track Title & Artist (2 compact lines) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-white truncate transition-colors leading-tight">
              {track.title}
            </h4>
            {Boolean(track.matchScore && track.matchScore > 0) && (
              <span
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}45`,
                  backgroundColor: `${accentColor}15`,
                }}
                className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[9px] font-bold border shrink-0"
              >
                <Sparkles className="w-2 h-2" />
                {track.matchScore}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <p className="text-[11px] text-white/60 truncate leading-tight">
              {track.artistName}
              {track.albumName ? (
                <span className="text-white/40"> • {track.albumName}</span>
              ) : null}
            </p>
            {Boolean(track.durationMs && track.durationMs > 0) && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-white/45 shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {formatDuration(track.durationMs!)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Inline Audio Feature Chips + Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {f && (
          <div className="hidden xl:flex items-center gap-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] border ${getEnergyColor(f.energy)}`}>
              ⚡ {(f.energy * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#c4aaff] border border-[#c4aaff]/30">
              💃 {(f.danceability * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#ffaed6] border border-[#ffaed6]/30">
              🎭 {(f.valence * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#a8d8ea] border border-[#a8d8ea]/30">
              🎸 {(f.acousticness * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {track.spotifyUrl && (
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="เปิดใน Spotify"
            className="p-1 rounded-lg text-white/50 hover:text-[#1ed760] hover:bg-[#1ed760]/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onRemove(track.id)}
          title="ลบเพลงออกจากเพลย์ลิสต์"
          className="p-1 rounded-lg text-white/45 hover:text-[#ff6b6b] hover:bg-red-500/15 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
