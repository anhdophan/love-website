import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addNoteAsync, deleteNoteAsync } from '../store/slices/appDataSlices';
import { setPasscode } from '../store/slices/coupleSlice';
import { Mail, Lock, Unlock, Plus, Trash2, Key, Heart, Eye } from 'lucide-react';

export const LoveNotesModule = () => {
  const dispatch = useDispatch();
  const loveNotes = useSelector((state) => state.appData.loveNotes);
  const passcode = useSelector((state) => state.couple.passcode);
  const couple = useSelector((state) => state.couple.info);

  const [unlockedSecrets, setUnlockedSecrets] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [targetSecretId, setTargetSecretId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [newPin, setNewPin] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    author: 'Anh',
    color: 'yellow',
    isSecret: false,
  });

  const handleUnlockAttempt = (e) => {
    e.preventDefault();
    if (pinInput === passcode) {
      setUnlockedSecrets(prev => [...prev, targetSecretId]);
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (newPin.length === 4) {
      dispatch(setPasscode(newPin));
      setIsChangePinOpen(false);
      setNewPin('');
      alert('Đã đổi mật mã PIN bí mật thành công! 🔑');
    } else {
      alert('Vui lòng nhập mật mã gồm 4 chữ số.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('Vui lòng nhập tiêu đề và nội dung thư.');
      return;
    }

    dispatch(addNoteAsync({
      ...form,
      date: new Date().toLocaleDateString('vi-VN'),
    }));

    setIsAddOpen(false);
    setForm({ title: '', content: '', author: 'Anh', color: 'yellow', isSecret: false });
  };

  const cardColors = {
    yellow: 'bg-amber-500/10 border-amber-500/30 text-theme-text',
    pink: 'bg-rose-500/10 border-rose-500/30 text-theme-text',
    blue: 'bg-sky-500/10 border-sky-500/30 text-theme-text',
    purple: 'bg-purple-500/10 border-purple-500/30 text-theme-text',
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-theme-primary to-theme-secondary flex items-center justify-center shadow-lg text-black">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
              Hộp Thư Tình Yêu & Bức Thư Bí Mật 💌
            </h2>
            <p className="text-xs text-theme-muted mt-1">
              Nơi trao gửi những lời thì thầm ngọt ngào và những bức thư bảo mật bằng mã PIN
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => setIsChangePinOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 text-theme-text font-bold text-xs flex items-center gap-1.5 hover:bg-white/20 transition-colors cursor-pointer"
            title="Đổi mã PIN bảo mật thư bí mật"
          >
            <Key className="w-4 h-4 text-theme-primary" /> Đổi Mật Mã PIN
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-theme-primary text-black font-bold text-xs flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Viết Thư Mới
          </button>
        </div>
      </div>

      {/* Love Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loveNotes.map((note) => {
          const noteId = note._id || note.id;
          const isSecret = note.isSecret;
          const isUnlocked = unlockedSecrets.includes(noteId);

          return (
            <div
              key={noteId}
              className={`glass-panel p-6 rounded-3xl border transition-all duration-300 space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden ${
                cardColors[note.color] || cardColors.yellow
              }`}
            >
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-theme-muted flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current text-theme-secondary" /> Gửi từ: {note.author === 'Anh' ? couple.user1?.name : note.author === 'Em' ? couple.user2?.name : note.author}
                  </span>

                  <div className="flex items-center gap-2">
                    {isSecret && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1">
                        {isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isUnlocked ? 'Đã mở khóa' : 'Bí mật PIN'}
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Xóa bức thư "${note.title}"?`)) {
                          dispatch(deleteNoteAsync(noteId));
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                      title="Xóa thư"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold font-sans text-theme-text">{note.title}</h3>

                {/* Content View or Lock Blur */}
                {isSecret && !isUnlocked ? (
                  <div className="py-6 text-center space-y-3 bg-black/10 dark:bg-black/40 rounded-2xl border border-white/10 p-4 backdrop-blur-md">
                    <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Lock className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-xs text-theme-text font-medium">
                      Bức thư bí mật này đã được khóa bằng mã PIN!
                    </p>
                    <button
                      onClick={() => {
                        setTargetSecretId(noteId);
                        setIsPinModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-600 transition-colors shadow-md cursor-pointer"
                    >
                      Nhập Mã PIN Để Đọc 🔑
                    </button>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed font-handwriting text-base text-theme-text opacity-90 whitespace-pre-wrap">
                    "{note.content}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-theme-muted">
                <span>{note.date}</span>
                <span>{isSecret ? 'Thư bí mật' : 'Thư công khai'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {loveNotes.length === 0 && (
        <div className="text-center py-16 glass-panel rounded-3xl text-theme-muted text-sm">
          Chưa có bức thư tình nào. Bấm "Viết Thư Mới" để gửi lời yêu thương cho người ấy nhé!
        </div>
      )}

      {/* PIN Verification Modal */}
      {isPinModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-sm p-6 text-center space-y-4 border border-white/20 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
              <Key className="w-7 h-7" />
            </div>

            <div>
              <h4 className="font-bold text-lg font-sans">Mở Khóa Bức Thư Bí Mật 🔑</h4>
              <p className="text-xs text-theme-muted mt-1">Nhập mã PIN 4 chữ số (Mặc định: 1234)</p>
            </div>

            <form onSubmit={handleUnlockAttempt} className="space-y-3">
              <input
                type="password"
                maxLength="4"
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="• • • •"
                className="w-full p-3 text-center text-xl font-bold tracking-widest rounded-xl bg-black/20 border border-white/20"
              />

              {pinError && (
                <p className="text-xs text-red-400 font-bold">Mật mã PIN không đúng! Vui lòng thử lại.</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinModalOpen(false);
                    setPinInput('');
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-600 shadow-md"
                >
                  Mở Thư 🔓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {isChangePinOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-sm p-6 text-center space-y-4 border border-white/20 shadow-2xl">
            <h4 className="font-bold text-lg font-sans">Đổi Mật Mã PIN Bảo Mật 🔑</h4>
            <p className="text-xs text-theme-muted">Mã PIN mới gồm 4 chữ số dùng cho các thư bí mật:</p>

            <form onSubmit={handleSavePin} className="space-y-3">
              <input
                type="text"
                maxLength="4"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Nhập 4 số mới (VD: 5678)"
                className="w-full p-3 text-center text-lg font-bold rounded-xl bg-black/20 border border-white/20"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-theme-primary text-black font-bold text-xs hover:opacity-90 shadow-md"
                >
                  Lưu PIN Mới 🔒
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isAddOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-md p-6 border border-white/20 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-theme-primary" /> Viết Bức Thư Tình Mới
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Tiêu Đề Bức Thư *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="VD: Gửi em yêu của anh, Chúc buổi sáng..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Nội Dung Lời Yêu Thương *</label>
                <textarea
                  rows="4"
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Viết những suy nghĩ, tình cảm chân thành dành cho người ấy..."
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-handwriting text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Người Viết</label>
                  <select
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  >
                    <option value="Anh" className="bg-zinc-900 text-white">{couple.user1?.name || 'Anh'}</option>
                    <option value="Em" className="bg-zinc-900 text-white">{couple.user2?.name || 'Em'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Màu Giấy Thư</label>
                  <select
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 font-sans"
                  >
                    <option value="yellow" className="bg-zinc-900 text-amber-300">Vàng Ánh Kim</option>
                    <option value="pink" className="bg-zinc-900 text-rose-300">Hồng Ngọt Ngào</option>
                    <option value="purple" className="bg-zinc-900 text-purple-300">Tím Bí Mật</option>
                    <option value="blue" className="bg-zinc-900 text-sky-300">Xanh Nhẹ Nhàng</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-300">
                  <input
                    type="checkbox"
                    checked={form.isSecret}
                    onChange={(e) => setForm({ ...form, isSecret: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-400"
                  />
                  <span>🔒 Khóa thư này bằng mã PIN bảo mật</span>
                </label>
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
                  Gửi Thư Tình 💌
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
