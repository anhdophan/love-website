import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addReminderAsync, deleteReminderAsync } from '../store/slices/appDataSlices';
import { Calendar as CalendarIcon, Clock, MapPin, Bell, Plus, Trash2, AlertCircle } from 'lucide-react';

export const ScheduleRemindersModule = () => {
  const dispatch = useDispatch();
  const reminders = useSelector((state) => state.appData.reminders);
  const couple = useSelector((state) => state.couple.info);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    location: '',
    note: '',
    remindDaysBefore: 1,
    addedBy: 'Both',
  });

  // Check for upcoming reminders on load to show simulated notification
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = reminders.find(r => {
      const diffTime = new Date(r.date) - new Date(today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= r.remindDaysBefore;
    });

    if (upcoming) {
      setActiveAlert(upcoming);
    }
  }, [reminders]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) {
      alert('Vui lòng nhập tiêu đề cuộc hẹn và ngày.');
      return;
    }

    dispatch(addReminderAsync(form));

    setIsAddOpen(false);
    setForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      location: '',
      note: '',
      remindDaysBefore: 1,
      addedBy: 'Both',
    });
  };

  const getDaysLeft = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-theme-primary to-theme-secondary flex items-center justify-center shadow-lg text-black">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
              Lịch Hẹn Hò & Thông Báo 🗓️
            </h2>
            <p className="text-xs text-theme-muted mt-1">
              Lên lịch những buổi hẹn hò ngọt ngào và nhận thông báo nhắc nhở tự động
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-theme-primary text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer z-10"
        >
          <Plus className="w-4 h-4" /> Đặt Lịch Hẹn Mới
        </button>
      </div>

      {/* Simulated Upcoming Event Alert Notification */}
      {activeAlert && (
        <div className="glass-panel p-5 rounded-3xl border-2 border-theme-primary bg-theme-primary/10 shadow-xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-primary text-black flex items-center justify-center font-bold">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-theme-primary">Thông Báo Cuộc Hẹn Sắp Tới! 💕</h4>
              <p className="text-xs text-theme-text font-medium mt-0.5">
                "{activeAlert.title}" vào ngày <strong>{activeAlert.date} ({activeAlert.time})</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
          >
            Đã Biết 💖
          </button>
        </div>
      )}

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reminders.map((item) => {
          const itemId = item._id || item.id;
          const daysLeft = getDaysLeft(item.date);
          const isPast = daysLeft < 0;
          const isToday = daysLeft === 0;

          return (
            <div
              key={itemId}
              className={`glass-panel p-6 rounded-3xl border transition-all duration-300 space-y-4 flex flex-col justify-between ${
                isToday
                  ? 'border-theme-secondary bg-theme-secondary/10 shadow-2xl scale-[1.02]'
                  : isPast
                  ? 'border-white/10 opacity-70'
                  : 'border-white/15 hover:border-theme-primary/40 shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    isToday
                      ? 'bg-theme-secondary text-white shadow'
                      : isPast
                      ? 'bg-black/20 text-theme-muted'
                      : 'bg-theme-primary/20 text-theme-primary'
                  }`}>
                    {isToday ? '🎉 DIỄN RA HÔM NAY!' : isPast ? 'Đã diễn ra' : `Còn ${daysLeft} ngày nữa`}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm(`Xóa lịch hẹn "${item.title}"?`)) {
                        dispatch(deleteReminderAsync(itemId));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                    title="Xóa lịch hẹn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold font-sans text-theme-text">{item.title}</h3>

                <div className="space-y-1.5 text-xs text-theme-muted">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-theme-primary" />
                    <span>{item.date} lúc <strong>{item.time}</strong></span>
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {item.note && (
                    <div className="flex items-start gap-2 pt-1 text-theme-text italic bg-white/5 p-2.5 rounded-xl border border-white/10">
                      <AlertCircle className="w-3.5 h-3.5 text-theme-primary flex-shrink-0 mt-0.5" />
                      <span>{item.note}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-theme-muted">
                <span>Nhắc trước: {item.remindDaysBefore} ngày</span>
                <span>Tạo bởi: <strong className="text-theme-text">{item.addedBy === 'Anh' ? couple.user1?.name : item.addedBy === 'Em' ? couple.user2?.name : 'Cả hai'}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {reminders.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-3xl text-theme-muted text-sm">
          Chưa có lịch hẹn hò nào. Hãy bấm "Đặt Lịch Hẹn Mới" để cùng nhau đi chơi nhé!
        </div>
      )}

      {/* Add Reminder Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-md p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-theme-primary" /> Đặt Lịch Hẹn Hò Mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Tên Cuộc Hẹn *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Đi ăn tối nến thơm, Đi xem phim..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Ngày Hẹn *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Giờ Hẹn</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Địa Điểm Hẹn Hò</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="VD: Nhà hàng Skyview, Rạp Lotte Cinema..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Ghi Chú / Lời Dặn Trái Tim</label>
                <textarea
                  rows="2"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="VD: Nhớ mang theo áo khoác, mặc váy hồng..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Thông Báo Nhắc Trước (Số Ngày)</label>
                <select
                  value={form.remindDaysBefore}
                  onChange={(e) => setForm({ ...form, remindDaysBefore: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                >
                  <option value={1} className="bg-zinc-900 text-white">Nhắc trước 1 ngày</option>
                  <option value={2} className="bg-zinc-900 text-white">Nhắc trước 2 ngày</option>
                  <option value={3} className="bg-zinc-900 text-white">Nhắc trước 3 ngày</option>
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
                  Lưu Lịch Hẹn 🗓️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
