import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addBucketItemAsync, toggleBucketItemAsync } from '../store/slices/appDataSlices';
import { CheckSquare, Square, Plus, Sparkles, Trophy } from 'lucide-react';
import { useHeartBurst } from './HeartBurst';

export const BucketListModule = () => {
  const dispatch = useDispatch();
  const bucketList = useSelector((state) => state.appData.bucketList);
  const { burst, BurstLayer } = useHeartBurst();
  const [filter, setFilter] = useState('Tất cả');
  const [newTitle, setNewTitle] = useState('');

  const completedCount = bucketList.filter(b => b.completed).length;
  const totalCount = bucketList.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredItems = filter === 'Đã xong'
    ? bucketList.filter(b => b.completed)
    : filter === 'Chưa xong'
    ? bucketList.filter(b => !b.completed)
    : bucketList;

  const handleToggle = (id, currentCompleted, e) => {
    dispatch(toggleBucketItemAsync(id));
    if (!currentCompleted) {
      burst(e);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    dispatch(addBucketItemAsync(newTitle));
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      <BurstLayer />
      {/* Header Banner & Progress */}
      <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
              <Trophy className="w-6 h-6 text-theme-primary" /> 100 Điều Cùng Nhau Thực Hiện 🎯
            </h2>
            <p className="text-xs text-theme-muted mt-1">Danh sách ước mơ và trải nghiệm đáng nhớ hai đứa hứa sẽ hoàn thành cùng nhau</p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-2xl font-black font-sans text-theme-primary">{percentage}%</div>
              <div className="text-[10px] text-theme-muted font-bold uppercase">Tiến Độ</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-theme-primary/30 border-t-theme-primary flex items-center justify-center font-bold text-xs">
              {completedCount}/{totalCount}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-gradient-to-r from-theme-primary to-theme-secondary h-full rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Add New Item Form & Filters */}
      <div className="glass-panel p-4 rounded-3xl border border-white/15 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleAdd} className="flex-1 flex gap-2 w-full">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Thêm mục ước mơ mới vào danh sách..."
            className="flex-1 p-3 rounded-2xl bg-black/10 border border-white/10 text-xs text-theme-text"
          />
          <button
            type="submit"
            className="px-4 py-3 rounded-2xl bg-theme-primary text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Thêm Ước Mơ
          </button>
        </form>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 self-end md:self-auto">
          {['Tất cả', 'Chưa xong', 'Đã xong'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-theme-primary text-black shadow'
                  : 'text-theme-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bucket List Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const itemId = item._id || item.id;
          return (
            <div
              key={itemId}
              onClick={(e) => handleToggle(itemId, item.completed, e)}
              className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer group ${
                item.completed
                  ? 'bg-theme-primary/10 border-theme-primary/40 text-theme-text'
                  : 'glass-panel border-white/10 hover:border-theme-primary/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-theme-primary flex-shrink-0">
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 fill-theme-primary text-black" />
                  ) : (
                    <Square className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <span className={`text-xs font-semibold truncate ${item.completed ? 'line-through opacity-75' : ''}`}>
                  {item.title}
                </span>
              </div>

              {item.completed && item.date && (
                <span className="text-[10px] font-bold text-theme-primary px-2.5 py-1 rounded-full bg-theme-primary/15 whitespace-nowrap">
                  ✓ {item.date}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
