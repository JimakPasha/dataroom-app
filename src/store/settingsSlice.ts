import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LayoutMode = 'grid' | 'list';
type SortBy = 'name' | 'dateModified';
type SortDirection = 'asc' | 'desc';
type FoldersPosition = 'top' | 'mixed';

interface SettingsState {
  layoutMode: LayoutMode;
  sortBy: SortBy;
  sortDirection: SortDirection;
  foldersPosition: FoldersPosition;
}

const SETTINGS_STORAGE_KEY = 'dataroom-settings';

const loadSettingsFromStorage = (): Partial<SettingsState> => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    return {};
  }
  return {};
};

const saveSettingsToStorage = (settings: SettingsState) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving settings to storage:', error);
  }
};

const defaultSettings: SettingsState = {
  layoutMode: 'grid',
  sortBy: 'name',
  sortDirection: 'asc',
  foldersPosition: 'top',
};

const loadedSettings = loadSettingsFromStorage();

const initialState: SettingsState = {
  ...defaultSettings,
  ...loadedSettings,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLayoutMode: (state, action: PayloadAction<LayoutMode>) => {
      state.layoutMode = action.payload;
      saveSettingsToStorage(state);
    },
    setSortBy: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload;
      saveSettingsToStorage(state);
    },
    setSortDirection: (state, action: PayloadAction<SortDirection>) => {
      state.sortDirection = action.payload;
      saveSettingsToStorage(state);
    },
    setFoldersPosition: (state, action: PayloadAction<FoldersPosition>) => {
      state.foldersPosition = action.payload;
      saveSettingsToStorage(state);
    },
  },
});

export const { setLayoutMode, setSortBy, setSortDirection, setFoldersPosition } = settingsSlice.actions;
export default settingsSlice.reducer;

