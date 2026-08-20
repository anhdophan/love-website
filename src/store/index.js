import { configureStore } from '@reduxjs/toolkit';
import coupleReducer from './slices/coupleSlice';
import musicReducer from './slices/musicSlice';
import appDataReducer from './slices/appDataSlices';

export const store = configureStore({
  reducer: {
    couple: coupleReducer,
    music: musicReducer,
    appData: appDataReducer,
  },
});
