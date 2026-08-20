import mongoose from 'mongoose';

// Couple Profile & App Info
const CoupleSchema = new mongoose.Schema({
  user1: {
    name: { type: String, default: 'Anh' },
    nickname: { type: String, default: 'Chồng Yêu 💛' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
    status: { type: String, default: 'Yêu em nhiều lắm 💕' },
    statusIcon: { type: String, default: '🥰' },
  },
  user2: {
    name: { type: String, default: 'Em' },
    nickname: { type: String, default: 'Vợ Yêu 🌸' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    status: { type: String, default: 'Thèm trà sữa 🧋' },
    statusIcon: { type: String, default: '💖' },
  },
  startDate: { type: String, default: '2023-02-14T00:00:00' },
  relationshipTitle: { type: String, default: 'Hành Trình Yêu Thương Dành Cho Hai Chúng Mình' },
  passcode: { type: String, default: '1234' },
  heartCount: { type: Number, default: 520 },
  user1Theme: { type: String, default: 'golden' },
  user2Theme: { type: String, default: 'rose' },
}, { timestamps: true });

// Timeline Milestones
const MilestoneSchema = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Kỷ niệm' },
  image: { type: String, default: '' },
  addedBy: { type: String, default: 'Both' },
  icon: { type: String, default: '💖' },
}, { timestamps: true });

// Gallery Memories
const GallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: '' },
  album: { type: String, default: 'Du Lịch' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  addedBy: { type: String, default: 'Both' },
  liked: { type: Boolean, default: true },
  public_id: { type: String, default: '' },
}, { timestamps: true });

// Music Playlist (Fix delete bug with Mongoose _id)
const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, default: 'Nhiều ca sĩ' },
  type: { type: String, default: 'youtube' },
  source: { type: String, required: true },
  addedBy: { type: String, default: 'Both' },
}, { timestamps: true });

// Dating Reminders
const ReminderSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, default: '19:00' },
  title: { type: String, required: true },
  location: { type: String, default: '' },
  note: { type: String, default: '' },
  remindDaysBefore: { type: Number, default: 1 },
  addedBy: { type: String, default: 'Both' },
}, { timestamps: true });

// Love Notes & Secret PIN Letters
const LoveNoteSchema = new mongoose.Schema({
  color: { type: String, default: 'yellow' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anh' },
  date: { type: String, default: () => new Date().toLocaleDateString('vi-VN') },
  isSecret: { type: Boolean, default: false },
}, { timestamps: true });

// 100 Couples Bucket List
const BucketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  date: { type: String, default: null },
}, { timestamps: true });

export const Couple = mongoose.model('Couple', CoupleSchema);
export const Milestone = mongoose.model('Milestone', MilestoneSchema);
export const Gallery = mongoose.model('Gallery', GallerySchema);
export const Song = mongoose.model('Song', SongSchema);
export const Reminder = mongoose.model('Reminder', ReminderSchema);
export const LoveNote = mongoose.model('LoveNote', LoveNoteSchema);
export const Bucket = mongoose.model('Bucket', BucketSchema);
