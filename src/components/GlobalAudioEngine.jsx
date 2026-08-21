import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  nextSongGlobal, prevSongGlobal, togglePlayGlobal, 
  setCurrentTime, updateListeningStatusAsync, setCurrentSongIndex, setIsPlayingGlobal 
} from '../store/slices/musicSlice';
import { fetchAllAppDataAsync } from '../store/slices/appDataSlices';
import { Disc, Play, Pause, SkipForward, Music } from 'lucide-react';

export const GlobalAudioEngine = ({ activeTab, setActiveTab }) => {
  const dispatch = useDispatch();
  const { playlist, currentSongIndex, isPlayingGlobal, listeningState, currentTime } = useSelector((state) => state.music);
  const activeRole = useSelector((state) => state.couple.activeRole);
  const currentSong = playlist[currentSongIndex];
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const wasPlayingBeforeHidden = useRef(false);

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

  // ─── 1. AudioContext Unlock (iOS Safari Background Audio Key) ───────────────
  // iOS requires AudioContext to be resumed from a user gesture to allow background audio
  const unlockAudioContext = useCallback(() => {
    if (audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContextRef.current = new AudioCtx();
      // Create a silent buffer and play it to "unlock" iOS audio session
      const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
      // Resume AudioContext if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn('AudioContext unlock failed:', e);
    }
  }, []);

  // Unlock audio on first user interaction
  useEffect(() => {
    const events = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
    const handleUnlock = () => {
      unlockAudioContext();
      // Resume AudioContext if suspended (happens when screen locks on some devices)
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    };
    events.forEach(e => document.addEventListener(e, handleUnlock, { once: true, passive: true }));
    return () => events.forEach(e => document.removeEventListener(e, handleUnlock));
  }, [unlockAudioContext]);

  // ─── 2. Page Visibility API — Resume audio when user returns to tab/app ─────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page going to background — remember play state
        wasPlayingBeforeHidden.current = isPlayingGlobal;
        // Save position to localStorage as backup
        if (audioRef.current) {
          localStorage.setItem('love_audio_time', String(audioRef.current.currentTime));
        }
        // Resume AudioContext if needed
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      } else {
        // Page came back to foreground
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
        // Resume HTML5 audio if it was playing and got paused by browser
        if (wasPlayingBeforeHidden.current && isAudioType && audioRef.current) {
          const savedTime = parseFloat(localStorage.getItem('love_audio_time') || '0');
          // Only seek if drift > 1 second (sometimes browser pauses and resumes correctly)
          if (Math.abs(audioRef.current.currentTime - savedTime) > 1 && savedTime > 0) {
            audioRef.current.currentTime = savedTime;
          }
          audioRef.current.play().catch(e => console.warn('Resume failed:', e));
        }
        // For YouTube: send play command when returning
        if (wasPlayingBeforeHidden.current && ytId) {
          const iframe = document.getElementById('global-youtube-player');
          if (iframe?.contentWindow) {
            setTimeout(() => {
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command', func: 'playVideo', args: []
              }), '*');
            }, 500);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlayingGlobal, isAudioType, ytId]);

  // ─── 3. pageshow / pagehide (bfcache — iOS Safari back/forward navigation) ──
  useEffect(() => {
    const handlePageHide = () => {
      if (audioRef.current) {
        localStorage.setItem('love_audio_time', String(audioRef.current.currentTime));
        localStorage.setItem('love_audio_playing', String(isPlayingGlobal));
      }
    };
    const handlePageShow = (e) => {
      // e.persisted = true means page was restored from bfcache
      if (e.persisted) {
        const savedPlaying = localStorage.getItem('love_audio_playing') === 'true';
        const savedTime = parseFloat(localStorage.getItem('love_audio_time') || '0');
        if (savedPlaying && isAudioType && audioRef.current) {
          if (savedTime > 0) audioRef.current.currentTime = savedTime;
          audioRef.current.play().catch(() => {});
        }
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [isPlayingGlobal, isAudioType]);

  // ─── 4. Sync listening status to server ─────────────────────────────────────
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

  // ─── 5. Poll app data every 3 seconds ───────────────────────────────────────
  useEffect(() => {
    const pollInterval = setInterval(() => {
      dispatch(fetchAllAppDataAsync());
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [dispatch]);

  // ─── 6. Listen Together Exact Second Sync ───────────────────────────────────
  useEffect(() => {
    if (!listeningState?.isSharedMode || !activeRole) return;

    const partnerRole = activeRole === 'user2' ? 'user1' : 'user2';
    const partnerState = listeningState[partnerRole];
    const lastUpdatedBy = listeningState.lastUpdatedBy;

    if (lastUpdatedBy === partnerRole && partnerState) {
      if (typeof partnerState.songIndex === 'number' && partnerState.songIndex !== currentSongIndex && partnerState.songIndex < playlist.length) {
        dispatch(setCurrentSongIndex(partnerState.songIndex));
      }
      if (typeof partnerState.isPlaying === 'boolean' && partnerState.isPlaying !== isPlayingGlobal) {
        dispatch(setIsPlayingGlobal(partnerState.isPlaying));
      }
      if (typeof partnerState.currentTime === 'number' && partnerState.currentTime > 0) {
        const timeDrift = Math.abs((currentTime || 0) - partnerState.currentTime);
        if (timeDrift > 2) {
          if (isAudioType && audioRef.current) {
            audioRef.current.currentTime = partnerState.currentTime;
          } else if (ytId) {
            const iframe = document.getElementById('global-youtube-player');
            if (iframe?.contentWindow) {
              iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command', func: 'seekTo', args: [partnerState.currentTime, true]
              }), '*');
            }
          }
        }
      }
    }
  }, [listeningState, activeRole, currentSongIndex, isPlayingGlobal, currentTime, isAudioType, ytId, playlist.length, dispatch]);

  // ─── 7. HTML5 Audio playback control ────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current || !isAudioType) return;

    if (isPlayingGlobal) {
      // Resume AudioContext first
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      audioRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlayingGlobal, currentSongIndex, isAudioType]);

  // Save audio position to localStorage continuously
  useEffect(() => {
    if (!isAudioType || !isPlayingGlobal) return;
    const interval = setInterval(() => {
      if (audioRef.current) {
        localStorage.setItem('love_audio_time', String(audioRef.current.currentTime));
        localStorage.setItem('love_audio_playing', 'true');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAudioType, isPlayingGlobal]);

  // ─── 8. YouTube PostMessage Play/Pause ──────────────────────────────────────
  useEffect(() => {
    if (!ytId) return;

    const sendYouTubeCommand = () => {
      const iframe = document.getElementById('global-youtube-player');
      if (iframe?.contentWindow) {
        const command = isPlayingGlobal ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command', func: command, args: []
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
    localStorage.removeItem('love_audio_time');
    dispatch(nextSongGlobal());
  };

  // ─── 9. Media Session API (Lock Screen Controls) ────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title || 'Bài Hát Yêu Thương',
      artist: currentSong.artist || 'Our Love Sanctuary',
      album: 'Góc Âm Nhạc ✨',
      artwork: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ]
    });

    navigator.mediaSession.playbackState = isPlayingGlobal ? 'playing' : 'paused';
    navigator.mediaSession.setActionHandler('play', () => dispatch(setIsPlayingGlobal(true)));
    navigator.mediaSession.setActionHandler('pause', () => dispatch(setIsPlayingGlobal(false)));
    navigator.mediaSession.setActionHandler('nexttrack', () => dispatch(nextSongGlobal()));
    navigator.mediaSession.setActionHandler('previoustrack', () => dispatch(prevSongGlobal()));
    navigator.mediaSession.setActionHandler('stop', () => dispatch(setIsPlayingGlobal(false)));
  }, [currentSong, isPlayingGlobal, dispatch]);

  const isMusicTabActive = activeTab === 'music';

  return (
    <>
      {/* Primary Media Engine - permanently mounted, moved offscreen when not on music tab */}
      <div
        className={isMusicTabActive ? 'block' : 'fixed'}
        style={!isMusicTabActive ? { bottom: '-9999px', left: '-9999px', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' } : {}}
        aria-hidden={!isMusicTabActive}
      >
        {/* HTML5 Audio Element — playsInline is critical for iOS background audio */}
        {isAudioType && currentSong?.source && (
          <audio
            ref={audioRef}
            src={currentSong.source}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            playsInline
            preload="auto"
          />
        )}

        {/* YouTube Iframe Player */}
        {ytId && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
            <iframe
              id="global-youtube-player"
              src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&rel=0&autoplay=1`}
              title={currentSong?.title || 'YouTube Player'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* 🎵 FLOATING MINI SPINNING VINYL WIDGET (BOTTOM RIGHT, LARGE SCREENS) */}
      {!isMusicTabActive && currentSong && (
        <div
          className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center group cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Expanded Popover on Hover */}
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
                onClick={(e) => { e.stopPropagation(); dispatch(togglePlayGlobal()); }}
                className="p-1.5 rounded-lg bg-theme-primary text-black hover:scale-110 active:scale-95 transition-transform"
                title={isPlayingGlobal ? 'Tạm dừng' : 'Phát nhạc'}
              >
                {isPlayingGlobal
                  ? <Pause className="w-3.5 h-3.5" />
                  : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); dispatch(nextSongGlobal()); }}
                className="p-1.5 rounded-lg bg-white/10 text-theme-text hover:bg-white/20"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {setActiveTab && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTab('music'); }}
                  className="px-2 py-1 rounded-lg bg-theme-primary/20 text-theme-primary font-bold text-[10px] hover:bg-theme-primary/30"
                  title="Đến trang Góc Nhạc"
                >
                  Góc Nhạc 🎵
                </button>
              )}
            </div>
          </div>

          {/* Spinning Vinyl Disc Button */}
          <div
            onClick={() => setActiveTab && setActiveTab('music')}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black p-1 border-2 border-theme-primary shadow-2xl flex items-center justify-center relative transition-all duration-300 hover:scale-110 active:scale-95 ${isPlayingGlobal ? 'animate-spin' : ''}`}
            style={{ animationDuration: '6s' }}
            title="Đĩa nhạc - Bấm để đến Góc Nhạc"
          >
            <div className="w-5 h-5 rounded-full bg-theme-primary/30 border border-theme-primary flex items-center justify-center">
              <Disc className="w-3.5 h-3.5 text-theme-primary" />
            </div>
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
