import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  selectedItem: { type: 'folder' | 'file'; id: string } | null;
  selectedDataRoomId: string | null;
}

const initialState: UIState = {
  selectedItem: null,
  selectedDataRoomId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<{ type: 'folder' | 'file'; id: string } | null>) => {
      state.selectedItem = action.payload;
    },
    setSelectedDataRoomId: (state, action: PayloadAction<string | null>) => {
      state.selectedDataRoomId = action.payload;
    },
  },
});

export const { 
  setSelectedItem, 
  setSelectedDataRoomId,
} = uiSlice.actions;
export default uiSlice.reducer;

