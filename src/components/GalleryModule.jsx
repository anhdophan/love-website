import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPhotoAsync, deletePhotoAsync, toggleLikePhotoAsync } from '../store/slices/appDataSlices';
import { Image as ImageIcon, Plus, Trash2, Heart, Calendar, X } from 'lucide-react';

export const GalleryModule = () => {
  const dispatch = useDispatch();
  const gallery = useSelector((state) => state.appData.gallery);
  const couple = useSelector((state) => state.couple.info);

  const [selectedAlbum, setSelectedAlbum] = useState('Tất cả');
  const [activePhoto, setActivePhoto] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [form, setForm] = useState({
    url: '',
    caption: '',
    album: 'Du Lịch',
    date: new Date().toISOString().split('T')[0],
    addedBy: 'Both',
  });

  const albums = ['Tất cả', 'Du Lịch', 'Hẹn Hò', 'Đời Thường', 'Ảnh Dìm'];

  const filteredPhotos = selectedAlbum === 'Tất cả'
    ? gallery
    : gallery.filter(p => p.album === selectedAlbum);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.url) {
      alert('Vui lòng chọn hình ảnh hoặc nhập URL ảnh.');
      return;
    }

    dispatch(addPhotoAsync({
      ...form,
      liked: true,
    }));

    setIsAddOpen(false);
    setForm({
      url: '',
      caption: '',
      album: 'Du Lịch',
      date: new Date().toISOString().split('T')[0],
      addedBy: 'Both',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-theme-primary to-theme-secondary flex items-center justify-center shadow-lg text-black">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
              Album Ảnh Kỷ Niệm 🖼️
            </h2>
            <p className="text-xs text-theme-muted mt-1">
              Lưu giữ trọn vẹn từng khoảnh khắc ngọt ngào của hai đứa • Tải lên Cloudinary bảo mật
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-theme-primary text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer z-10"
        >
          <Plus className="w-4 h-4" /> Thêm Bức Ảnh Mới
        </button>
      </div>

      {/* Album Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {albums.map((album) => (
          <button
            key={album}
            onClick={() => setSelectedAlbum(album)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedAlbum === album
                ? 'bg-theme-primary text-black shadow-md scale-105'
                : 'glass-panel text-theme-muted hover:text-theme-text'
            }`}
          >
            {album}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => {
          const photoId = photo._id || photo.id;
          return (
            <div
              key={photoId}
              className="glass-panel rounded-3xl overflow-hidden border border-white/15 shadow-xl group hover:border-theme-primary/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Image View */}
              <div 
                onClick={() => setActivePhoto(photo)}
                className="relative overflow-hidden cursor-pointer aspect-4/3 bg-black/20"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                  <p className="font-bold text-xs line-clamp-2">{photo.caption || 'Kỷ niệm yêu thương'}</p>
                  <span className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {photo.date}
                  </span>
                </div>
              </div>

              {/* Photo Card Footer */}
              <div className="p-3.5 flex items-center justify-between bg-white/5 border-t border-white/10 text-xs">
                <span className="text-theme-muted font-medium text-[11px] truncate max-w-[140px]">
                  {photo.caption || 'Kỷ niệm đẹp'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(toggleLikePhotoAsync(photoId))}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      photo.liked ? 'text-rose-500 bg-rose-500/10' : 'text-theme-muted hover:text-white'
                    }`}
                    title="Thích bức ảnh này"
                  >
                    <Heart className={`w-4 h-4 ${photo.liked ? 'fill-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Xóa bức ảnh này khỏi album?')) {
                        dispatch(deletePhotoAsync(photoId));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-3xl text-theme-muted text-sm">
          Chưa có bức ảnh nào trong album này. Hãy bấm "Thêm Bức Ảnh Mới" để lưu giữ kỷ niệm!
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {activePhoto && (
        <div className="modal-overlay" onClick={() => setActivePhoto(null)}>
          <div className="relative max-w-3xl w-full p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-theme-primary text-sm font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-6 h-6" /> Đóng
            </button>
            <div className="glass-panel p-3 rounded-3xl border border-white/20 shadow-2xl overflow-hidden space-y-3">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                className="w-full max-h-[75vh] object-contain rounded-2xl bg-black"
              />
              <div className="p-3 text-center space-y-1">
                <h4 className="font-bold text-base font-sans">{activePhoto.caption || 'Kỷ niệm yêu thương'}</h4>
                <p className="text-xs text-theme-muted">Album: {activePhoto.album} • Ngày: {activePhoto.date}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-md p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-theme-primary" /> Thêm Bức Ảnh Kỷ Niệm
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Chọn Ảnh Từ Máy (Hoặc dán Link URL) *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-theme-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-theme-primary/20 file:text-theme-primary cursor-pointer mb-2"
                />
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="Hoặc dán URL ảnh trực tiếp vào đây..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
                {form.url && (
                  <img src={form.url} alt="Preview" className="w-full h-32 object-cover rounded-xl mt-2 border" />
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Chú Thích Ảnh</label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Ví dụ: Hoàng hôn Đà Nẵng, Bữa tối sinh nhật..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Album</label>
                  <select
                    value={form.album}
                    onChange={(e) => setForm({ ...form, album: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  >
                    <option value="Du Lịch" className="bg-zinc-900 text-white">Du Lịch</option>
                    <option value="Hẹn Hò" className="bg-zinc-900 text-white">Hẹn Hò</option>
                    <option value="Đời Thường" className="bg-zinc-900 text-white">Đời Thường</option>
                    <option value="Ảnh Dìm" className="bg-zinc-900 text-white">Ảnh Dìm</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Ngày Tháng</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  />
                </div>
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
                  Tải Ảnh Lên Cloud ☁️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
