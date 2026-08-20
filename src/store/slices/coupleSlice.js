import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';

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

export const updateCoupleAsync = createAsyncThunk(
  'couple/updateCouple',
  async (updatedData) => {
    const res = await api.updateCoupleApi(updatedData);
    return res;
  }
);

export const coupleSlice = createSlice({
  name: 'couple',
  initialState: {
    info: INITIAL_COUPLE,
    activeRole: localStorage.getItem('love_device_role') || null,
    user1Theme: localStorage.getItem('love_theme_user1') || 'golden',
    user2Theme: localStorage.getItem('love_theme_user2') || 'cherry',
    passcode: '1234',
    heartCount: 520,
  },
  reducers: {
    setCoupleData: (state, action) => {
      if (action.payload) {
        state.info = { ...state.info, ...action.payload };
        if (action.payload.passcode) state.passcode = action.payload.passcode;
        if (action.payload.heartCount) state.heartCount = action.payload.heartCount;
        if (action.payload.user1Theme) state.user1Theme = action.payload.user1Theme;
        if (action.payload.user2Theme) state.user2Theme = action.payload.user2Theme;
      }
    },
    setActiveRole: (state, action) => {
      state.activeRole = action.payload;
      if (action.payload) localStorage.setItem('love_device_role', action.payload);
    },
    setUser1Theme: (state, action) => {
      state.user1Theme = action.payload;
      localStorage.setItem('love_theme_user1', action.payload);
      api.updateCoupleApi({ user1Theme: action.payload }).catch(() => {});
    },
    setUser2Theme: (state, action) => {
      state.user2Theme = action.payload;
      localStorage.setItem('love_theme_user2', action.payload);
      api.updateCoupleApi({ user2Theme: action.payload }).catch(() => {});
    },
    addHeart: (state, action) => {
      const amount = action.payload || 1;
      state.heartCount += amount;
      api.updateCoupleApi({ heartCount: state.heartCount }).catch(() => {});
    },
    setPasscode: (state, action) => {
      state.passcode = action.payload;
      api.updateCoupleApi({ passcode: action.payload }).catch(() => {});
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateCoupleAsync.fulfilled, (state, action) => {
      if (action.payload) {
        state.info = { ...state.info, ...action.payload };
      }
    });
  },
});

export const {
  setCoupleData,
  setActiveRole,
  setUser1Theme,
  setUser2Theme,
  addHeart,
  setPasscode,
} = coupleSlice.actions;

export default coupleSlice.reducer;
