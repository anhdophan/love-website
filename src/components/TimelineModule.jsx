import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMilestoneAsync, deleteMilestoneAsync } from '../store/slices/appDataSlices';
import { Clock, Plus, Trash2, Calendar, Sparkles, Filter } from 'lucide-react';

export const TimelineModule = () => {
  const dispatch = useDispatch();
  const milestones = useSelector((state) => state.appData.milestones);
  const couple = useSelector((state) => state.couple.info);
  const activeRole = useSelector((state) => state.couple.activeRole);

  const [filterCategory, setFilterCategory] = useState('Tất cả');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const defaultAuthor = activeRole === 'user2' ? 'Em' : 'Anh';

  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Kỷ niệm',
    description: '',
    image: '',
    addedBy: defaultAuthor,
    icon: '💖',
  });

  const categories = ['Tất cả', 'Gặp gỡ', 'Kỷ niệm', 'Du lịch', 'Lời hứa'];

  const filteredMilestones = filterCategory === 'Tất cả'
    ? milestones
    : milestones.filter(m => m.category === filterCategory);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      alert('Vui lòng nhập tên mốc kỷ niệm và ngày tháng.');
      return;
    }

    dispatch(addMilestoneAsync(form));

    setIsAddOpen(false);
    setForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Kỷ niệm',
      description: '',
      image: '',
      addedBy: defaultAuthor,
      icon: '💖',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-theme-primary to-theme-secondary flex items-center justify-center shadow-lg text-black">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
              Dòng Thời Gian Kỷ Niệm ✨
            </h2>
            <p className="text-xs text-theme-muted mt-1">
              Lưu giữ những khoảnh khắc đẹp nhất từng mốc thời gian bên nhau
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-theme-primary text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer z-10"
        >
          <Plus className="w-4 h-4" /> Thêm Mốc Kỷ Niệm
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-theme-muted flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Lọc:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-theme-primary text-black font-bold shadow-md scale-105'
                : 'glass-panel text-theme-muted hover:text-theme-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-theme-primary/30 ml-4 md:ml-8 space-y-8 py-4">
        {filteredMilestones.map((item) => {
          const itemId = item._id || item.id;
          return (
            <div key={itemId} className="relative pl-6 md:pl-10 group">
              
              {/* Timeline Bullet Icon */}
              <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-theme-primary text-black flex items-center justify-center text-sm shadow-lg ring-4 ring-black/10 group-hover:scale-125 transition-transform">
                {item.icon || '💖'}
              </div>

              {/* Milestone Card */}
              <div className="glass-panel glass-panel-hover p-5 md:p-6 rounded-3xl border border-white/15 space-y-3 relative">
                
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-theme-primary">
                      <Calendar className="w-3.5 h-3.5" /> {item.date}
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-theme-muted font-normal">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-sans text-theme-text">{item.title}</h3>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Xóa mốc kỷ niệm "${item.title}"?`)) {
                        dispatch(deleteMilestoneAsync(itemId));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                    title="Xóa mốc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {item.description && (
                  <p className="text-xs text-theme-muted leading-relaxed font-sans">
                    {item.description}
                  </p>
                )}

                {item.image && (
                  <div className="pt-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full max-h-60 object-cover rounded-2xl border border-white/10 shadow-md hover:scale-[1.01] transition-transform"
                    />
                  </div>
                )}

                <div className="pt-1 text-[11px] text-theme-muted font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-theme-primary" />
                  Tạo bởi: <strong className="text-theme-text">{item.addedBy === 'Anh' ? couple.user1?.name : item.addedBy === 'Em' ? couple.user2?.name : 'Cả hai'}</strong>
                </div>

              </div>
            </div>
          );
        })}

        {filteredMilestones.length === 0 && (
          <div className="text-center py-12 text-theme-muted text-sm pl-4">
            Chưa có mốc kỷ niệm nào trong mục này. Vui lòng bấm "Thêm Mốc Kỷ Niệm" ở trên!
          </div>
        )}
      </div>

      {/* Add Milestone Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-md p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-theme-primary" /> Thêm Mốc Kỷ Niệm Mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Tên Mốc Kỷ Niệm *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Lần đầu đi xem phim cùng nhau..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Ngày Tháng *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Phân Loại</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  >
                    <option value="Kỷ niệm" className="bg-zinc-900 text-white">Kỷ niệm</option>
                    <option value="Gặp gỡ" className="bg-zinc-900 text-white">Gặp gỡ</option>
                    <option value="Du lịch" className="bg-zinc-900 text-white">Du lịch</option>
                    <option value="Lời hứa" className="bg-zinc-900 text-white">Lời hứa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Mô Tả Chi Tiết</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Viết đôi dòng kỷ niệm đáng nhớ..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Ảnh Kỷ Niệm (Tải Từ Máy)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-theme-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-theme-primary/20 file:text-theme-primary cursor-pointer"
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-full h-28 object-cover rounded-xl mt-2 border" />
                )}
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
                  Lưu Mốc Kỷ Niệm 💖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
