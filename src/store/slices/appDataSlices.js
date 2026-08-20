import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api';
import { setCoupleData } from './coupleSlice';
import { setPlaylist } from './musicSlice';

export const fetchAllAppDataAsync = createAsyncThunk(
  'appData/fetchAll',
  async (_, { dispatch }) => {
    const data = await api.fetchAllData();
    if (data.couple) {
      dispatch(setCoupleData(data.couple));
    }
    if (data.playlist) {
      dispatch(setPlaylist(data.playlist));
    }
    return data;
  }
);

// Milestone Async Thunks
export const addMilestoneAsync = createAsyncThunk(
  'appData/addMilestone',
  async (item) => {
    let imageUrl = item.image;
    if (item.image && item.image.startsWith('data:')) {
      const upload = await api.uploadImageApi(item.image);
      imageUrl = upload.url;
    }
    return await api.addMilestoneApi({ ...item, image: imageUrl });
  }
);

export const deleteMilestoneAsync = createAsyncThunk(
  'appData/deleteMilestone',
  async (id) => {
    await api.deleteMilestoneApi(id);
    return id;
  }
);

// Gallery Async Thunks
export const addPhotoAsync = createAsyncThunk(
  'appData/addPhoto',
  async (photo) => {
    let imageUrl = photo.url;
    let publicId = '';
    if (photo.url && photo.url.startsWith('data:')) {
      const upload = await api.uploadImageApi(photo.url);
      imageUrl = upload.url;
      publicId = upload.public_id;
    }
    return await api.addPhotoApi({ ...photo, url: imageUrl, public_id: publicId });
  }
);

export const deletePhotoAsync = createAsyncThunk(
  'appData/deletePhoto',
  async (id) => {
    await api.deletePhotoApi(id);
    return id;
  }
);

export const toggleLikePhotoAsync = createAsyncThunk(
  'appData/toggleLikePhoto',
  async (id) => {
    return await api.toggleLikePhotoApi(id);
  }
);

// Reminder Async Thunks
export const addReminderAsync = createAsyncThunk(
  'appData/addReminder',
  async (rem) => {
    return await api.addReminderApi(rem);
  }
);

export const deleteReminderAsync = createAsyncThunk(
  'appData/deleteReminder',
  async (id) => {
    await api.deleteReminderApi(id);
    return id;
  }
);

// Love Note Async Thunks
export const addNoteAsync = createAsyncThunk(
  'appData/addNote',
  async (note) => {
    return await api.addNoteApi(note);
  }
);

export const deleteNoteAsync = createAsyncThunk(
  'appData/deleteNote',
  async (id) => {
    await api.deleteNoteApi(id);
    return id;
  }
);

// Bucket List Async Thunks
export const addBucketItemAsync = createAsyncThunk(
  'appData/addBucketItem',
  async (title) => {
    return await api.addBucketItemApi(title);
  }
);

export const toggleBucketItemAsync = createAsyncThunk(
  'appData/toggleBucketItem',
  async (id) => {
    return await api.toggleBucketItemApi(id);
  }
);

export const appDataSlice = createSlice({
  name: 'appData',
  initialState: {
    milestones: [],
    gallery: [],
    reminders: [],
    loveNotes: [],
    bucketList: [],
    isLoading: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAppDataAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllAppDataAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.milestones) state.milestones = action.payload.milestones;
        if (action.payload.gallery) state.gallery = action.payload.gallery;
        if (action.payload.reminders) state.reminders = action.payload.reminders;
        if (action.payload.loveNotes) state.loveNotes = action.payload.loveNotes;
        if (action.payload.bucketList) state.bucketList = action.payload.bucketList;
      })
      .addCase(addMilestoneAsync.fulfilled, (state, action) => {
        state.milestones.unshift(action.payload);
      })
      .addCase(deleteMilestoneAsync.fulfilled, (state, action) => {
        state.milestones = state.milestones.filter(m => (m._id || m.id) !== action.payload);
      })
      .addCase(addPhotoAsync.fulfilled, (state, action) => {
        state.gallery.unshift(action.payload);
      })
      .addCase(deletePhotoAsync.fulfilled, (state, action) => {
        state.gallery = state.gallery.filter(p => (p._id || p.id) !== action.payload);
      })
      .addCase(toggleLikePhotoAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        state.gallery = state.gallery.map(p => (p._id || p.id) === (updated._id || updated.id) ? updated : p);
      })
      .addCase(addReminderAsync.fulfilled, (state, action) => {
        state.reminders.unshift(action.payload);
      })
      .addCase(deleteReminderAsync.fulfilled, (state, action) => {
        state.reminders = state.reminders.filter(r => (r._id || r.id) !== action.payload);
      })
      .addCase(addNoteAsync.fulfilled, (state, action) => {
        state.loveNotes.unshift(action.payload);
      })
      .addCase(deleteNoteAsync.fulfilled, (state, action) => {
        state.loveNotes = state.loveNotes.filter(n => (n._id || n.id) !== action.payload);
      })
      .addCase(addBucketItemAsync.fulfilled, (state, action) => {
        state.bucketList.push(action.payload);
      })
      .addCase(toggleBucketItemAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        state.bucketList = state.bucketList.map(b => (b._id || b.id) === (updated._id || updated.id) ? updated : b);
      });
  },
});

export default appDataSlice.reducer;
