import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addHeart, setActiveRole, updateCoupleAsync } from '../store/slices/coupleSlice';
import { togglePlayGlobal, nextSongGlobal } from '../store/slices/musicSlice';
import { 
  Heart, Palette, Clock, Image as ImageIcon, 
  Music, Calendar, Mail, CheckSquare, UserCheck, Home, Settings, User, RefreshCw, Play, Pause, SkipForward, Disc, ShieldCheck
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { SecurityModule } from './SecurityModule';
import { useHeartBurst } from './HeartBurst';
import { triggerHapticFeedback } from '../utils/notifications';

export const HeaderNavbar = ({ activeTab, setActiveTab }) => {
  const dispatch = useDispatch();
  const couple = useSelector((state) => state.couple.info);
  const heartCount = useSelector((state) => state.couple.heartCount);
  const activeRole = useSelector((state) => state.couple.activeRole);
  
  const playlist = useSelector((state) => state.music.playlist);
  const currentSongIndex = useSelector((state) => state.music.currentSongIndex);
  const isPlayingGlobal = useSelector((state) => state.music.isPlayingGlobal);

  const { burst, BurstLayer } = useHeartBurst();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState(couple);
  const [isSwitchRoleOpen, setIsSwitchRoleOpen] = useState(false);

  const handleHeartClick = (e) => {
    dispatch(addHeart(1));
    burst(e);
    triggerHapticFeedback([80, 40, 80]);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updateCoupleAsync(editForm));
    setIsEditProfileOpen(false);
  };

  const currentRoleName = activeRole === 'user2' ? couple.user2?.name : couple.user1?.name;
  const currentRoleAvatar = activeRole === 'user2' ? couple.user2?.avatar : couple.user1?.avatar;

  const handleSelectRole = (role) => {
    dispatch(setActiveRole(role));
    setIsSwitchRoleOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Trang Chủ', icon: Home },
    { id: 'timeline', label: 'Cột Mốc', icon: Clock },
    { id: 'gallery', label: 'Ảnh Kỷ Niệm', icon: ImageIcon },
    { id: 'music', label: 'Góc Nhạc', icon: Music },
    { id: 'schedule', label: 'Lịch Hẹn Hò', icon: Calendar },
    { id: 'notes', label: 'Thư Tình', icon: Mail },
    { id: 'bucket', label: 'Bucket List', icon: CheckSquare },
  ];

  return (
    <>
      <BurstLayer />
      <header className="sticky top-0 z-40 w-full px-4 py-3 transition-all duration-300">
        <div className="max-w-6xl mx-auto glass-panel rounded-3xl px-4 py-2.5 flex items-center justify-between shadow-xl">
          
          {/* Logo / Heart Counter */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleHeartClick}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-primary/15 border border-theme-primary/30 hover:bg-theme-primary/30 active:scale-95 transition-all group cursor-pointer"
              title="Nhấp để bắn tim yêu thương!"
            >
              <Heart className="w-5 h-5 text-theme-secondary fill-theme-secondary animate-heartbeat group-hover:scale-125 transition-transform" />
              <span className="font-bold text-sm text-theme-primary">{heartCount}</span>
            </button>

            <span className="hidden sm:inline-block font-handwriting text-xl text-theme-primary font-bold">
              {couple.user1?.name} & {couple.user2?.name}
            </span>
          </div>

          {/* Nav Items Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-2xl border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-theme-primary text-black shadow-md scale-105'
                      : 'text-theme-text opacity-80 hover:opacity-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Tools: User Role Switcher, Music Toggle & Theme */}
          <div className="flex items-center gap-2">
            
            {/* Global Persistent Mini Music Control Pill */}
            {playlist && playlist.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-2xl bg-black/10 dark:bg-white/10 border border-white/15 backdrop-blur-md">
                <button
                  onClick={() => setActiveTab('music')}
                  className="flex items-center gap-1 sm:gap-1.5 text-xs text-theme-primary font-bold hover:underline max-w-[70px] sm:max-w-[110px] md:max-w-[140px] truncate"
                  title="Chuyển đến trang Góc Nhạc"
                >
                  <Disc className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme-primary flex-shrink-0 ${isPlayingGlobal ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  <span className="truncate text-[10px] sm:text-[11px] hidden xs:inline">
                    {playlist[currentSongIndex]?.title || 'Phát nhạc'}
                  </span>
                </button>

                <button
                  onClick={() => dispatch(togglePlayGlobal())}
                  className="p-1 rounded-lg bg-theme-primary text-black hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  title={isPlayingGlobal ? "Tạm dừng nhạc" : "Bật nhạc"}
                >
                  {isPlayingGlobal ? <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black ml-0.5" />}
                </button>

                <button
                  onClick={() => dispatch(nextSongGlobal())}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-theme-text transition-colors cursor-pointer hidden sm:block"
                  title="Bài tiếp theo"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Active User Role Switcher Button */}
            <button
              onClick={() => setIsSwitchRoleOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-2xl bg-theme-primary/20 hover:bg-theme-primary/30 text-theme-primary border border-theme-primary/30 transition-all active:scale-95 cursor-pointer"
              title="Đổi tài khoản thiết bị này (Anh hoặc Em)"
            >
              <img src={currentRoleAvatar} alt={currentRoleName} className="w-5 h-5 rounded-full object-cover border border-white" />
              <span className="font-bold text-xs truncate max-w-[60px] sm:max-w-[80px] hidden xs:inline">{currentRoleName}</span>
              <RefreshCw className="w-3 h-3 opacity-60 hidden sm:inline" />
            </button>

            <button
              onClick={() => setIsThemeOpen(true)}
              className="p-2 rounded-xl bg-theme-primary/20 hover:bg-theme-primary/30 text-theme-primary transition-colors cursor-pointer"
              title="Đổi Theme màu sắc riêng"
            >
              <Palette className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSecurityOpen(true)}
              className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
              title="Trung tâm Bảo mật & PIN bí mật"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="p-2 rounded-xl bg-theme-primary/20 hover:bg-theme-primary/30 text-theme-primary transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin 2 đứa"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-50 glass-panel rounded-2xl p-1.5 flex items-center justify-around shadow-2xl border border-white/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-2 rounded-xl text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-theme-primary scale-110 font-bold'
                    : 'text-theme-muted opacity-70'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Role Picker Modal / Switcher */}
      {(isSwitchRoleOpen || !activeRole) && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-md p-8 text-center space-y-6 border border-white/20 shadow-2xl">
            
            <div className="w-16 h-16 rounded-full bg-theme-primary/20 text-theme-primary flex items-center justify-center mx-auto">
              <User className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-sans">Bạn Là Ai Trên Thiết Bị Này? 💛</h3>
              <p className="text-xs text-theme-muted">
                Chọn vai trò để website tự động cài đặt đúng status, theme màu riêng và tên của bạn!
              </p>
            </div>

            {/* Role Options Cards */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* User 1 Option */}
              <button
                onClick={() => handleSelectRole('user1')}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 cursor-pointer ${
                  activeRole === 'user1'
                    ? 'border-theme-primary bg-theme-primary/15 shadow-xl scale-105'
                    : 'border-white/10 hover:border-theme-primary/50 hover:bg-white/5'
                }`}
              >
                <img src={couple.user1?.avatar} alt={couple.user1?.name} className="w-16 h-16 rounded-full object-cover border-2 border-theme-primary shadow-md" />
                <div>
                  <h4 className="font-bold text-base">{couple.user1?.name}</h4>
                  <span className="text-[11px] text-theme-muted">{couple.user1?.nickname}</span>
                </div>
              </button>

              {/* User 2 Option */}
              <button
                onClick={() => handleSelectRole('user2')}
                className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 cursor-pointer ${
                  activeRole === 'user2'
                    ? 'border-theme-secondary bg-theme-secondary/15 shadow-xl scale-105'
                    : 'border-white/10 hover:border-theme-secondary/50 hover:bg-white/5'
                }`}
              >
                <img src={couple.user2?.avatar} alt={couple.user2?.name} className="w-16 h-16 rounded-full object-cover border-2 border-theme-secondary shadow-md" />
                <div>
                  <h4 className="font-bold text-base">{couple.user2?.name}</h4>
                  <span className="text-[11px] text-theme-muted">{couple.user2?.nickname}</span>
                </div>
              </button>

            </div>

            {activeRole && (
              <button
                onClick={() => setIsSwitchRoleOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-white/10 text-xs font-semibold hover:bg-white/20"
              >
                Đóng
              </button>
            )}

          </div>
        </div>
      )}

      {/* Security Module Modal */}
      <SecurityModule isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />

      {/* Theme Selector Modal */}
      <ThemeSelector isOpen={isThemeOpen} onClose={() => setIsThemeOpen(false)} />

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-box max-w-lg p-6 border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 font-sans flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-theme-primary" /> Chỉnh Sửa Thông Tin 2 Đứa
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                
                {/* User 1 */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="font-bold text-theme-primary text-xs block">Bạn (Nam / Partner 1)</span>
                  
                  {/* Avatar Preview & Upload */}
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={editForm.user1?.avatar} 
                      alt="Avatar User 1" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-theme-primary shadow-md"
                    />
                    <label className="px-3 py-1.5 rounded-xl bg-theme-primary/20 hover:bg-theme-primary/30 text-theme-primary text-[11px] font-bold cursor-pointer transition-colors text-center w-full">
                      📷 Tải Ảnh Máy Lên
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm(prev => ({
                                ...prev,
                                user1: { ...prev.user1, avatar: reader.result }
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={editForm.user1?.name || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      user1: { ...editForm.user1, name: e.target.value }
                    })}
                    placeholder="Tên / Biệt danh"
                    className="w-full p-2 rounded-xl bg-black/10 border border-white/10 text-xs"
                  />
                  <input
                    type="text"
                    value={editForm.user1?.nickname || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      user1: { ...editForm.user1, nickname: e.target.value }
                    })}
                    placeholder="Biệt danh yêu"
                    className="w-full p-2 rounded-xl bg-black/10 border border-white/10 text-xs"
                  />
                </div>

                {/* User 2 */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <span className="font-bold text-theme-secondary text-xs block">Người Yêu (Nữ / Partner 2)</span>
                  
                  {/* Avatar Preview & Upload */}
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={editForm.user2?.avatar} 
                      alt="Avatar User 2" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-theme-secondary shadow-md"
                    />
                    <label className="px-3 py-1.5 rounded-xl bg-theme-secondary/20 hover:bg-theme-secondary/30 text-theme-secondary text-[11px] font-bold cursor-pointer transition-colors text-center w-full">
                      📷 Tải Ảnh Máy Lên
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm(prev => ({
                                ...prev,
                                user2: { ...prev.user2, avatar: reader.result }
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={editForm.user2?.name || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      user2: { ...editForm.user2, name: e.target.value }
                    })}
                    placeholder="Tên / Biệt danh"
                    className="w-full p-2 rounded-xl bg-black/10 border border-white/10 text-xs"
                  />
                  <input
                    type="text"
                    value={editForm.user2?.nickname || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      user2: { ...editForm.user2, nickname: e.target.value }
                    })}
                    placeholder="Biệt danh yêu"
                    className="w-full p-2 rounded-xl bg-black/10 border border-white/10 text-xs"
                  />
                </div>
              </div>

              {/* Clean Date Picker for Start Date */}
              <div>
                <label className="block text-xs font-bold mb-1">Ngày Bắt Đầu Yêu Nhau (Chọn Ngày)</label>
                <input
                  type="date"
                  value={editForm.startDate ? editForm.startDate.split('T')[0] : '2023-02-14'}
                  onChange={(e) => setEditForm({ ...editForm, startDate: `${e.target.value}T00:00:00` })}
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 text-xs font-sans text-theme-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Tiêu Đề Không Gian Tình Yêu</label>
                <input
                  type="text"
                  value={editForm.relationshipTitle || ''}
                  onChange={(e) => setEditForm({ ...editForm, relationshipTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-black/10 border border-white/10 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-theme-primary text-black text-xs font-bold hover:opacity-90 shadow-md"
                >
                  Lưu Thay Đổi 💖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
