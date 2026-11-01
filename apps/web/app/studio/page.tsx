'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Music,
  BarChart3,
  ListMusic,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  usePlaylistStore,
  AudioFeatures,
  Track,
  ThemeVibe,
} from '../../store/usePlaylistStore';
import { Sidebar } from '../../components/Sidebar';
import { AIPromptBox } from '../../components/AIPromptBox';
import { TrackItem } from '../../components/TrackItem';
import { SearchSpotify } from '../../components/SearchSpotify';
import { ExportSuccessModal } from '../../components/ExportSuccessModal';
import { BackgroundVibe } from '../../components/BackgroundVibe';
import {
  fetchUserProfile,
  fetchPlaylists,
  createPlaylist as apiCreatePlaylist,
  renamePlaylist as apiRenamePlaylist,
  deletePlaylist as apiDeletePlaylist,
  searchSpotifyTracks,
  addTracksToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  exportPlaylistToSpotify,
  generateAIRecommendations,
} from '../../lib/api';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

// Dynamic import with ssr: false to prevent Recharts SVG hydration freeze!
const AudioRadarChart = dynamic(
  () => import('../../components/RadarChart').then((mod) => mod.AudioRadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center bg-[#121d17]/80 rounded-2xl border border-[#234230] text-[#70947e] text-sm animate-pulse">
        กำลังโหลดกราฟเรดาร์ 7 มิติเสียง...
      </div>
    ),
  },
);

