import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  nextSongGlobal, prevSongGlobal, togglePlayGlobal, 
  setCurrentTime, updateListeningStatusAsync, setCurrentSongIndex, setIsPlayingGlobal 
} from '../store/slices/musicSlice';
import { fetchAllAppDataAsync } from '../store/slices/appDataSlices';

export const GlobalAudioEngine = ({ activeTab }) => {
  const dispatch = useDispatch();
  const { playlist, currentSongIndex, isPlayingGlobal, listeningState } = useSelector((state) => state.music);
  const activeRole = useSelector((state) => state.couple.activeRole);
  const currentSong = playlist[currentSongIndex];
  const audioRef = useRef(null);

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

  // 1. Sync active role's listening status to server
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
    }));
  }, [activeRole, currentSongIndex, isPlayingGlobal, currentSong, dispatch]);

  // 2. Poll app data & listen together sync every 4 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      dispatch(fetchAllAppDataAsync());
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [dispatch]);

  // 3. Listen Together (Shared Mode) Sync: If partner updated song/play state, sync local player!
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
    }
  }, [listeningState, activeRole, currentSongIndex, isPlayingGlobal, playlist.length, dispatch]);

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
  );
};
