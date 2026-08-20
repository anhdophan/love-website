import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';

export const fetchSongsAsync = createAsyncThunk(
  'music/fetchSongs',
  async () => {
    const res = await api.fetchAllData();
    return res.playlist || [];
  }
);

export const addSongAsync = createAsyncThunk(
  'music/addSong',
  async (songData) => {
    const res = await api.addSongApi(songData);
    return res;
  }
);

export const deleteSongAsync = createAsyncThunk(
  'music/deleteSong',
  async (targetId) => {
    await api.deleteSongApi(targetId);
    return targetId;
  }
);

export const updateListeningStatusAsync = createAsyncThunk(
  'music/updateListeningStatus',
  async (statusData) => {
    const res = await api.updateListeningStatusApi(statusData);
    return res.listeningState;
  }
);

export const toggleSharedModeAsync = createAsyncThunk(
  'music/toggleSharedMode',
  async (isSharedMode) => {
    const res = await api.toggleSharedModeApi(isSharedMode);
    return res.listeningState;
  }
);

export const dedicateSongAsync = createAsyncThunk(
  'music/dedicateSong',
  async (dedicateData) => {
    const res = await api.dedicateSongApi(dedicateData);
    return res.dedicatedSong;
  }
);

export const clearDedicatedSongAsync = createAsyncThunk(
  'music/clearDedicatedSong',
  async () => {
    await api.clearDedicatedSongApi();
    return null;
  }
);

export const musicSlice = createSlice({
  name: 'music',
  initialState: {
    playlist: [],
    currentSongIndex: parseInt(localStorage.getItem('love_music_index') || '0', 10) || 0,
    isPlayingGlobal: localStorage.getItem('love_music_playing') === 'true',
    songFilter: localStorage.getItem('love_music_filter') || 'all',
    playMode: localStorage.getItem('love_music_mode') || 'sequential',
    currentTime: 0,
    listeningState: {
      user1: { songTitle: 'Chưa nghe bài nào', isPlaying: false },
      user2: { songTitle: 'Chưa nghe bài nào', isPlaying: false },
      isSharedMode: false,
    },
    dedicatedSong: null,
  },
  reducers: {
    setPlaylist: (state, action) => {
      state.playlist = action.payload || [];
    },
    setIsPlayingGlobal: (state, action) => {
      state.isPlayingGlobal = action.payload;
      localStorage.setItem('love_music_playing', action.payload.toString());
    },
    togglePlayGlobal: (state) => {
      state.isPlayingGlobal = !state.isPlayingGlobal;
      localStorage.setItem('love_music_playing', state.isPlayingGlobal.toString());
    },
    setCurrentSongIndex: (state, action) => {
      state.currentSongIndex = action.payload;
      localStorage.setItem('love_music_index', action.payload.toString());
    },
    setSongFilter: (state, action) => {
      state.songFilter = action.payload;
      localStorage.setItem('love_music_filter', action.payload);
    },
    setPlayMode: (state, action) => {
      state.playMode = action.payload;
      localStorage.setItem('love_music_mode', action.payload);
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    setListeningState: (state, action) => {
      if (action.payload) {
        state.listeningState = { ...state.listeningState, ...action.payload };
      }
    },
    setDedicatedSong: (state, action) => {
      state.dedicatedSong = action.payload;
    },
    nextSongGlobal: (state) => {
      if (state.playlist.length === 0) return;
      if (state.playMode === 'shuffle' && state.playlist.length > 1) {
        let randomIndex = state.currentSongIndex;
        while (randomIndex === state.currentSongIndex) {
          randomIndex = Math.floor(Math.random() * state.playlist.length);
        }
        state.currentSongIndex = randomIndex;
      } else {
        state.currentSongIndex = (state.currentSongIndex + 1) % state.playlist.length;
      }
      state.isPlayingGlobal = true;
      localStorage.setItem('love_music_index', state.currentSongIndex.toString());
      localStorage.setItem('love_music_playing', 'true');
    },
    prevSongGlobal: (state) => {
      if (state.playlist.length === 0) return;
      state.currentSongIndex = (state.currentSongIndex - 1 + state.playlist.length) % state.playlist.length;
      state.isPlayingGlobal = true;
      localStorage.setItem('love_music_index', state.currentSongIndex.toString());
      localStorage.setItem('love_music_playing', 'true');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSongsAsync.fulfilled, (state, action) => {
        state.playlist = action.payload;
      })
      .addCase(addSongAsync.fulfilled, (state, action) => {
        state.playlist.unshift(action.payload);
      })
      .addCase(deleteSongAsync.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.playlist = state.playlist.filter(s => (s._id || s.id) !== deletedId);
        if (state.currentSongIndex >= state.playlist.length) {
          state.currentSongIndex = 0;
        }
      })
      .addCase(updateListeningStatusAsync.fulfilled, (state, action) => {
        if (action.payload) state.listeningState = action.payload;
      })
      .addCase(toggleSharedModeAsync.fulfilled, (state, action) => {
        if (action.payload) state.listeningState = action.payload;
      })
      .addCase(dedicateSongAsync.fulfilled, (state, action) => {
        state.dedicatedSong = action.payload;
      })
      .addCase(clearDedicatedSongAsync.fulfilled, (state) => {
        state.dedicatedSong = null;
      });
  },
});

export const {
  setPlaylist,
  setIsPlayingGlobal,
  togglePlayGlobal,
  setCurrentSongIndex,
  setSongFilter,
  setPlayMode,
  setCurrentTime,
  setListeningState,
  setDedicatedSong,
  nextSongGlobal,
  prevSongGlobal,
} = musicSlice.actions;

export default musicSlice.reducer;
