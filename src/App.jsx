import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllAppDataAsync } from './store/slices/appDataSlices';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LoveCounter } from './components/LoveCounter';
import { TimelineModule } from './components/TimelineModule';
import { GalleryModule } from './components/GalleryModule';
import { MusicPlayerModule } from './components/MusicPlayerModule';
import { ScheduleRemindersModule } from './components/ScheduleRemindersModule';
import { LoveNotesModule } from './components/LoveNotesModule';
import { BucketListModule } from './components/BucketListModule';
import { GlobalAudioEngine } from './components/GlobalAudioEngine';
import { Heart, Sparkles, Music, Image as ImageIcon, Calendar, CheckSquare, Mail } from 'lucide-react';

export default function App() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('home');
  const couple = useSelector((state) => state.couple.info);

  // Fetch initial app data from MongoDB Atlas on mount
  useEffect(() => {
    dispatch(fetchAllAppDataAsync());
  }, [dispatch]);

  // Floating background hearts generator
  const [hearts, setHearts] = useState([]);
  useEffect(() => {
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 18 + 10,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 5,
    }));
    setHearts(generated);
  }, []);

  return (
    <div className="relative min-h-screen pb-20 md:pb-12 overflow-x-hidden font-sans">
      
      {/* Floating Particle Hearts Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="particle-heart text-theme-primary/30"
            style={{
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
            }}
          >
            ♥
          </div>
        ))}
      </div>

      <HeaderNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-6xl mx-auto px-4 py-6 relative z-10 space-y-8 animate-fadeIn">
        
        {/* Global Audio/Video Engine - Stays Mounted Permanently */}
        <GlobalAudioEngine activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'home' && (
          <div className="space-y-8">
            <LoveCounter />

            {/* Feature Modules Quick Access Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4">
              {[
                { id: 'timeline', label: 'Cột Mốc Yêu', icon: Sparkles, color: 'text-amber-400' },
                { id: 'gallery', label: 'Ảnh Kỷ Niệm', icon: ImageIcon, color: 'text-rose-400' },
                { id: 'music', label: 'Góc Âm Nhạc', icon: Music, color: 'text-purple-400' },
                { id: 'schedule', label: 'Lịch Hẹn Hò', icon: Calendar, color: 'text-blue-400' },
                { id: 'notes', label: 'Thư Tình', icon: Mail, color: 'text-pink-400' },
                { id: 'bucket', label: '100 Ước Mơ', icon: CheckSquare, color: 'text-emerald-400' },
              ].map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    onClick={() => setActiveTab(tile.id)}
                    className="glass-panel glass-panel-hover p-4 rounded-2xl border border-white/15 flex flex-col items-center justify-center text-center space-y-2 group cursor-pointer"
                  >
                    <div className={`p-2.5 rounded-2xl bg-white/10 ${tile.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-sans">{tile.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Recent Highlights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/20 space-y-3">
                <h3 className="font-bold text-base font-sans flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-theme-primary" /> Thông Điệp Tình Yêu Hôm Nay
                </h3>
                <p className="text-sm text-theme-muted italic font-handwriting text-lg leading-relaxed">
                  "Dù thời gian có trôi đi bao lâu, nụ cười của em vẫn luôn là ánh nắng ấm áp nhất trong trái tim anh. Cảm ơn em vì đã đồng hành cùng anh trên mọi chặng đường."
                </p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-white/20 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base font-sans flex items-center gap-2">
                    <Heart className="w-5 h-5 text-theme-secondary fill-theme-secondary animate-pulse" /> Không Gian Riêng Tư
                  </h3>
                  <p className="text-xs text-theme-muted mt-1">
                    Website được tích hợp Cơ sở dữ liệu MongoDB Atlas & Bộ lưu trữ Cloudinary, giúp 2 đứa tự do truy cập từ bất kỳ thiết bị nào.
                  </p>
                </div>
                <div className="text-[11px] text-theme-primary font-bold">
                  💛 Thiết kế riêng dành tặng {couple.user1?.name} & {couple.user2?.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && <TimelineModule />}
        {activeTab === 'gallery' && <GalleryModule />}
        {activeTab === 'music' && <MusicPlayerModule />}
        {activeTab === 'schedule' && <ScheduleRemindersModule />}
        {activeTab === 'notes' && <LoveNotesModule />}
        {activeTab === 'bucket' && <BucketListModule />}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-theme-muted space-y-1 relative z-10 border-t border-white/10 mt-12">
        <p className="font-bold font-sans">
          Built with 💛 & Antigravity Motion for {couple.user1?.name} & {couple.user2?.name}
        </p>
        <p className="text-[10px] opacity-75">Forever Together • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
