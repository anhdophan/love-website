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

export const musicSlice = createSlice({
  name: 'music',
  initialState: {
    playlist: [],
    currentSongIndex: parseInt(localStorage.getItem('love_music_index') || '0', 10) || 0,
    isPlayingGlobal: localStorage.getItem('love_music_playing') === 'true',
    songFilter: localStorage.getItem('love_music_filter') || 'all',
    playMode: localStorage.getItem('love_music_mode') || 'sequential',
    currentTime: 0,
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
  nextSongGlobal,
  prevSongGlobal,
} = musicSlice.actions;

export default musicSlice.reducer;
