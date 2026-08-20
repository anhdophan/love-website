import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  addSongAsync, deleteSongAsync, togglePlayGlobal, 
  nextSongGlobal, prevSongGlobal, setCurrentSongIndex, 
  setSongFilter, setPlayMode 
} from '../store/slices/musicSlice';
import { 
  Music, Play, Pause, SkipForward, SkipBack, Plus, Trash2, 
  Youtube, Radio, Disc, Shuffle, Repeat, Heart, Sparkles 
} from 'lucide-react';

export const MusicPlayerModule = () => {
  const dispatch = useDispatch();
  const couple = useSelector((state) => state.couple.info);
  const playlist = useSelector((state) => state.music.playlist);
  const currentSongIndex = useSelector((state) => state.music.currentSongIndex);
  const isPlayingGlobal = useSelector((state) => state.music.isPlayingGlobal);
  const songFilter = useSelector((state) => state.music.songFilter);
  const playMode = useSelector((state) => state.music.playMode);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    artist: '',
    type: 'youtube', // 'youtube' | 'spotify' | 'audio'
    source: '',
    addedBy: 'Both',
  });

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
              Giai điệu kết nối trái tim • Phát nhạc xuyên suốt không bị ngắt quãng khi chuyển trang
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-theme-primary text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer z-10"
        >
          <Plus className="w-4 h-4" /> Thêm Bài Hát Yêu Thích
        </button>
      </div>

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
                        <h4 className="text-xl font-bold font-sans">{currentSong.title}</h4>
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

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-black/20 text-[10px] uppercase font-bold text-theme-primary">
                    {song.type}
                  </span>

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

      {/* Add Song Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-md p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-theme-primary" /> Thêm Bài Hát Mới Vào Playlist
            </h3>

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
                  <option value="youtube" className="bg-zinc-900 text-white">YouTube Video (ID hoặc Link)</option>
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
          </div>
        </div>
      )}

    </div>
  );
};
