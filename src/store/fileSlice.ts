import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { File } from '@/types';
import { db } from '@/lib/db';
import { mockApiCall } from '@/lib/api-mock';

interface FileState {
  files: File[];
  viewingFileId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: FileState = {
  files: [],
  viewingFileId: null,
  loading: false,
  error: null,
};

export const fetchFiles = createAsyncThunk(
  'file/fetchAll',
  async (dataRoomId: string) => {
    return await mockApiCall(
      () => db.getAllFiles(dataRoomId),
      {
        minDelay: 300,
        maxDelay: 800,
      }
    );
  }
);

export const createFile = createAsyncThunk(
  'file/create',
  async ({ name, folderId, dataRoomId, type, size, content }: Omit<File, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await mockApiCall(
      async () => {
        const newFile: File = {
          id: crypto.randomUUID(),
          name,
          folderId,
          dataRoomId,
          type,
          size,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.createFile(newFile);
        return newFile;
      },
      {
        minDelay: 500,
        maxDelay: 1000,
      }
    );
  }
);

export const updateFile = createAsyncThunk(
  'file/update',
  async (file: File) => {
    return await mockApiCall(
      async () => {
        const updatedFile = { ...file, updatedAt: new Date() };
        await db.updateFile(updatedFile);
        return updatedFile;
      },
      {
        minDelay: 300,
        maxDelay: 800,
      }
    );
  }
);

export const deleteFile = createAsyncThunk(
  'file/delete',
  async (id: string) => {
    return await mockApiCall(
      async () => {
        await db.deleteFile(id);
        return id;
      },
      {
        minDelay: 400,
        maxDelay: 900,
      }
    );
  }
);

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setViewingFile: (state, action: PayloadAction<string | null>) => {
      state.viewingFileId = action.payload;
    },
    clearFiles: (state) => {
      state.files = [];
      state.viewingFileId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch files';
      })
      .addCase(createFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files.push(action.payload);
      })
      .addCase(createFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create file';
      })
      .addCase(updateFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFile.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.files.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.files[index] = action.payload;
        }
      })
      .addCase(updateFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update file';
      })
      .addCase(deleteFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.loading = false;
        state.files = state.files.filter((f) => f.id !== action.payload);
        if (state.viewingFileId === action.payload) {
          state.viewingFileId = null;
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete file';
      });
  },
});

export const { setViewingFile, clearFiles } = fileSlice.actions;
export default fileSlice.reducer;

