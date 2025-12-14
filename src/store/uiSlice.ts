import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isCreateFolderDialogOpen: boolean;
  isCreateDataRoomDialogOpen: boolean;
  isRenameDialogOpen: boolean;
  isRenameDataRoomDialogOpen: boolean;
  isDeleteDataRoomDialogOpen: boolean;
  isDeleteItemDialogOpen: boolean;
  isFolderInfoDialogOpen: boolean;
  isItemInfoDialogOpen: boolean;
  isSearchDialogOpen: boolean;
  selectedItem: { type: 'folder' | 'file'; id: string } | null;
  selectedDataRoomId: string | null;
}

const initialState: UIState = {
  isCreateFolderDialogOpen: false,
  isCreateDataRoomDialogOpen: false,
  isRenameDialogOpen: false,
  isRenameDataRoomDialogOpen: false,
  isDeleteDataRoomDialogOpen: false,
  isDeleteItemDialogOpen: false,
  isFolderInfoDialogOpen: false,
  isItemInfoDialogOpen: false,
  isSearchDialogOpen: false,
  selectedItem: null,
  selectedDataRoomId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCreateFolderDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateFolderDialogOpen = action.payload;
    },
    setCreateDataRoomDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateDataRoomDialogOpen = action.payload;
    },
    setRenameDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isRenameDialogOpen = action.payload;
    },
    setSelectedItem: (state, action: PayloadAction<{ type: 'folder' | 'file'; id: string } | null>) => {
      state.selectedItem = action.payload;
    },
    setFolderInfoDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isFolderInfoDialogOpen = action.payload;
    },
    setItemInfoDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isItemInfoDialogOpen = action.payload;
    },
    setRenameDataRoomDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isRenameDataRoomDialogOpen = action.payload;
    },
    setDeleteDataRoomDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeleteDataRoomDialogOpen = action.payload;
    },
    setDeleteItemDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeleteItemDialogOpen = action.payload;
    },
    setSelectedDataRoomId: (state, action: PayloadAction<string | null>) => {
      state.selectedDataRoomId = action.payload;
    },
    setSearchDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchDialogOpen = action.payload;
    },
  },
});

export const { 
  setCreateFolderDialogOpen, 
  setCreateDataRoomDialogOpen, 
  setRenameDialogOpen, 
  setRenameDataRoomDialogOpen,
  setDeleteDataRoomDialogOpen,
  setDeleteItemDialogOpen,
  setSelectedItem, 
  setSelectedDataRoomId,
  setFolderInfoDialogOpen, 
  setItemInfoDialogOpen,
  setSearchDialogOpen
} = uiSlice.actions;
export default uiSlice.reducer;

