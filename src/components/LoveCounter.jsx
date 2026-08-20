import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addHeart, updateCoupleAsync } from '../store/slices/coupleSlice';
import { PRESET_STATUSES } from '../context/AppContext';
import { Heart, Sparkles, MessageCircle } from 'lucide-react';
import { useHeartBurst } from './HeartBurst';
import { triggerHapticFeedback } from '../utils/notifications';

export const LoveCounter = () => {
  const dispatch = useDispatch();
  const couple = useSelector((state) => state.couple.info);
  const activeRole = useSelector((state) => state.couple.activeRole);
  const { burst, BurstLayer } = useHeartBurst();

  const [elapsed, setElapsed] = useState({
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
  });

  const [activeUserEditing, setActiveUserEditing] = useState(null);
  const [statusInput, setStatusInput] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🥰');

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(couple.startDate || '2023-02-14');
      const now = new Date();
      const diffMs = Math.max(0, now - start);

      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const years = Math.floor(totalDays / 365);
      const remainingDays = totalDays % 365;

      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setElapsed({
        years,
        days: remainingDays,
        hours,
        minutes,
        seconds,
        totalDays,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [couple.startDate]);

  const handleSendLoveBlast = (e) => {
    dispatch(addHeart(10));
    burst(e);
    triggerHapticFeedback([100, 50, 100, 50, 100]);
  };

  const openStatusEditor = (userKey) => {
    setActiveUserEditing(userKey);
    setStatusInput(couple[userKey]?.status || '');
    setSelectedIcon(couple[userKey]?.statusIcon || '🥰');
  };

  const handleUpdateStatus = (userKey, text = statusInput, icon = selectedIcon) => {
    if (!text.trim()) return;
    dispatch(updateCoupleAsync({
      [userKey]: {
        ...couple[userKey],
        status: text,
        statusIcon: icon,
      }
    }));
    setActiveUserEditing(null);
    setStatusInput('');
  };

  const handleSelectPreset = (preset) => {
    setStatusInput(preset.label);
    setSelectedIcon(preset.icon);
    handleUpdateStatus(activeUserEditing, preset.label, preset.icon);
  };

  return (
    <div className="space-y-6">
      <BurstLayer />
      {/* Main Love Counter Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden text-center border border-white/20 shadow-2xl">
        
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-theme-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-theme-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-theme-primary/15 border border-theme-primary/30 text-xs font-semibold text-theme-primary backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> {couple.relationshipTitle || 'Hành Trình Yêu Thương'}
          </div>

          {/* Couple Avatars */}
          <div className="flex items-center justify-center gap-4 md:gap-10 py-4">
            
            {/* User 1 Avatar */}
            <div className="flex flex-col items-center group">
              <div className="relative">
                <img
                  src={couple.user1?.avatar}
                  alt={couple.user1?.name}
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 shadow-xl group-hover:scale-105 transition-transform ${
                    activeRole === 'user1' ? 'border-theme-primary ring-4 ring-theme-primary/30' : 'border-theme-primary'
                  }`}
                />
                <div className="absolute -bottom-1 -right-1 bg-theme-primary text-black px-2 py-0.5 rounded-full text-xs font-bold shadow">
                  {couple.user1?.statusIcon || '🥰'}
                </div>
              </div>
              <h3 className="font-bold font-sans mt-2 text-base md:text-lg">{couple.user1?.name}</h3>
              <p className="text-xs text-theme-muted font-medium">{couple.user1?.nickname}</p>
              
              {/* User 1 Status Pill */}
              <button 
                onClick={() => openStatusEditor('user1')}
                className="mt-2 text-[11px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 max-w-[140px] truncate text-theme-text transition-all hover:scale-105 flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>{couple.user1?.statusIcon || '💬'}</span>
                <span className="truncate font-medium">{couple.user1?.status || 'Đang nghĩ gì đó...'}</span>
              </button>
            </div>

            {/* Glowing Heart Pulse Center */}
            <div className="flex flex-col items-center">
              <button 
                onClick={handleSendLoveBlast}
                className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-theme-secondary/20 border border-theme-secondary/40 flex items-center justify-center text-theme-secondary shadow-lg hover:scale-110 active:scale-90 transition-transform group cursor-pointer"
                title="Nhấp vào trái tim để gửi 10 tim nổ hiệu ứng!"
              >
                <Heart className="w-8 h-8 md:w-11 md:h-11 fill-theme-secondary animate-heartbeat group-hover:scale-125 transition-transform" />
              </button>
              <div className="mt-2 text-xs font-bold text-theme-secondary uppercase tracking-widest font-sans">
                {elapsed.totalDays} Ngày Bên Nhau
              </div>
            </div>

            {/* User 2 Avatar */}
            <div className="flex flex-col items-center group">
              <div className="relative">
                <img
                  src={couple.user2?.avatar}
                  alt={couple.user2?.name}
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 shadow-xl group-hover:scale-105 transition-transform ${
                    activeRole === 'user2' ? 'border-theme-secondary ring-4 ring-theme-secondary/30' : 'border-theme-secondary'
                  }`}
                />
                <div className="absolute -bottom-1 -right-1 bg-theme-secondary text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                  {couple.user2?.statusIcon || '💖'}
                </div>
              </div>
              <h3 className="font-bold font-sans mt-2 text-base md:text-lg">{couple.user2?.name}</h3>
              <p className="text-xs text-theme-muted font-medium">{couple.user2?.nickname}</p>

              {/* User 2 Status Pill */}
              <button 
                onClick={() => openStatusEditor('user2')}
                className="mt-2 text-[11px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 max-w-[140px] truncate text-theme-text transition-all hover:scale-105 flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>{couple.user2?.statusIcon || '💬'}</span>
                <span className="truncate font-medium">{couple.user2?.status || 'Đang nghĩ gì đó...'}</span>
              </button>
            </div>

          </div>

          {/* Real-time Counter Grid */}
          <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-2xl mx-auto pt-2">
            {[
              { label: 'NĂM', val: elapsed.years },
              { label: 'NGÀY', val: elapsed.days },
              { label: 'GIỜ', val: elapsed.hours },
              { label: 'PHÚT', val: elapsed.minutes },
              { label: 'GIÂY', val: elapsed.seconds },
            ].map((unit, idx) => (
              <div 
                key={idx}
                className="glass-panel p-2.5 md:p-4 rounded-2xl border border-white/15 shadow-sm flex flex-col items-center justify-center hover:border-theme-primary/50 transition-colors"
              >
                <div className="text-xl md:text-3xl font-extrabold font-sans text-theme-primary tracking-tight">
                  {String(unit.val).padStart(2, '0')}
                </div>
                <div className="text-[10px] md:text-xs font-semibold text-theme-muted mt-1 uppercase">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>

          {/* Send Love Blast Action */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleSendLoveBlast}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-theme-primary to-theme-secondary text-black font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Bắn Tim Yêu Thương 💖
            </button>
          </div>

        </div>
      </div>

      {/* Preset Status Picker Modal */}
      {activeUserEditing && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box p-6 border border-white/20 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-theme-primary" /> Cập Nhật Trạng Thái Cho {couple[activeUserEditing]?.name}
              </h4>
              <button 
                onClick={() => setActiveUserEditing(null)}
                className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-theme-muted">Chọn nhanh trạng thái có sẵn hoặc nhập trạng thái tự do:</p>

            {/* Quick Preset Status Pills */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {PRESET_STATUSES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-theme-primary/20 hover:border-theme-primary/40 border border-white/10 text-xs text-left transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
                >
                  <span className="text-base group-hover:scale-125 transition-transform">{preset.icon}</span>
                  <span className="truncate font-semibold">{preset.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Input Option */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <label className="block text-xs font-bold">Hoặc Nhập Trạng Thái Tự Do:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  placeholder="VD: Đang nghĩ về anh/em..."
                  className="flex-1 p-2.5 rounded-xl bg-black/10 border border-white/10 text-xs"
                />
                <button
                  onClick={() => handleUpdateStatus(activeUserEditing)}
                  className="px-4 py-2.5 rounded-xl bg-theme-primary text-black font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Lưu
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
