import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addSongAsync, deleteSongAsync, togglePlayGlobal, 
  nextSongGlobal, prevSongGlobal, setCurrentSongIndex, 
  setSongFilter, setPlayMode, toggleSharedModeAsync,
  dedicateSongAsync, clearDedicatedSongAsync, setIsPlayingGlobal
} from '../store/slices/musicSlice';
import { fetchAllAppDataAsync } from '../store/slices/appDataSlices';
import { 
  Music, Play, Pause, SkipForward, SkipBack, Plus, Trash2, 
  Disc, Shuffle, Repeat, Heart, Sparkles, Users, Send, Radio, MessageCircle, X
} from 'lucide-react';

export const MusicPlayerModule = () => {
  const dispatch = useDispatch();
  const couple = useSelector((state) => state.couple.info);
  const activeRole = useSelector((state) => state.couple.activeRole);
  const playlist = useSelector((state) => state.music.playlist);
  const currentSongIndex = useSelector((state) => state.music.currentSongIndex);
  const isPlayingGlobal = useSelector((state) => state.music.isPlayingGlobal);
  const songFilter = useSelector((state) => state.music.songFilter);
  const playMode = useSelector((state) => state.music.playMode);
  const listeningState = useSelector((state) => state.music.listeningState);
  const dedicatedSong = useSelector((state) => state.music.dedicatedSong);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDedicateOpen, setIsDedicateOpen] = useState(false);
  const [targetDedicateSong, setTargetDedicateSong] = useState(null);
  const [dedicateMessage, setDedicateMessage] = useState('');
  // YouTube → MP3 conversion state
  const [ytConvert, setYtConvert] = useState({ url: '', title: '', artist: '', addedBy: 'Both' });
  const [ytConvertStatus, setYtConvertStatus] = useState('idle'); // 'idle' | 'loading' | 'done' | 'error'
  const [ytConvertMsg, setYtConvertMsg] = useState('');
  const [addMode, setAddMode] = useState('direct'); // 'direct' | 'ytconvert'

  const [form, setForm] = useState({
    title: '',
    artist: '',
    type: 'youtube', // 'youtube' | 'spotify' | 'audio'
    source: '',
    addedBy: 'Both',
  });

  const partnerRole = activeRole === 'user2' ? 'user1' : 'user2';
  const partnerName = activeRole === 'user2' ? couple.user1?.name : couple.user2?.name;
  const partnerListening = listeningState ? listeningState[partnerRole] : null;
  const isSharedMode = listeningState?.isSharedMode || false;

  // Filter playlist according to songFilter ('all' | 'Anh' | 'Em')
  const filteredPlaylist = playlist.filter(s => {
    if (songFilter === 'Anh') return s.addedBy === 'Anh' || s.addedBy === 'user1';
    if (songFilter === 'Em') return s.addedBy === 'Em' || s.addedBy === 'user2';
    return true;
  });

  const currentSong = playlist[currentSongIndex] || playlist[0] || null;

  const parseSongLink = (input, type) => {
    if (!input) return { source: '', type };
    let cleaned = input.trim();
    
    // Auto-detect YouTube links regardless of selected type
    const ytMatch = cleaned.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return { source: ytMatch[1], type: 'youtube' };
    }
    
    if (type === 'spotify') {
      const match = cleaned.match(/track\/([a-zA-Z0-9]+)/);
      return { source: match ? match[1] : cleaned, type: 'spotify' };
    }
    
    return { source: cleaned, type };
  };

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!form.title || !form.source) return;

    const parsed = parseSongLink(form.source, form.type);
    dispatch(addSongAsync({
      title: form.title,
      artist: form.artist || 'Nhiều ca sĩ',
      type: parsed.type,
      source: parsed.source,
      addedBy: form.addedBy,
    }));

    setForm({ title: '', artist: '', type: 'youtube', source: '', addedBy: 'Both' });
    setIsAddOpen(false);
    setAddMode('direct');
  };

  // YouTube → MP3 → Cloudinary conversion handler
  const handleYouTubeConvert = async (e) => {
    e.preventDefault();
    if (!ytConvert.url) return;

    // Extract YouTube ID from URL
    let youtubeId = ytConvert.url.trim();
    const ytMatch = youtubeId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) youtubeId = ytMatch[1];
    // If still looks like a full URL but no ID found
    if (youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')) {
      setYtConvertStatus('error');
      setYtConvertMsg('Không nhận ra ID video YouTube. Hãy dán đúng link!');
      return;
    }

    setYtConvertStatus('loading');
    setYtConvertMsg('Đang kết nối và tải nhạc từ YouTube... (Ðây có thể mất 30-60 giây, thiìu kiên nhẫn nhé 💖)');

    try {
      const res = await fetch('/api/songs/youtube-to-mp3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeId,
          title: ytConvert.title || undefined,
          artist: ytConvert.artist || undefined,
          addedBy: ytConvert.addedBy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chuyển đổi thất bại');

      setYtConvertStatus('done');
      setYtConvertMsg(`✅ Đã lưu bài "${data.song.title}" vào danh sách thành công! Nhạc sẽ phát nền được bây giờ 🎉`);
      // Refresh playlist
      dispatch({ type: 'music/addSongSuccess', payload: data.song });
      setTimeout(() => {
        setYtConvert({ url: '', title: '', artist: '', addedBy: 'Both' });
        setYtConvertStatus('idle');
        setYtConvertMsg('');
        setIsAddOpen(false);
        setAddMode('direct');
        // Trigger full playlist reload
        dispatch(fetchAllAppDataAsync());
      }, 2500);
    } catch (err) {
      setYtConvertStatus('error');
      setYtConvertMsg(`❌ Lỗi: ${err.message}`);
    }
  };

  const handleTuneInPartner = () => {
    if (!partnerListening || typeof partnerListening.songIndex !== 'number') return;
    dispatch(setCurrentSongIndex(partnerListening.songIndex));
    dispatch(setIsPlayingGlobal(true));
  };

  const handleSendDedication = (e) => {
    e.preventDefault();
    if (!targetDedicateSong || !dedicateMessage.trim()) return;

    dispatch(dedicateSongAsync({
      title: targetDedicateSong.title,
      artist: targetDedicateSong.artist,
      source: targetDedicateSong.source,
      type: targetDedicateSong.type,
      message: dedicateMessage,
      dedicatedBy: activeRole === 'user2' ? couple.user2?.name : couple.user1?.name,
    }));

    setIsDedicateOpen(false);
    setDedicateMessage('');
    setTargetDedicateSong(null);
    alert('Đã gửi tặng bài hát ngọt ngào thành công! 💌🎵');
  };

  const handlePlayDedicated = () => {
    if (!dedicatedSong) return;
    const foundIdx = playlist.findIndex(s => s.source === dedicatedSong.source || s.title === dedicatedSong.title);
    if (foundIdx >= 0) {
      dispatch(setCurrentSongIndex(foundIdx));
    } else {
      dispatch(addSongAsync({
        title: dedicatedSong.title,
        artist: dedicatedSong.artist,
        type: dedicatedSong.type,
        source: dedicatedSong.source,
        addedBy: dedicatedSong.dedicatedBy,
      }));
      dispatch(setCurrentSongIndex(0));
    }
    dispatch(setIsPlayingGlobal(true));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-theme-primary to-theme-secondary flex items-center justify-center shadow-lg text-black">
            <Music className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
              Góc Âm Nhạc Yêu Thương 🎵
            </h2>
            <p className="text-xs text-theme-muted mt-1">
              Phát nhạc độc lập 2 máy • Chế độ Nghe Nhạc Chung real-time • Gửi tặng bài hát lãng mạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => dispatch(toggleSharedModeAsync(!isSharedMode))}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isSharedMode
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-white/10 text-theme-text hover:bg-white/20'
            }`}
            title="Đồng bộ chuyển bài và phát nhạc giữa 2 máy"
          >
            <Users className="w-4 h-4" /> {isSharedMode ? '💞 Nghe Chung: ĐANG BẬT' : '🎧 Nghe Chung: TẮT'}
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-theme-primary text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Bài Hát
          </button>
        </div>
      </div>

      {/* 💌 ACTIVE DEDICATED SONG POPUP BANNER 💌 */}
      {dedicatedSong && dedicatedSong.title && (
        <div className="glass-panel p-5 rounded-3xl border-2 border-theme-secondary bg-gradient-to-r from-theme-secondary/15 to-theme-primary/15 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-secondary text-white flex items-center justify-center font-bold shadow-lg">
              <Send className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-theme-secondary">
                <Heart className="w-3.5 h-3.5 fill-current" /> Lời Tặng Bài Hát Từ {dedicatedSong.dedicatedBy} ({dedicatedSong.date})
              </div>
              <h4 className="font-bold text-base text-theme-text font-sans mt-0.5">
                "{dedicatedSong.title}" - {dedicatedSong.artist}
              </h4>
              <p className="text-xs text-theme-muted italic font-handwriting text-sm mt-0.5">
                "{dedicatedSong.message}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayDedicated}
              className="px-4 py-2 rounded-2xl bg-theme-secondary text-white font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Phát Bài Này 🎵
            </button>

            <button
              onClick={() => dispatch(clearDedicatedSongAsync())}
              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-theme-muted"
              title="Đóng thông báo này"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🌸 PARTNER LIVE LISTENING STATUS BAR 🌸 */}
      {partnerListening && partnerListening.songTitle && partnerListening.songTitle !== 'Chưa nghe bài nào' && (
        <div className="glass-panel p-4 rounded-3xl border border-white/15 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-theme-primary/20 text-theme-primary flex items-center justify-center">
              <Radio className={`w-5 h-5 ${partnerListening.isPlaying ? 'animate-pulse text-rose-400' : ''}`} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-theme-muted uppercase tracking-wider block">
                Trạng Thái Trực Tiếp Của {partnerName}:
              </span>
              <div className="text-xs font-bold text-theme-text font-sans flex items-center gap-2">
                <span>{partnerName} đang nghe: <strong>"{partnerListening.songTitle}"</strong></span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${partnerListening.isPlaying ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'bg-white/10 text-theme-muted'}`}>
                  {partnerListening.isPlaying ? '🎵 Đang Phát' : '⏸️ Tạm Dừng'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleTuneInPartner}
            className="px-3.5 py-1.5 rounded-xl bg-theme-primary/20 hover:bg-theme-primary/30 text-theme-primary border border-theme-primary/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title={`Bật cùng bài hát với ${partnerName}`}
          >
            <Users className="w-3.5 h-3.5" /> Nghe Cùng {partnerName} 🎧
          </button>
        </div>
      )}

      {/* 🌟 FEATURED MEDIA STAGE (TOP CENTER) 🌟 */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Media Player Viewport (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-primary flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Màn Hình Trình Chiếu Nhạc Nổi Bật
              </span>
              {currentSong && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-theme-muted uppercase font-bold">
                  {currentSong.type}
                </span>
              )}
            </div>

            {/* Media Screen Box */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/40 backdrop-blur-md">
              {currentSong ? (
                <>
                  {currentSong.type === 'spotify' && (
                    <div className="w-full p-2 bg-black/60">
                      <iframe
                        src={`https://open.spotify.com/embed/track/${currentSong.source}?utm_source=generator`}
                        width="100%"
                        height="232"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl"
                      />
                    </div>
                  )}

                  {currentSong.type !== 'spotify' && (
                    <div className="p-8 text-center space-y-4 bg-gradient-to-br from-theme-primary/10 to-theme-secondary/10">
                      <div className="w-20 h-20 mx-auto rounded-full bg-theme-primary/20 border-2 border-theme-primary flex items-center justify-center animate-pulse">
                        <Music className="w-10 h-10 text-theme-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold font-sans text-theme-text">{currentSong.title}</h4>
                        <p className="text-xs text-theme-muted mt-1">{currentSong.artist}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center text-theme-muted text-sm">
                  Chưa chọn bài hát. Vui lòng thêm bài hát mới!
                </div>
              )}
            </div>
          </div>

          {/* Vinyl Disc & Controls Showcase (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center space-y-5 bg-white/5 p-6 rounded-2xl border border-white/10">
            
            {/* Vinyl Disc */}
            <div className="relative">
              <div 
                className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black p-3 border-4 border-theme-primary/50 shadow-2xl flex items-center justify-center relative ${isPlayingGlobal ? 'animate-spin' : ''}`}
                style={{ animationDuration: '8s' }}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-theme-primary/20 border-2 border-theme-primary flex items-center justify-center">
                  <Disc className="w-8 h-8 text-theme-primary" />
                </div>
              </div>
            </div>

            {/* Song Meta Info */}
            <div className="space-y-1 w-full">
              <h3 className="font-bold text-lg font-sans line-clamp-1 text-theme-text">
                {currentSong ? currentSong.title : 'Chưa Chọn Bài Hát'}
              </h3>
              <p className="text-xs text-theme-muted line-clamp-1">
                {currentSong ? currentSong.artist : 'Thêm bài hát yêu thích của bạn'}
              </p>
            </div>

            {/* Media Player Controls */}
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={() => dispatch(prevSongGlobal())}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-theme-text transition-colors active:scale-95 cursor-pointer"
                title="Bài trước"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => dispatch(togglePlayGlobal())}
                className="p-4 rounded-full bg-gradient-to-r from-theme-primary to-theme-secondary text-black font-bold shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title={isPlayingGlobal ? "Tạm dừng" : "Phát nhạc"}
              >
                {isPlayingGlobal ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
              </button>

              <button 
                onClick={() => dispatch(nextSongGlobal())}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-theme-text transition-colors active:scale-95 cursor-pointer"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 📋 PLAYLIST CONTROL BAR & SONG LIST 📋 */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-xl space-y-5">
        
        {/* Controls Bar: Filter & Play Mode */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          
          {/* Filter Playlist Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs font-bold text-theme-muted mr-1 whitespace-nowrap">Lọc playlist:</span>
            {[
              { id: 'all', label: 'Cả Hai Đứa 💖' },
              { id: 'Anh', label: `Nhạc Của ${couple.user1?.name || 'Anh'} ♂` },
              { id: 'Em', label: `Nhạc Của ${couple.user2?.name || 'Em'} ♀` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => dispatch(setSongFilter(tab.id))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  songFilter === tab.id
                    ? 'bg-theme-primary text-black shadow-md scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-theme-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Play Mode Toggle (Sequential vs Shuffle) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-muted font-bold">Chế độ phát:</span>
            <button
              onClick={() => dispatch(setPlayMode(playMode === 'sequential' ? 'shuffle' : 'sequential'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-primary/20 text-theme-primary border border-theme-primary/30 text-xs font-bold hover:bg-theme-primary/30 transition-all cursor-pointer"
            >
              {playMode === 'shuffle' ? (
                <> <Shuffle className="w-3.5 h-3.5" /> Trộn Ngẫu Nhiên </>
              ) : (
                <> <Repeat className="w-3.5 h-3.5" /> Theo Thứ Tự </>
              )}
            </button>
          </div>

        </div>

        {/* Songs List */}
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {filteredPlaylist.map((song) => {
            const songId = song._id || song.id;
            const originalIndex = playlist.findIndex(s => (s._id || s.id) === songId);
            const isSelected = originalIndex === currentSongIndex;

            return (
              <div
                key={songId}
                onClick={() => {
                  dispatch(setCurrentSongIndex(originalIndex >= 0 ? originalIndex : 0));
                  if (!isPlayingGlobal) dispatch(togglePlayGlobal());
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-theme-primary/15 border-theme-primary text-theme-text shadow-md scale-[1.01]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? 'bg-theme-primary text-black' : 'bg-white/10 text-theme-muted'}`}>
                    {isSelected && isPlayingGlobal ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-black animate-pulse h-full" />
                        <span className="w-1 bg-black animate-pulse h-2/3" />
                        <span className="w-1 bg-black animate-pulse h-4/5" />
                      </div>
                    ) : (
                      originalIndex + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{song.title}</h4>
                    <p className="text-xs text-theme-muted truncate">
                      {song.artist} • Thêm bởi: <strong className="text-theme-text">{song.addedBy === 'Anh' ? couple.user1?.name : song.addedBy === 'Em' ? couple.user2?.name : 'Cả hai'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetDedicateSong(song);
                      setIsDedicateOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-theme-secondary/20 hover:bg-theme-secondary/30 text-theme-secondary text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Gửi tặng bài hát này"
                  >
                    <Send className="w-3 h-3" /> Tặng Bài Này 💌
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetId = song._id || song.id;
                      if (confirm(`Xóa bài hát "${song.title}" khỏi danh sách?`)) {
                        dispatch(deleteSongAsync(targetId));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                    title="Xóa bài hát"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Dedicate Song Modal */}
      {isDedicateOpen && targetDedicateSong && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-md p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center gap-2 text-theme-text">
              <Send className="w-5 h-5 text-theme-secondary" /> Gửi Tặng Bài Hát Cho Người Ấy 💌
            </h3>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <h4 className="font-bold text-sm text-theme-primary">{targetDedicateSong.title}</h4>
              <p className="text-xs text-theme-muted">{targetDedicateSong.artist}</p>
            </div>

            <form onSubmit={handleSendDedication} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Lời Nhắn Ngọt Ngào Dành Tặng *</label>
                <textarea
                  rows="3"
                  required
                  value={dedicateMessage}
                  onChange={(e) => setDedicateMessage(e.target.value)}
                  placeholder="VD: Nghe bài này nhớ anh/em nhiều lắm baby 💕..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-handwriting text-base"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDedicateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 font-semibold hover:bg-white/20"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-theme-secondary text-white font-bold hover:opacity-90 shadow-md"
                >
                  Gửi Lời Tặng 💖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-lg p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-theme-primary" /> Thêm Bài Hát Vào Playlist
            </h3>

            {/* Mode Toggle Tabs */}
            <div className="flex rounded-2xl bg-black/20 p-1 gap-1">
              <button
                type="button"
                onClick={() => { setAddMode('ytconvert'); setYtConvertStatus('idle'); setYtConvertMsg(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${addMode === 'ytconvert' ? 'bg-rose-500 text-white shadow-md' : 'text-theme-muted hover:text-theme-text'}`}
              >
                🎵 YouTube → MP3
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px]">PHÁT NỀN</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMode('direct')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${addMode === 'direct' ? 'bg-white/15 text-theme-text shadow' : 'text-theme-muted hover:text-theme-text'}`}
              >
                🔗 Thêm Link Trực Tiếp
              </button>
            </div>

            {/* ─── YouTube → MP3 Converter Tab ─── */}
            {addMode === 'ytconvert' && (
              <div className="space-y-3">
                {/* Info banner */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2">
                  <span className="text-base leading-none">✨</span>
                  <p>
                    Dán link YouTube vào đây, hệ thống sẽ tự động <strong>chuyển đổi thành MP3</strong> và lưu lên đám mây.
                    Nhạc MP3 sẽ <strong>phát được nền khi bạn switch app!</strong>
                  </p>
                </div>

                <form onSubmit={handleYouTubeConvert} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1">Link YouTube *</label>
                    <input
                      type="text"
                      required
                      value={ytConvert.url}
                      onChange={(e) => setYtConvert({ ...ytConvert, url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=xxxx hoặc https://youtu.be/xxxx"
                      className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                      disabled={ytConvertStatus === 'loading'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1">Tên Bài Hát (tùy chọn)</label>
                      <input
                        type="text"
                        value={ytConvert.title}
                        onChange={(e) => setYtConvert({ ...ytConvert, title: e.target.value })}
                        placeholder="Tự động lấy từ YouTube"
                        className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                        disabled={ytConvertStatus === 'loading'}
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Ca Sĩ (tùy chọn)</label>
                      <input
                        type="text"
                        value={ytConvert.artist}
                        onChange={(e) => setYtConvert({ ...ytConvert, artist: e.target.value })}
                        placeholder="Tự động lấy từ YouTube"
                        className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                        disabled={ytConvertStatus === 'loading'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Người Thêm</label>
                    <select
                      value={ytConvert.addedBy}
                      onChange={(e) => setYtConvert({ ...ytConvert, addedBy: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                      disabled={ytConvertStatus === 'loading'}
                    >
                      <option value="Anh" className="bg-zinc-900 text-white">{couple.user1?.name || 'Anh'}</option>
                      <option value="Em" className="bg-zinc-900 text-white">{couple.user2?.name || 'Em'}</option>
                      <option value="Both" className="bg-zinc-900 text-white">Cả hai đứa</option>
                    </select>
                  </div>

                  {/* Status / Progress */}
                  {ytConvertStatus !== 'idle' && (
                    <div className={`p-3 rounded-xl text-xs border flex items-center gap-2 ${
                      ytConvertStatus === 'loading' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                      ytConvertStatus === 'done'    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                     'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {ytConvertStatus === 'loading' && (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
                      )}
                      <span>{ytConvertMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsAddOpen(false); setAddMode('direct'); setYtConvertStatus('idle'); setYtConvertMsg(''); }}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 font-semibold hover:bg-white/20 text-xs"
                      disabled={ytConvertStatus === 'loading'}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={ytConvertStatus === 'loading' || ytConvertStatus === 'done'}
                      className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold hover:opacity-90 shadow-md text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {ytConvertStatus === 'loading' ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang Chuyển Đổi...
                        </>
                      ) : ytConvertStatus === 'done' ? '✅ Xong!' : '🎵 Chuyển Đổi & Lưu'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ─── Direct Link Tab ─── */}
            {addMode === 'direct' && (
              <form onSubmit={handleAddSong} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Tên Bài Hát *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ví dụ: Một Đời, Ánh Nắng Của Anh..."
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Ca Sĩ / Trình Bày</label>
                  <input
                    type="text"
                    value={form.artist}
                    onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    placeholder="Ví dụ: Đức Phúc, Ed Sheeran..."
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Nền Tảng / Nguồn Nhạc</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  >
                    <option value="youtube" className="bg-zinc-900 text-white">YouTube (nhúng iframe)</option>
                    <option value="spotify" className="bg-zinc-900 text-white">Spotify Track (ID hoặc Link)</option>
                    <option value="audio" className="bg-zinc-900 text-white">Link MP3 / Stream Trực Tiếp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Link / ID Bài Hát *</label>
                  <input
                    type="text"
                    required
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    placeholder="Dán link YouTube / Spotify / MP3 vào đây"
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Người Thêm Bài Hát</label>
                  <select
                    value={form.addedBy}
                    onChange={(e) => setForm({ ...form, addedBy: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  >
                    <option value="Anh" className="bg-zinc-900 text-white">{couple.user1?.name || 'Anh'}</option>
                    <option value="Em" className="bg-zinc-900 text-white">{couple.user2?.name || 'Em'}</option>
                    <option value="Both" className="bg-zinc-900 text-white">Cả hai đứa</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 font-semibold hover:bg-white/20"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-theme-primary text-black font-bold hover:opacity-90 shadow-md"
                  >
                    Lưu Bài Hát 🎵
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}



    </div>
  );
};
