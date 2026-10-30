'use client';

import React from 'react';
import { CheckCircle2, ExternalLink, X } from 'lucide-react';
import { usePlaylistStore } from '../store/usePlaylistStore';

export function ExportSuccessModal() {
  const { exportModalOpen, lastExportedId, setExportModalOpen, currentPlaylist } =
    usePlaylistStore();

  if (!exportModalOpen) return null;

  const spotifyUrl = lastExportedId
    ? `https://open.spotify.com/playlist/${lastExportedId}`
    : 'https://open.spotify.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#121f18] border border-[#274f37] p-6 shadow-2xl text-center">
        <button
          onClick={() => setExportModalOpen(false)}
          className="absolute top-4 right-4 text-[#7b9c88] hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1b432c] text-[#1ed760] mb-4">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Export สำเร็จแล้ว! 🎉</h3>
        <p className="text-sm text-[#9eb7a8] mb-6">
          เพลย์ลิสต์ <strong className="text-[#eef8f2]">{currentPlaylist?.name}</strong> ถูกสร้างและส่งออกไปยังบัญชี Spotify ของคุณเรียบร้อยแล้ว
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold bg-[#1ed760] hover:bg-[#1db954] text-[#06140a] transition-colors"
          >
            <span>Open in Spotify</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => setExportModalOpen(false)}
            className="w-full py-2.5 px-4 rounded-xl font-medium bg-[#1d3025] hover:bg-[#253f31] text-[#9eb7a8] transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
