import { configureStore } from '@reduxjs/toolkit';
import dataroomReducer from './dataroomSlice';
import folderReducer from './folderSlice';
import fileReducer from './fileSlice';
import uiReducer from './uiSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    dataroom: dataroomReducer,
    folder: folderReducer,
    file: fileReducer,
    ui: uiReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

