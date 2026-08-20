import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AppContext = createContext();

const INITIAL_COUPLE = {
  user1: {
    name: 'Anh',
    nickname: 'Chồng Yêu 💛',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'Yêu em nhiều lắm 💕',
    statusIcon: '🥰',
  },
  user2: {
    name: 'Em',
    nickname: 'Vợ Yêu 🌸',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    status: 'Thèm trà sữa 🧋',
    statusIcon: '💖',
  },
  startDate: '2023-02-14T00:00:00',
  relationshipTitle: 'Hành Trình Yêu Thương Dành Cho Hai Chúng Mình',
};

export const PRESET_STATUSES = [
  { label: 'Yêu em 💕', icon: '🥰' },
  { label: 'Yêu anh 💕', icon: '🥰' },
  { label: 'Đói bụng rồi 🍜', icon: '😋' },
  { label: 'Mệt mỏi quá 🥺', icon: '🥺' },
  { label: 'Muốn đi ăn 🍕', icon: '🍕' },
  { label: 'Muốn đi chơi 🎡', icon: '🎢' },
  { label: 'Muốn gặp ngay 💖', icon: '😍' },
  { label: 'Thèm trà sữa 🧋', icon: '🧋' },
  { label: 'Nhớ người yêu 💌', icon: '💘' },
  { label: 'Đang bận làm việc 💼', icon: '💻' },
  { label: 'Cần ôm một cái 🫂', icon: '🫂' },
];

