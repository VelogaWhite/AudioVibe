'use client';

import React from 'react';
import { Trash2, GripVertical, ArrowUp, ArrowDown, Music2 } from 'lucide-react';
import { Track } from '../store/usePlaylistStore';

interface TrackItemProps {
  track: Track;
  index: number;
  totalTracks: number;
  onRemove: (trackId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export function TrackItem({
  track,
  index,
  totalTracks,
  onRemove,
  onMove,
}: TrackItemProps) {
  return (
    <article className="group flex items-center gap-3 p-3 rounded-xl bg-[#0e1913]/90 hover:bg-[#15251c] border border-[#1e3829] hover:border-[#2d573f] transition-all">
      {/* Drag handle / Reorder buttons */}
      <div className="flex items-center text-[#557863] group-hover:text-[#90b89f]">
        <GripVertical className="w-4 h-4 cursor-grab" />
        <div className="flex flex-col ml-1">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            title="เลื่อนขึ้น"
            className="p-0.5 hover:text-[#1ed760] disabled:opacity-20 disabled:hover:text-inherit"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index === totalTracks - 1}
            title="เลื่อนลง"
            className="p-0.5 hover:text-[#1ed760] disabled:opacity-20 disabled:hover:text-inherit"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Index number */}
      <span className="text-xs font-mono text-[#587a66] w-5 text-right">
        {index + 1}
      </span>

      {/* Album Cover */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a2f24] shrink-0 border border-[#234231]">
        {track.albumCoverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.albumCoverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#416850]">
            <Music2 className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#1ed760] transition-colors">
          {track.title}
        </h4>
        <p className="text-xs text-[#89ab97] truncate mt-0.5">
          {track.artistName} {track.albumName ? `• ${track.albumName}` : ''}
        </p>
      </div>

      {/* Actions: Trash Icon (No HTML5 <audio> tag allowed!) */}
      <div className="flex items-center gap-2">
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
