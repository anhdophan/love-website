import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { nextSongGlobal, prevSongGlobal, togglePlayGlobal, setCurrentTime } from '../store/slices/musicSlice';

export const GlobalAudioEngine = ({ activeTab }) => {
  const dispatch = useDispatch();
  const { playlist, currentSongIndex, isPlayingGlobal } = useSelector((state) => state.music);
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

  // HTML5 Audio playback control (resumes from current position)
  useEffect(() => {
    if (!audioRef.current || !isAudioType) return;

    if (isPlayingGlobal) {
      audioRef.current.play().catch(e => console.warn('Autoplay prevented:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlayingGlobal, currentSongIndex, isAudioType]);

  // YouTube Iframe PostMessage Play/Pause control (resumes at exact second, NO REBOOT/RELOAD)
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

  // Media Session API Integration for Phone Lock Screen & Bluetooth Widgets
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

      {/* YouTube Iframe Player - Static src prevents iframe reloading on pause/resume */}
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
