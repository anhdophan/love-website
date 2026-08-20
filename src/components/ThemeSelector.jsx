import React from 'react';
import { useApp } from '../context/AppContext';
import { Palette, Check, User } from 'lucide-react';

const THEMES = [
  {
    id: 'golden',
    name: 'Golden Sunset 💛',
    desc: 'Vàng Ấm & Hồng Hoàng Hôn (Mặc Định)',
    primaryColor: '#FFB703',
    secondaryColor: '#E63946',
    bgColor: '#FFFDF9',
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom 🌸',
    desc: 'Hồng Anh Đào & Vàng Champagne',
    primaryColor: '#F472B6',
    secondaryColor: '#F59E0B',
    bgColor: '#FFF5F7',
  },
  {
    id: 'midnight',
    name: 'Midnight Starlight 🌙',
    desc: 'Xanh Đêm Velvet & Vàng Kim Hào Quang',
    primaryColor: '#FBBF24',
    secondaryColor: '#818CF8',
    bgColor: '#0F172A',
  },
  {
    id: 'sage',
    name: 'Sage & Honey 🍃',
    desc: 'Xanh Thảo Mộc & Vàng Mật Ôm',
    primaryColor: '#EAB308',
    secondaryColor: '#10B981',
    bgColor: '#F4F7F4',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Romance 💜',
    desc: 'Tím Thạch Anh & Vàng Huyền Bật',
    primaryColor: '#FACC15',
    secondaryColor: '#A855F7',
    bgColor: '#1A0B2E',
  },
];

export const ThemeSelector = ({ isOpen, onClose }) => {
  const { theme, setTheme, activeRole, couple } = useApp();

  if (!isOpen) return null;

  const currentUserName = activeRole === 'user2' ? couple.user2.name : couple.user1.name;

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-box max-w-md p-6 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-theme-primary/20 text-theme-primary">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans">Chọn Theme Riêng Dành Cho {currentUserName}</h3>
              <p className="text-xs text-theme-muted flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-theme-primary" /> Mối người được lưu 1 giao diện riêng tự động
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {THEMES.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-theme-primary bg-theme-primary/10 shadow-lg scale-[1.02]'
                    : 'border-white/10 hover:border-theme-primary/40 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-1.5">
                    <span 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm inline-block" 
                      style={{ backgroundColor: t.primaryColor }}
                    />
                    <span 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm inline-block" 
                      style={{ backgroundColor: t.secondaryColor }}
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs opacity-75 text-theme-muted">{t.desc}</div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-theme-primary text-black flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl bg-theme-primary text-black font-semibold hover:opacity-90 transition-opacity"
        >
          Lưu Theme Cho {currentUserName} 💖
        </button>
      </div>
    </div>
  );
};