export const AppProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('love_device_role') || null);
  const [couple, setCouple] = useState(INITIAL_COUPLE);
  const [user1Theme, setUser1Theme] = useState(() => localStorage.getItem('love_theme_user1') || 'golden');
  const [user2Theme, setUser2Theme] = useState(() => localStorage.getItem('love_theme_user2') || 'cherry');

  const activeTheme = activeRole === 'user2' ? user2Theme : user1Theme;

  const [milestones, setMilestones] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loveNotes, setLoveNotes] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [passcode, setPasscode] = useState('1234');
  const [heartCount, setHeartCount] = useState(520);
  const [isLoading, setIsLoading] = useState(true);

  // Global Music State
  const [isPlayingGlobal, setIsPlayingGlobal] = useState(() => localStorage.getItem('love_music_playing') === 'true');
  const [currentSongIndex, setCurrentSongIndex] = useState(() => {
    const val = parseInt(localStorage.getItem('love_music_index') || '0', 10);
    return isNaN(val) ? 0 : val;
  });
  const [songFilter, setSongFilter] = useState(() => localStorage.getItem('love_music_filter') || 'all');
  const [playMode, setPlayMode] = useState(() => localStorage.getItem('love_music_mode') || 'sequential');

  // Load initial data from MongoDB API
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const data = await api.fetchAllData();
        if (data.couple) {
          setCouple(prev => ({ ...prev, ...data.couple }));
          if (data.couple.passcode) setPasscode(data.couple.passcode);
          if (data.couple.heartCount) setHeartCount(data.couple.heartCount);
        }
        if (data.milestones) setMilestones(data.milestones);
        if (data.gallery) setGallery(data.gallery);
        if (data.playlist) setPlaylist(data.playlist);
        if (data.reminders) setReminders(data.reminders);
        if (data.loveNotes) setLoveNotes(data.loveNotes);
        if (data.bucketList) setBucketList(data.bucketList);
      } catch (err) {
        console.warn('Backend API not available, falling back to LocalStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBackendData();
  }, []);

  // Theme application
  useEffect(() => {
    if (activeTheme === 'golden') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', activeTheme);
    }
  }, [activeTheme]);

  // Persist role & theme preferences
  useEffect(() => { if (activeRole) localStorage.setItem('love_device_role', activeRole); }, [activeRole]);
  useEffect(() => { localStorage.setItem('love_theme_user1', user1Theme); }, [user1Theme]);
  useEffect(() => { localStorage.setItem('love_theme_user2', user2Theme); }, [user2Theme]);
  useEffect(() => { localStorage.setItem('love_music_playing', isPlayingGlobal.toString()); }, [isPlayingGlobal]);
  useEffect(() => { localStorage.setItem('love_music_index', currentSongIndex.toString()); }, [currentSongIndex]);
  useEffect(() => { localStorage.setItem('love_music_filter', songFilter); }, [songFilter]);
  useEffect(() => { localStorage.setItem('love_music_mode', playMode); }, [playMode]);

  const setThemeForActiveRole = (newTheme) => {
    if (activeRole === 'user2') setUser2Theme(newTheme);
    else setUser1Theme(newTheme);
  };

  // Actions with API & MongoDB Sync
  const updateCoupleInfo = async (updated) => {
    setCouple(prev => ({ ...prev, ...updated }));
    try {
      await api.updateCoupleApi(updated);
    } catch (e) {
      console.error('Failed to update couple info in DB:', e);
    }
  };

  const addHeart = (amount = 1) => {
    setHeartCount(prev => {
      const next = prev + amount;
      api.updateCoupleApi({ heartCount: next }).catch(() => {});
      return next;
    });
  };

  // Songs CRUD (Fixed deletion bug)
  const addSong = async (songData) => {
    try {
      const newSong = await api.addSongApi(songData);
      setPlaylist(prev => [newSong, ...prev]);
    } catch (e) {
      console.error('Error adding song:', e);
      const fallback = { id: 'p_' + Date.now(), ...songData };
      setPlaylist(prev => [fallback, ...prev]);
    }
  };

  const deleteSong = async (targetId) => {
    if (!targetId) return;
    try {
      // Optimistic state update
      setPlaylist(prev => prev.filter(s => (s._id || s.id) !== targetId));
      await api.deleteSongApi(targetId);
    } catch (e) {
      console.error('Error deleting song:', e);
    } finally {
      // Safely adjust currentSongIndex if needed
      setCurrentSongIndex(prev => {
        if (playlist.length <= 1) return 0;
        return prev >= playlist.length - 1 ? 0 : prev;
      });
    }
  };

  // Milestones CRUD
  const addMilestone = async (item) => {
    try {
      let imageUrl = item.image;
      if (item.image && item.image.startsWith('data:')) {
        const upload = await api.uploadImageApi(item.image);
        imageUrl = upload.url;
      }
      const newItem = await api.addMilestoneApi({ ...item, image: imageUrl });
      setMilestones(prev => [newItem, ...prev]);
    } catch (e) {
      console.error('Error adding milestone:', e);
      setMilestones(prev => [item, ...prev]);
    }
  };

  const deleteMilestone = async (id) => {
    setMilestones(prev => prev.filter(m => (m._id || m.id) !== id));
    api.deleteMilestoneApi(id).catch(() => {});
  };

  // Gallery CRUD with Cloudinary Upload
  const addPhoto = async (photo) => {
    try {
      let imageUrl = photo.url;
      let publicId = '';
      if (photo.url && photo.url.startsWith('data:')) {
        const upload = await api.uploadImageApi(photo.url);
        imageUrl = upload.url;
        publicId = upload.public_id;
      }
      const newPhoto = await api.addPhotoApi({ ...photo, url: imageUrl, public_id: publicId });
      setGallery(prev => [newPhoto, ...prev]);
    } catch (e) {
      console.error('Error adding photo:', e);
      setGallery(prev => [photo, ...prev]);
    }
  };

  const deletePhoto = async (id) => {
    setGallery(prev => prev.filter(p => (p._id || p.id) !== id));
    api.deletePhotoApi(id).catch(() => {});
  };

  const toggleLikePhoto = async (id) => {
    setGallery(prev => prev.map(p => (p._id || p.id) === id ? { ...p, liked: !p.liked } : p));
    api.toggleLikePhotoApi(id).catch(() => {});
  };

  // Reminders CRUD
  const addReminder = async (rem) => {
    try {
      const newRem = await api.addReminderApi(rem);
      setReminders(prev => [newRem, ...prev]);
    } catch (e) {
      setReminders(prev => [rem, ...prev]);
    }
  };

  const deleteReminder = async (id) => {
    setReminders(prev => prev.filter(r => (r._id || r.id) !== id));
    api.deleteReminderApi(id).catch(() => {});
  };

  // Love Notes CRUD
  const addNote = async (note) => {
    try {
      const newNote = await api.addNoteApi(note);
      setLoveNotes(prev => [newNote, ...prev]);
    } catch (e) {
      setLoveNotes(prev => [note, ...prev]);
    }
  };

  const deleteNote = async (id) => {
    setLoveNotes(prev => prev.filter(n => (n._id || n.id) !== id));
    api.deleteNoteApi(id).catch(() => {});
  };

  // Bucket List CRUD
  const addBucketItem = async (title) => {
    try {
      const newItem = await api.addBucketItemApi(title);
      setBucketList(prev => [...prev, newItem]);
    } catch (e) {
      setBucketList(prev => [...prev, { id: 'b_' + Date.now(), title, completed: false }]);
    }
  };

  const toggleBucketItem = async (id) => {
    setBucketList(prev => prev.map(b => (b._id || b.id) === id ? {
      ...b,
      completed: !b.completed,
      date: !b.completed ? new Date().toISOString().split('T')[0] : null
    } : b));
    api.toggleBucketItemApi(id).catch(() => {});
  };

  const setPasscodeAndSync = (newPin) => {
    setPasscode(newPin);
    updateCoupleInfo({ passcode: newPin });
  };

  const togglePlayGlobal = () => setIsPlayingGlobal(prev => !prev);

  const nextSongGlobal = () => {
    if (playlist.length === 0) return;
    if (playMode === 'shuffle' && playlist.length > 1) {
      let randomIndex = currentSongIndex;
      while (randomIndex === currentSongIndex) {
        randomIndex = Math.floor(Math.random() * playlist.length);
      }
      setCurrentSongIndex(randomIndex);
    } else {
      setCurrentSongIndex(prev => (prev + 1) % playlist.length);
    }
    setIsPlayingGlobal(true);
  };

  const prevSongGlobal = () => {
    if (playlist.length === 0) return;
    setCurrentSongIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setIsPlayingGlobal(true);
  };

  return (
    <AppContext.Provider value={{
      activeRole, setActiveRole,
      couple, updateCoupleInfo,
      theme: activeTheme, setTheme: setThemeForActiveRole,
      user1Theme, user2Theme,
      milestones, addMilestone, deleteMilestone,
      gallery, addPhoto, deletePhoto, toggleLikePhoto,
      playlist, addSong, deleteSong,
      reminders, addReminder, deleteReminder,
      loveNotes, addNote, deleteNote,
      bucketList, toggleBucketItem, addBucketItem,
      passcode, setPasscode: setPasscodeAndSync,
      heartCount, addHeart,
      isPlayingGlobal, setIsPlayingGlobal, togglePlayGlobal,
      currentSongIndex, setCurrentSongIndex, nextSongGlobal, prevSongGlobal,
      songFilter, setSongFilter,
      playMode, setPlayMode,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