export default function UnifiedPlaylistStudioPage() {
  const {
    currentPlaylist,
    playlists,
    tracks,
    displayMode,
    themeVibe,
    setPlaylist,
    setPlaylists,
    setMode,
    setThemeVibe,
    setExportModalOpen,
  } = usePlaylistStore();

  const [user, setUser] = useState<{
    id: string;
    displayName: string;
    spotifyId: string;
    profileImageUrl?: string;
  }>({
    id: '',
    displayName: 'กำลังโหลด...',
    spotifyId: '',
    profileImageUrl: undefined,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiFeatures, setAiFeatures] = useState<AudioFeatures | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('พร้อมใช้งาน');

  // 1. Initial Load: Get userId from URL or LocalStorage
  const loadInitialData = useCallback(async () => {
    let activeUserId: string | undefined = undefined;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get('userId');
      if (paramId) {
        activeUserId = paramId;
        localStorage.setItem('audiovibe_user_id', paramId);
      } else {
        const storedId = localStorage.getItem('audiovibe_user_id');
        if (storedId) activeUserId = storedId;
      }
    }

    if (!activeUserId) {
      setStatusMessage('กรุณาเข้าสู่ระบบ Spotify ก่อนใช้งาน Studio');
      return;
    }

    try {
      const profile = await fetchUserProfile(activeUserId);
      setUser(profile);
      localStorage.setItem('audiovibe_user_id', profile.id);
      const userPlaylists = await fetchPlaylists(profile.id);
      setPlaylists(userPlaylists);
      setPlaylist(userPlaylists[0] || null);
    } catch (err: unknown) {
      setStatusMessage(`โหลดข้อมูลไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  }, [setPlaylist, setPlaylists]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInitialData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadInitialData]);

  // Handle Playlist Selection
  const handleSelectPlaylist = (id: string) => {
    const selected = playlists.find((p) => p.id === id) || null;
    setPlaylist(selected);
    setMode('MANUAL_MANAGER');
  };

  // Handle Create Playlist
  const handleCreatePlaylist = async () => {
    const name = prompt('ตั้งชื่อเพลย์ลิสต์ใหม่:', 'My AudioVibe Playlist');
    if (!name?.trim()) return;
    if (!user.id) {
      setStatusMessage('ต้องเข้าสู่ระบบก่อนสร้างเพลย์ลิสต์');
      return;
    }

    const trimmedName = name.trim();
    try {
      const newP = await apiCreatePlaylist(user.id, trimmedName);
      setPlaylists([newP, ...playlists]);
      setPlaylist(newP);
      setStatusMessage(`สร้างเพลย์ลิสต์ "${trimmedName}" สำเร็จแล้ว`);
    } catch (err: unknown) {
      setStatusMessage(`สร้างเพลย์ลิสต์ไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  // Handle Rename Playlist
  const handleRenamePlaylist = async () => {
    if (!currentPlaylist || !user.id) return;
    const newName = prompt('ชื่อเพลย์ลิสต์ใหม่:', currentPlaylist.name);
    if (!newName?.trim()) return;

    const trimmed = newName.trim();
    try {
      await apiRenamePlaylist(user.id, currentPlaylist.id, trimmed);
      const updated = playlists.map((p) =>
        p.id === currentPlaylist.id ? { ...p, name: trimmed } : p,
      );
      setPlaylists(updated);
      setPlaylist({ ...currentPlaylist, name: trimmed });
      setStatusMessage(`เปลี่ยนชื่อเป็น "${trimmed}" สำเร็จ`);
    } catch (err: unknown) {
      setStatusMessage(`เปลี่ยนชื่อไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  // Handle Delete Playlist
  const handleDeletePlaylist = async () => {
    if (!currentPlaylist || !user.id) return;
    if (
      !confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเพลย์ลิสต์ "${currentPlaylist.name}"?`)
    )
      return;

    try {
      await apiDeletePlaylist(user.id, currentPlaylist.id);
      const remaining = playlists.filter((p) => p.id !== currentPlaylist.id);
      setPlaylists(remaining);
      setPlaylist(remaining[0] || null);
      setStatusMessage('ลบเพลย์ลิสต์เรียบร้อยแล้ว');
    } catch (err: unknown) {
      setStatusMessage(`ลบเพลย์ลิสต์ไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  // Handle AI Recommendation
  const handleAIGenerate = async (promptText: string, presetLabel?: string) => {
    setIsGenerating(true);
    setStatusMessage('กำลังวิเคราะห์อารมณ์และสกัด 7 มิติเสียงด้วย AI...');

    // Dynamic Theme Switching (Gimmick):
    // 1. Preset label has highest priority
    let themeToSet: ThemeVibe = 'NATURE';

    if (presetLabel) {
      if (presetLabel.includes('รัก')) {
        themeToSet = 'LOVE';
      } else if (presetLabel.includes('เหงา')) {
        themeToSet = 'RAINY';
      } else if (presetLabel.includes('มัน')) {
        themeToSet = 'FIRE';
      } else {
        // '🏡 อยากกลับบ้าน', '🍃 ผ่อนคลาย', '🎯 สมาธิขั้นสุด' -> ธีมสีเขียวธรรมชาติเสมอ
        themeToSet = 'NATURE';
      }
    } else {
      // 2. If user types custom natural language prompt
      const isHomeOrChill = /บ้าน|กลับบ้าน|ผ่อนคลาย|สมาธิ|ชิล|โฟกัส|study|focus|chill|relax|nostalgia/i.test(promptText);

      if (isHomeOrChill) {
        themeToSet = 'NATURE';
      } else if (/คลั่งรัก|เพลงรัก|อินเลิฟ|romantic|วาเลนไทน์|\blove\b|หวาน/i.test(promptText) || (/รัก/i.test(promptText) && !/น่ารัก|อนุรักษ์/i.test(promptText))) {
        themeToSet = 'LOVE';
      } else if (/เหงา|เศร้า|ร้องไห้|อกหัก|ฝน|rain|sad|alone|depress/i.test(promptText)) {
        themeToSet = 'RAINY';
      } else if (/มัน|ตื๊ด|เต้น|rock|dance|club|party|ไฟ|fire|เบสหนัก|สุดเหวี่ยง/i.test(promptText)) {
        themeToSet = 'FIRE';
      } else {
        themeToSet = 'NATURE';
      }
    }

    setThemeVibe(themeToSet);

    try {
      if (!user.id) throw new Error('ต้องเข้าสู่ระบบก่อนใช้ AI แนะนำเพลง');
      const result = await generateAIRecommendations(promptText, presetLabel);
      setAiFeatures(result.targetFeatures);

      // Create or locate playlist title for AI result
      const playlistTitle = presetLabel
        ? `Vibe: ${presetLabel}`
        : `AI Vibe: ${promptText.slice(0, 18)}...`;

      const aiPlaylist = await apiCreatePlaylist(user.id, playlistTitle);
      const persistedPlaylist = await addTracksToPlaylist(
        user.id,
        aiPlaylist.id,
        result.tracks,
      );
      const scoreMap = new Map(result.tracks.map((t) => [t.id, t]));
      const enrichedPlaylist = {
        ...persistedPlaylist,
        tracks: persistedPlaylist.tracks.map((t) => ({
          ...t,
          matchScore: scoreMap.get(t.id)?.matchScore ?? t.matchScore,
          audioFeatures: t.audioFeatures ?? scoreMap.get(t.id)?.audioFeatures,
        })),
      };

      setPlaylists([enrichedPlaylist, ...playlists]);
      setPlaylist(enrichedPlaylist);

      // SPEC: Switch to AI_ANALYTICS mode so Radar Chart is displayed!
      setMode('AI_ANALYTICS');
      setStatusMessage(`AI แนะนำสำเร็จ! พบ ${result.tracks.length} เพลงที่เข้ากับมิติเสียง`);
    } catch (err: unknown) {
      setStatusMessage(`AI แนะนำไม่สำเร็จ: ${getErrorMessage(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Spotify Search
  const handleSearch = async (query: string): Promise<Track[]> => {
    return await searchSpotifyTracks(user.id, query);
  };

  // Handle Add Track manually from search
  const handleAddTrack = async (track: Track) => {
    if (!currentPlaylist || !user.id) {
      setStatusMessage('กรุณาเข้าสู่ระบบและเลือกเพลย์ลิสต์ก่อนเพิ่มเพลง');
      return;
    }
    try {
      const updated = await addTracksToPlaylist(user.id, currentPlaylist.id, [track]);
      setPlaylist(updated);
      setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)));
      setStatusMessage(`เพิ่ม "${track.title}" เข้าเพลย์ลิสต์แล้ว`);
    } catch (err: unknown) {
      setStatusMessage(`เพิ่มเพลงไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!currentPlaylist || !user.id) return;
    try {
      const updated = await removeTrackFromPlaylist(user.id, currentPlaylist.id, trackId);
      setPlaylist(updated);
      setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)));
      setStatusMessage('ลบเพลงออกจากเพลย์ลิสต์แล้ว');
    } catch (err: unknown) {
      setStatusMessage(`ลบเพลงไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleReorderTracks = async (fromIndex: number, toIndex: number) => {
    if (!currentPlaylist || !user.id || fromIndex === toIndex) return;
    const trackIds = tracks.map((track) => track.id);
    const [movedTrackId] = trackIds.splice(fromIndex, 1);
    if (!movedTrackId) return;
    trackIds.splice(toIndex, 0, movedTrackId);
    try {
      const updated = await reorderPlaylistTracks(user.id, currentPlaylist.id, trackIds);
      setPlaylist(updated);
      setPlaylists(playlists.map((p) => (p.id === updated.id ? updated : p)));
      setStatusMessage('จัดลำดับเพลงเรียบร้อยแล้ว');
    } catch (err: unknown) {
      setStatusMessage(`จัดลำดับเพลงไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  // Handle Export to Spotify
  const handleExport = async () => {
    if (!currentPlaylist || tracks.length === 0) return;
    setIsExporting(true);
    setStatusMessage('กำลังส่งออกเพลย์ลิสต์ไปยัง Spotify...');

    try {
      const trackIds = tracks.map((t) => t.id);
      const res = await exportPlaylistToSpotify(
        user.id,
        currentPlaylist.id,
        currentPlaylist.name,
        currentPlaylist.isPublic ?? true,
        trackIds,
      );

      const updatedPlaylist = {
        ...currentPlaylist,
        isExported: true,
        spotifyPlaylistId: res.spotifyPlaylistId,
      };
      setPlaylist(updatedPlaylist);

      setExportModalOpen(true, res.spotifyPlaylistId);
      setStatusMessage('ส่งออกเพลย์ลิสต์เข้า Spotify สำเร็จแล้ว!');
    } catch (err: unknown) {
      setStatusMessage(`Export ไม่สำเร็จ: ${getErrorMessage(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col relative transition-colors duration-700">
      {/* Decorative Dynamic Background (Nature vines/flowers vs Love dark pink/hearts) */}
      <BackgroundVibe theme={themeVibe} />

      {/* Top Navbar */}
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-[#1b3a2a]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#7fa38c] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0f6832] flex items-center justify-center shadow shadow-[#1ed760]/20">
              <Music className="w-5 h-5 text-[#05160b]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Audio<span className="text-[#1ed760]">Vibe</span> Studio
              </h1>
              <p className="text-xs text-[#82a691]">{statusMessage}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main 2-Column Responsive Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 items-start">
        {/* Left Column: Sidebar (30% Width) */}
        <Sidebar
          user={user}
          onCreatePlaylist={handleCreatePlaylist}
          onRefreshPlaylists={loadInitialData}
          onRenamePlaylist={handleRenamePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onExportPlaylist={handleExport}
          onSelectPlaylist={handleSelectPlaylist}
          isExporting={isExporting}
        />

        {/* Right Column: Main Canvas (70% Width) */}
        <main className="w-full lg:w-[70%] flex flex-col gap-6">
          {/* Section 1: AI Smart Recommend (Top) */}
          <AIPromptBox onGenerate={handleAIGenerate} isLoading={isGenerating} />

          {/* Section 2: Current Playlist Tracks & Analytics (Middle) */}
          <section className="bg-[#121f18]/90 border border-[#234230] rounded-2xl p-5 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1f3a2b]">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-[#1ed760]" />
                <h3 className="text-base font-bold text-white">
                  {currentPlaylist?.name || 'Playlist Tracks'}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1b3628] text-[#86a894]">
                  {tracks.length} เพลง
                </span>
              </div>

              {/* Mode indicator notice */}
              <div className="flex items-center gap-2 text-xs text-[#82a691]">
                {displayMode === 'AI_ANALYTICS' ? (
                  <span className="text-[#1ed760] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>แสดงกราฟมิติเสียง AI</span>
                  </span>
                ) : (
                  <span className="text-[#759783] italic">
                    (ซ่อนกราฟเมื่อจัดการแบบ Manual)
                  </span>
                )}
              </div>
            </div>

            {/* CONDITIONAL SPEC: 7-Axis Radar Chart */}
            {displayMode === 'AI_ANALYTICS' && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <AudioRadarChart
                  features={aiFeatures}
                  title="7-Axis Audio Vibe Vector Profile"
                />
              </div>
            )}

            {/* Track List */}
            <div className="space-y-2">
              {tracks.length > 0 ? (
                tracks.map((track, idx) => (
                  <TrackItem
                    key={track.id}
                    track={track}
                    index={idx}
                    totalTracks={tracks.length}
                    onRemove={handleRemoveTrack}
                    onMove={handleReorderTracks}
                  />
                ))
              ) : (
                <div className="text-center py-12 rounded-xl bg-[#0c1611]/60 border border-dashed border-[#1f3a2b] p-6">
                  <BarChart3 className="w-8 h-8 text-[#3d634d] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#9eb7a8]">
                    ยังไม่มีเพลงในเพลย์ลิสต์นี้
                  </p>
                  <p className="text-xs text-[#5e7d6b] mt-1">
                    คุณสามารถใช้กล่อง AI ด้านบนเพื่อแนะนำเพลง หรือค้นหาเพลงสดด้านล่างได้เลย
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Search Spotify (Manual Add) (Bottom) */}
          <SearchSpotify onSearch={handleSearch} onAddTrack={handleAddTrack} />
        </main>
      </div>

      {/* Export Success Modal */}
      <ExportSuccessModal />
    </div>
  );
}
