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
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function getEnergyColor(energy: number): string {
  if (energy >= 0.75) return 'text-[#ff8c69] border-[#6b3020]';
  if (energy >= 0.5) return 'text-[#ffd166] border-[#5a4a10]';
  return 'text-[#8ce4aa] border-[#234230]';
}

export function TrackItem({
  track,
  index,
  totalTracks,
  onRemove,
  onMove,
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
      className="group flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-xl bg-[#0e1913]/90 hover:bg-[#15251c] border border-[#1e3829] hover:border-[#2d573f] transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag handle / Reorder buttons */}
        <div className="flex items-center text-[#557863] group-hover:text-[#90b89f] transition-colors shrink-0">
          <GripVertical className="w-3 h-3 cursor-grab active:cursor-grabbing" />
          <div className="flex flex-col ml-0.5">
            <button
              type="button"
              onClick={() => onMove(index, index - 1)}
              disabled={index === 0}
              title="เลื่อนขึ้น"
              className="hover:text-[#1ed760] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove(index, index + 1)}
              disabled={index === totalTracks - 1}
              title="เลื่อนลง"
              className="hover:text-[#1ed760] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Index number */}
        <span className="text-[11px] font-mono text-[#587a66] w-4 text-right shrink-0">
          {index + 1}
        </span>

        {/* Compact Album Cover */}
        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-[#1a2f24] shrink-0 border border-[#234231]">
          {track.albumCoverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumCoverUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#416850]">
              <Music2 className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Track Title & Artist (2 compact lines) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#1ed760] transition-colors leading-tight">
              {track.title}
            </h4>
            {Boolean(track.matchScore && track.matchScore > 0) && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[9px] font-bold bg-[#143d26] text-[#1ed760] border border-[#1ed760]/30 shrink-0">
                <Sparkles className="w-2 h-2" />
                {track.matchScore}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <p className="text-[11px] text-[#89ab97] truncate leading-tight">
              {track.artistName}
              {track.albumName ? (
                <span className="text-[#5e7d6b]"> • {track.albumName}</span>
              ) : null}
            </p>
            {Boolean(track.durationMs && track.durationMs > 0) && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-[#5e7d6b] shrink-0">
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
            <span className={`text-[9px] px-1.5 py-0.5 rounded bg-[#162a1f] border ${getEnergyColor(f.energy)}`}>
              ⚡ {(f.energy * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#162a1f] text-[#c4aaff] border border-[#3d2d5a]">
              💃 {(f.danceability * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#162a1f] text-[#ffaed6] border border-[#5a2040]">
              🎭 {(f.valence * 100).toFixed(0)}%
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#162a1f] text-[#a8d8ea] border border-[#1e3d4a]">
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
            className="p-1 rounded-lg text-[#1ed760]/50 hover:text-[#1ed760] hover:bg-[#1ed760]/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onRemove(track.id)}
          title="ลบเพลงออกจากเพลย์ลิสต์"
          className="p-1 rounded-lg text-[#7c9d89] hover:text-[#ff6b6b] hover:bg-[#341818] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
