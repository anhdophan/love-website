import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPasscode } from '../store/slices/coupleSlice';
import { ShieldCheck, Lock, Key, AlertTriangle, CheckCircle2, Server, Globe } from 'lucide-react';

export const SecurityModule = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const passcode = useSelector((state) => state.couple.passcode);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);

  // Fetch security health from backend
  useEffect(() => {
    if (isOpen) {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => setBackendHealth(data.security))
        .catch(() => setBackendHealth(null));
    }
  }, [isOpen]);

  const handleChangePin = (e) => {
    e.preventDefault();
    if (currentPin !== passcode) {
      setMessage({ type: 'error', text: 'Mật mã PIN hiện tại không chính xác!' });
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMessage({ type: 'error', text: 'Mật mã PIN mới phải gồm đúng 4 chữ số!' });
      return;
    }
    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'Xác nhận mật mã PIN mới không trùng khớp!' });
      return;
    }

    dispatch(setPasscode(newPin));
    setMessage({ type: 'success', text: 'Đã đổi mật mã PIN bảo mật thành công! 🔒' });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel modal-box max-w-lg p-6 border border-white/20 shadow-2xl space-y-6 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-sans text-theme-text flex items-center gap-2">
                Trung Tâm Bảo Mật Website 🛡️
              </h3>
              <p className="text-theme-muted text-[11px]">Bảo vệ website chống hack, chống spam và quản lý PIN bí mật</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-theme-text">
            ✕
          </button>
        </div>

        {/* Security Health Matrix Badges */}
        <div className="space-y-2">
          <span className="font-bold text-theme-primary text-xs uppercase tracking-wider block">Trạng Thái An Ninh Hệ Thống:</span>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="block text-theme-text">Chống DDoS & Spam API</strong>
                <span className="text-[10px] text-theme-muted">Rate Limiter: {backendHealth?.rateLimiter || 'Kích hoạt'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="block text-theme-text">Lọc Mã Độc XSS</strong>
                <span className="text-[10px] text-theme-muted">XSS Sanitizer: {backendHealth?.xssSanitizer || 'Kích hoạt'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="block text-theme-text">Mã Hóa HTTP Headers</strong>
                <span className="text-[10px] text-theme-muted">Helmet Security: {backendHealth?.helmetProtection || 'Kích hoạt'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="block text-theme-text">MongoDB SSL Encryption</strong>
                <span className="text-[10px] text-theme-muted">Database: TLS/SSL 1.3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Passcode PIN Section */}
        <div className="p-4 rounded-2xl bg-black/10 border border-white/10 space-y-3">
          <h4 className="font-bold text-sm font-sans flex items-center gap-2 text-theme-text">
            <Lock className="w-4 h-4 text-purple-400" /> Đổi Mã PIN Thư Bí Mật (4 Chữ Số)
          </h4>

          {message && (
            <div className={`p-2.5 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-theme-muted mb-1">Mã PIN Hiện Tại</label>
              <input
                type="password"
                maxLength="4"
                required
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="• • • •"
                className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-center font-bold tracking-widest text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-theme-muted mb-1">Mã PIN Mới (4 số)</label>
                <input
                  type="password"
                  maxLength="4"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="• • • •"
                  className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-center font-bold tracking-widest text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-theme-muted mb-1">Xác Nhận PIN Mới</label>
                <input
                  type="password"
                  maxLength="4"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="• • • •"
                  className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-center font-bold tracking-widest text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-theme-primary text-black font-bold text-xs hover:opacity-90 transition-opacity shadow-md cursor-pointer mt-1"
            >
              Cập Nhật Mã PIN Mới 🔒
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-theme-muted text-center pt-1 border-t border-white/10">
          Shield Engine Security Layer • Safeguarding Your Love Memories 💛
        </div>

      </div>
    </div>
  );
};
