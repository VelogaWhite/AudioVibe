'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Music,
  Sparkles,
  ArrowLeft,
  User as UserIcon,
} from 'lucide-react';
import {
  usePlaylistStore,
  Playlist,
  ThemeVibe,
} from '../../store/usePlaylistStore';
import { Sidebar } from '../../components/Sidebar';
import { AIPromptBox } from '../../components/AIPromptBox';
import { ExportSuccessModal } from '../../components/ExportSuccessModal';
import { BackgroundVibe } from '../../components/BackgroundVibe';
import {
  fetchUserProfile,
  fetchPlaylists,
  createPlaylist as apiCreatePlaylist,
  renamePlaylist as apiRenamePlaylist,
  deletePlaylist as apiDeletePlaylist,
  addTracksToPlaylist,
  exportPlaylistToSpotify,
  generateAIRecommendations,
} from '../../lib/api';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

export default function StudioPromptPage() {
  const router = useRouter();
  const {
    currentPlaylist,
    playlists,
    tracks,
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

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('พร้อมสร้างเพลย์ลิสต์ใหม่ด้วย AI');

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
    } catch (err: unknown) {
      setStatusMessage(`โหลดข้อมูลไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  }, [setPlaylists]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInitialData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadInitialData]);

  const applyThemeFromPrompt = (promptText: string, presetLabel?: string) => {
    let themeToSet: ThemeVibe = 'NATURE';
    if (presetLabel) {
      if (presetLabel.includes('รัก')) {
        themeToSet = 'LOVE';
      } else if (presetLabel.includes('เหงา')) {
        themeToSet = 'RAINY';
      } else if (presetLabel.includes('มัน')) {
        themeToSet = 'FIRE';
      } else {
        themeToSet = 'NATURE';
      }
    } else {
      const isHomeOrChill =
        /บ้าน|กลับบ้าน|ผ่อนคลาย|สมาธิ|ชิล|โฟกัส|study|focus|chill|relax|nostalgia/i.test(
          promptText,
        );
      if (isHomeOrChill) {
        themeToSet = 'NATURE';
      } else if (
        /คลั่งรัก|เพลงรัก|อินเลิฟ|romantic|วาเลนไทน์|\blove\b|หวาน/i.test(
          promptText,
        ) ||
        (/รัก/i.test(promptText) && !/น่ารัก|อนุรักษ์/i.test(promptText))
      ) {
        themeToSet = 'LOVE';
      } else if (
        /เหงา|เศร้า|ร้องไห้|อกหัก|ฝน|rain|sad|alone|depress/i.test(promptText)
      ) {
        themeToSet = 'RAINY';
      } else if (
        /มัน|ตื๊ด|เต้น|rock|dance|club|party|ไฟ|fire|เบสหนัก|สุดเหวี่ยง/i.test(
          promptText,
        )
      ) {
        themeToSet = 'FIRE';
      } else {
        themeToSet = 'NATURE';
      }
    }
    setThemeVibe(themeToSet);
  };

  // Navigate to dedicated Page 4 route (/playlist?userId=...&playlistId=...) when clicking a playlist in Sidebar
  const handleSelectPlaylist = (id: string) => {
    const selected = playlists.find((p) => p.id === id) || null;
    if (selected) {
      setPlaylist(selected);
      setMode('AI_ANALYTICS');
    }
    const uid = user.id || localStorage.getItem('audiovibe_user_id') || '';
    router.push(
      `/playlist?userId=${encodeURIComponent(uid)}&playlistId=${encodeURIComponent(id)}`,
    );
  };

  const handleRenamePlaylist = async (targetPlaylist?: Playlist) => {
    const target = targetPlaylist || currentPlaylist;
    if (!target || !user.id) return;
    const newName = prompt('ชื่อเพลย์ลิสต์ใหม่:', target.name);
    if (!newName?.trim()) return;

    const trimmed = newName.trim();
    try {
      await apiRenamePlaylist(user.id, target.id, trimmed);
      const updated = playlists.map((p) =>
        p.id === target.id ? { ...p, name: trimmed } : p,
      );
      setPlaylists(updated);
      if (currentPlaylist?.id === target.id) {
        setPlaylist({ ...currentPlaylist, name: trimmed });
      }
      setStatusMessage(`เปลี่ยนชื่อเป็น "${trimmed}" สำเร็จ`);
    } catch (err: unknown) {
      setStatusMessage(`เปลี่ยนชื่อไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleDeletePlaylist = async (targetPlaylist?: Playlist) => {
    const target = targetPlaylist || currentPlaylist;
    if (!target || !user.id) return;
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเพลย์ลิสต์ "${target.name}"?`))
      return;

    try {
      await apiDeletePlaylist(user.id, target.id);
      const remaining = playlists.filter((p) => p.id !== target.id);
      setPlaylists(remaining);
      if (currentPlaylist?.id === target.id) {
        setPlaylist(remaining[0] || null);
      }
      setStatusMessage('ลบเพลย์ลิสต์เรียบร้อยแล้ว');
    } catch (err: unknown) {
      setStatusMessage(`ลบเพลย์ลิสต์ไม่สำเร็จ: ${getErrorMessage(err)}`);
    }
  };

  const handleExport = async (targetPlaylist?: Playlist) => {
    const target = targetPlaylist || currentPlaylist;
    const targetTracks = targetPlaylist ? targetPlaylist.tracks || [] : tracks;
    if (!target || targetTracks.length === 0) return;
    setIsExporting(true);
    setStatusMessage(`กำลังส่งออกเพลย์ลิสต์ "${target.name}" ไปยัง Spotify...`);

    try {
      const trackIds = targetTracks.map((t) => t.id);
      const res = await exportPlaylistToSpotify(
        user.id,
        target.id,
        target.name,
        target.isPublic ?? true,
        trackIds,
      );

      const updatedPlaylist: Playlist = {
        ...target,
        isExported: true,
        spotifyPlaylistId: res.spotifyPlaylistId,
      };
      setPlaylists(
        playlists.map((p) => (p.id === target.id ? updatedPlaylist : p)),
      );
      if (currentPlaylist?.id === target.id) {
        setPlaylist(updatedPlaylist);
      }

      setExportModalOpen(true, res.spotifyPlaylistId);
      setStatusMessage('ส่งออกเพลย์ลิสต์เข้า Spotify สำเร็จแล้ว!');
    } catch (err: unknown) {
      setStatusMessage(`Export ไม่สำเร็จ: ${getErrorMessage(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate new playlist on Page 3 and navigate to /studio/[playlistId] (Page 4)
  const handleAIGenerate = async (promptText: string, presetLabel?: string) => {
    setIsGenerating(true);
    setStatusMessage('กำลังวิเคราะห์อารมณ์และสกัด 7 มิติเสียงด้วย AI...');
    applyThemeFromPrompt(promptText, presetLabel);

    try {
      if (!user.id) throw new Error('ต้องเข้าสู่ระบบก่อนใช้ AI แนะนำเพลง');
      const result = await generateAIRecommendations(promptText, presetLabel);

      const playlistTitle = presetLabel
        ? `Vibe: ${presetLabel}`
        : `AI Vibe: ${promptText.slice(0, 22)}${promptText.length > 22 ? '...' : ''}`;

      const aiPlaylist = await apiCreatePlaylist(user.id, playlistTitle);
      const persistedPlaylist = await addTracksToPlaylist(
        user.id,
        aiPlaylist.id,
        result.tracks,
      );
      const scoreMap = new Map(result.tracks.map((t) => [t.id, t]));
      const enrichedPlaylist: Playlist = {
        ...persistedPlaylist,
        tracks: persistedPlaylist.tracks.map((t) => ({
          ...t,
          matchScore: scoreMap.get(t.id)?.matchScore ?? t.matchScore,
          audioFeatures: t.audioFeatures ?? scoreMap.get(t.id)?.audioFeatures,
        })),
      };

      if (typeof window !== 'undefined') {
        const scoresObj = Object.fromEntries(
          enrichedPlaylist.tracks
            .filter((t) => t.matchScore)
            .map((t) => [t.id, t.matchScore!]),
        );
        sessionStorage.setItem(
          `audiovibe_scores_${enrichedPlaylist.id}`,
          JSON.stringify(scoresObj),
        );
        sessionStorage.setItem(
          `audiovibe_features_${enrichedPlaylist.id}`,
          JSON.stringify(result.targetFeatures),
        );
      }

      setPlaylists([enrichedPlaylist, ...playlists]);
      setPlaylist(enrichedPlaylist);
      setMode('AI_ANALYTICS');
      router.push(
        `/playlist?userId=${encodeURIComponent(user.id)}&playlistId=${encodeURIComponent(enrichedPlaylist.id)}`,
      );
    } catch (err: unknown) {
      setStatusMessage(`AI แนะนำไม่สำเร็จ: ${getErrorMessage(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex relative transition-colors duration-700 overflow-hidden">
      <BackgroundVibe theme={themeVibe} />

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        isNewPlaylistView={true}
        onNewPlaylistClick={() => {}}
        onSelectPlaylist={handleSelectPlaylist}
        onRenamePlaylist={handleRenamePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
        onExportPlaylist={handleExport}
        onRefreshPlaylists={loadInitialData}
        isExporting={isExporting}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10 px-6 py-4">
        {/* Top Header with User Profile at Top-Right */}
        <header className="flex items-center justify-between gap-4 pb-3 border-b border-[#1b3a2a] shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#7fa38c] hover:text-white transition-colors"
              title="กลับหน้าแรก"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0f6832] flex items-center justify-center shadow shadow-[#1ed760]/20">
                <Music className="w-4 h-4 text-[#05160b]" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  Audio<span className="text-[#1ed760]">Vibe</span> Studio
                </h1>
                <p className="text-[11px] text-[#82a691]">{statusMessage}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#121f18]/95 border border-[#234230] rounded-2xl px-3.5 py-2 shadow-lg backdrop-blur">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1b3827] border-2 border-[#1ed760] shrink-0">
              {user?.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImageUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#558367]">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate max-w-[160px]">
                {user?.displayName || 'กำลังโหลด...'}
              </h3>
              <p className="text-[10px] text-[#82a691] truncate font-mono max-w-[180px]">
                Spotify: {user?.spotifyId || 'unknown'}
              </p>
            </div>
          </div>
        </header>

        {/* PAGE 3: Gemini-style Centered AI Prompt View */}
        <main className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#132c1f] border border-[#214f34] text-[#1ed760] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Playlist Generator</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              เราจะเริ่มจากอารมณ์ไหนก่อนดี?
            </h2>
            <p className="text-sm text-[#86a894]">
              พิมพ์บอกอารมณ์หรือเลือก Mood Preset ด้านล่างเพื่อสร้างเพลย์ลิสต์ใหม่ หรือคลิกเลือกเพลย์ลิสต์เดิมจากแถบด้านซ้าย
            </p>
          </div>

          <AIPromptBox
            mode="create"
            onGenerate={handleAIGenerate}
            isLoading={isGenerating}
          />
        </main>
      </div>

      <ExportSuccessModal />
    </div>
  );
}
