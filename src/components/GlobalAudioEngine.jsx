import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  nextSongGlobal, prevSongGlobal, togglePlayGlobal, 
  setCurrentTime, updateListeningStatusAsync, setCurrentSongIndex, setIsPlayingGlobal 
} from '../store/slices/musicSlice';
import { fetchAllAppDataAsync } from '../store/slices/appDataSlices';
import { Disc, Play, Pause, SkipForward, Music, Sparkles } from 'lucide-react';

export const GlobalAudioEngine = ({ activeTab, setActiveTab }) => {
  const dispatch = useDispatch();
  const { playlist, currentSongIndex, isPlayingGlobal, listeningState, currentTime } = useSelector((state) => state.music);
  const activeRole = useSelector((state) => state.couple.activeRole);
  const currentSong = playlist[currentSongIndex];
  const audioRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Helper to extract YouTube video ID
  const getYouTubeVideoId = (source) => {
    if (!source) return null;
    if (source.length === 11 && !source.includes('/') && !source.includes('.')) {
      return source;
    }
    const match = source.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const ytId = getYouTubeVideoId(currentSong?.source);
  const isAudioType = !ytId && (currentSong?.type === 'audio' || currentSong?.source?.endsWith('.mp3') || currentSong?.source?.includes('audio'));

  // 1. Sync active role's listening status (including currentTime) to server
  useEffect(() => {
    if (!activeRole || !currentSong) return;
    dispatch(updateListeningStatusAsync({
      role: activeRole,
      songTitle: currentSong.title,
      artist: currentSong.artist,
      source: currentSong.source,
      type: currentSong.type,
      isPlaying: isPlayingGlobal,
      songIndex: currentSongIndex,
      currentTime: Math.round(currentTime || 0),
    }));
  }, [activeRole, currentSongIndex, isPlayingGlobal, currentSong, currentTime, dispatch]);

  // 2. Poll app data & listen together sync every 3 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      dispatch(fetchAllAppDataAsync());
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [dispatch]);

  // 3. Listen Together (Shared Mode) Exact Second Sync
  useEffect(() => {
    if (!listeningState?.isSharedMode || !activeRole) return;

    const partnerRole = activeRole === 'user2' ? 'user1' : 'user2';
    const partnerState = listeningState[partnerRole];
    const lastUpdatedBy = listeningState.lastUpdatedBy;

    if (lastUpdatedBy === partnerRole && partnerState) {
      // Sync Song Index
      if (typeof partnerState.songIndex === 'number' && partnerState.songIndex !== currentSongIndex && partnerState.songIndex < playlist.length) {
        dispatch(setCurrentSongIndex(partnerState.songIndex));
      }
      // Sync Play / Pause State
      if (typeof partnerState.isPlaying === 'boolean' && partnerState.isPlaying !== isPlayingGlobal) {
        dispatch(setIsPlayingGlobal(partnerState.isPlaying));
      }
      // Sync Exact Playback Time (if drift > 2 seconds)
      if (typeof partnerState.currentTime === 'number' && partnerState.currentTime > 0) {
        const timeDrift = Math.abs((currentTime || 0) - partnerState.currentTime);
        if (timeDrift > 2) {
          if (isAudioType && audioRef.current) {
            audioRef.current.currentTime = partnerState.currentTime;
          } else if (ytId) {
            const iframe = document.getElementById('global-youtube-player');
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [partnerState.currentTime, true]
              }), '*');
            }
          }
        }
      }
    }
  }, [listeningState, activeRole, currentSongIndex, isPlayingGlobal, currentTime, isAudioType, ytId, playlist.length, dispatch]);

  // HTML5 Audio playback control
  useEffect(() => {
    if (!audioRef.current || !isAudioType) return;

    if (isPlayingGlobal) {
      audioRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlayingGlobal, currentSongIndex, isAudioType]);

  // YouTube Iframe PostMessage Play/Pause control
  useEffect(() => {
    if (!ytId) return;

    const sendYouTubeCommand = () => {
      const iframe = document.getElementById('global-youtube-player');
      if (iframe && iframe.contentWindow) {
        const command = isPlayingGlobal ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: command,
          args: []
        }), '*');
      }
    };

    const timer = setTimeout(sendYouTubeCommand, 300);
    return () => clearTimeout(timer);
  }, [isPlayingGlobal, ytId]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setCurrentTime(audioRef.current.currentTime));
    }
  };

  const handleAudioEnded = () => {
    dispatch(nextSongGlobal());
  };

  // Media Session API Integration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title || 'Bài Hát Yêu Thương',
        artist: currentSong.artist || 'Our Love Sanctuary',
        album: 'Góc Âm Nhạc ✨',
        artwork: [
          { src: '/favicon.ico', sizes: '192x192', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => dispatch(togglePlayGlobal()));
      navigator.mediaSession.setActionHandler('pause', () => dispatch(togglePlayGlobal()));
      navigator.mediaSession.setActionHandler('nexttrack', () => dispatch(nextSongGlobal()));
      navigator.mediaSession.setActionHandler('previoustrack', () => dispatch(prevSongGlobal()));
    }
  }, [currentSong, dispatch]);

  const isMusicTabActive = activeTab === 'music';

  return (
    <>
      {/* Primary Unmounting Media Engine */}
      <div className={`transition-all duration-300 ${isMusicTabActive ? 'block' : 'fixed bottom-[-9999px] left-[-9999px] opacity-0 pointer-events-none'}`}>
        {/* HTML5 Audio Element */}
        {isAudioType && currentSong?.source && (
          <audio
            ref={audioRef}
            src={currentSong.source}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
          />
        )}

        {/* YouTube Iframe Player */}
        {ytId && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
            <iframe
              id="global-youtube-player"
              src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&autoplay=1`}
              title={currentSong.title || 'YouTube Player'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* 🎵 FLOATING MINI SPINNING VINYL WIDGET (BOTTOM RIGHT ON LARGE SCREENS) 🎵 */}
      {!isMusicTabActive && currentSong && (
        <div 
          className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Expanded Popover Preview */}
          <div className={`mr-3 glass-panel p-3.5 rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 transform origin-right flex items-center gap-3 ${isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-4 pointer-events-none'}`}>
            <div className="w-10 h-10 rounded-xl bg-theme-primary/20 flex items-center justify-center text-theme-primary flex-shrink-0">
              <Music className="w-5 h-5 animate-bounce" />
            </div>

            <div className="max-w-[160px] min-w-0">
              <h4 className="font-bold text-xs text-theme-text truncate">{currentSong.title}</h4>
              <p className="text-[10px] text-theme-muted truncate">{currentSong.artist}</p>
            </div>

            <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(togglePlayGlobal());
                }}
                className="p-1.5 rounded-lg bg-theme-primary text-black hover:scale-110 active:scale-95 transition-transform"
                title={isPlayingGlobal ? "Tạm dừng" : "Phát nhạc"}
              >
                {isPlayingGlobal ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(nextSongGlobal());
                }}
                className="p-1.5 rounded-lg bg-white/10 text-theme-text hover:bg-white/20"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {setActiveTab && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('music');
                  }}
                  className="px-2 py-1 rounded-lg bg-theme-primary/20 text-theme-primary font-bold text-[10px] hover:bg-theme-primary/30"
                  title="Đến trang Góc Nhạc"
                >
                  Góc Nhạc 🎵
                </button>
              )}
            </div>
          </div>

          {/* Floating Vinyl Disc Button */}
          <div 
            onClick={() => setActiveTab && setActiveTab('music')}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black p-1 border-2 border-theme-primary shadow-2xl flex items-center justify-center relative transition-all duration-300 hover:scale-110 active:scale-95 ${isPlayingGlobal ? 'animate-spin' : ''}`}
            style={{ animationDuration: '6s' }}
            title="Đĩa nhạc đang xoay - Bấm để đến Góc Nhạc"
          >
            <div className="w-5 h-5 rounded-full bg-theme-primary/30 border border-theme-primary flex items-center justify-center">
              <Disc className="w-3.5 h-3.5 text-theme-primary" />
            </div>

            {/* Glowing Heart indicator badge */}
            {isPlayingGlobal && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-black flex items-center justify-center text-[8px] animate-pulse">
                💖
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};
