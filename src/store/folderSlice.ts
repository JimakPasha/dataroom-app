import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Folder } from '@/types';
import { db } from '@/lib/db';
import { mockApiCall } from '@/lib/api-mock';

interface FolderState {
  folders: Folder[];
  currentFolderId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: FolderState = {
  folders: [],
  currentFolderId: null,
  loading: false,
  error: null,
};

export const fetchFolders = createAsyncThunk(
  'folder/fetchAll',
  async (dataRoomId: string) => {
    return await mockApiCall(
      () => db.getAllFolders(dataRoomId),
      {
        minDelay: 300,
        maxDelay: 800,
      }
    );
  }
);

export const createFolder = createAsyncThunk(
  'folder/create',
  async ({ name, parentId, dataRoomId }: { name: string; parentId: string | null; dataRoomId: string }) => {
    return await mockApiCall(
      async () => {
        const newFolder: Folder = {
          id: crypto.randomUUID(),
          name,
          parentId,
          dataRoomId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.createFolder(newFolder);
        return newFolder;
      },
      {
        minDelay: 400,
        maxDelay: 900,
      }
    );
  }
);

export const updateFolder = createAsyncThunk(
  'folder/update',
  async (folder: Folder) => {
    return await mockApiCall(
      async () => {
        const updatedFolder = { ...folder, updatedAt: new Date() };
        await db.updateFolder(updatedFolder);
        return updatedFolder;
      },
      {
        minDelay: 300,
        maxDelay: 800,
      }
    );
  }
);

export const deleteFolder = createAsyncThunk(
  'folder/delete',
  async (id: string) => {
    return await mockApiCall(
      async () => {
        await db.deleteFolder(id);
        return id;
      },
      {
        minDelay: 500,
        maxDelay: 1000,
      }
    );
  }
);

const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<string | null>) => {
      state.currentFolderId = action.payload;
    },
    clearFolders: (state) => {
      state.folders = [];
      state.currentFolderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false;
        state.folders = action.payload;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch folders';
      })
      .addCase(createFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.loading = false;
        state.folders.push(action.payload);
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create folder';
      })
      .addCase(updateFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.folders.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.folders[index] = action.payload;
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update folder';
      })
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.loading = false;
        const deleteRecursive = (folderId: string) => {
          state.folders = state.folders.filter((f) => f.id !== folderId);
          const children = state.folders.filter((f) => f.parentId === folderId);
          children.forEach((child) => deleteRecursive(child.id));
        };
        deleteRecursive(action.payload);
        if (state.currentFolderId === action.payload) {
          state.currentFolderId = null;
        }
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete folder';
      });
  },
});

export const { setCurrentFolder, clearFolders } = folderSlice.actions;
export default folderSlice.reducer;

