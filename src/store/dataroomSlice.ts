import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { DataRoom } from '@/types';
import { db } from '@/lib/db';
import { mockApiCall } from '@/lib/api-mock';

interface DataRoomState {
  dataRooms: DataRoom[];
  activeDataRoomId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataRoomState = {
  dataRooms: [],
  activeDataRoomId: null,
  loading: false,
  error: null,
};

export const fetchDataRooms = createAsyncThunk('dataroom/fetchAll', async () => {
  return await mockApiCall(
    () => db.getAllDataRooms(),
    {
      minDelay: 300,
      maxDelay: 800,
    }
  );
});

export const createDataRoom = createAsyncThunk(
  'dataroom/create',
  async (name: string) => {
    return await mockApiCall(
      async () => {
        const newDataRoom: DataRoom = {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.createDataRoom(newDataRoom);
        return newDataRoom;
      },
      {
        minDelay: 400,
        maxDelay: 900,
      }
    );
  }
);

export const updateDataRoom = createAsyncThunk(
  'dataroom/update',
  async (dataRoom: DataRoom) => {
    return await mockApiCall(
      async () => {
        const updatedDataRoom = { ...dataRoom, updatedAt: new Date() };
        await db.updateDataRoom(updatedDataRoom);
        return updatedDataRoom;
      },
      {
        minDelay: 300,
        maxDelay: 800,
      }
    );
  }
);

export const deleteDataRoom = createAsyncThunk(
  'dataroom/delete',
  async (id: string) => {
    return await mockApiCall(
      async () => {
        await db.deleteDataRoom(id);
        return id;
      },
      {
        minDelay: 500,
        maxDelay: 1000,
      }
    );
  }
);

const dataroomSlice = createSlice({
  name: 'dataroom',
  initialState,
  reducers: {
    setActiveDataRoom: (state, action: PayloadAction<string | null>) => {
      state.activeDataRoomId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.dataRooms = action.payload;
      })
      .addCase(fetchDataRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data rooms';
      })
      .addCase(createDataRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDataRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.dataRooms.push(action.payload);
      })
      .addCase(createDataRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create data room';
      })
      .addCase(deleteDataRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDataRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.dataRooms = state.dataRooms.filter((dr) => dr.id !== action.payload);
        if (state.activeDataRoomId === action.payload) {
          state.activeDataRoomId = null;
        }
      })
      .addCase(deleteDataRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete data room';
      })
      .addCase(updateDataRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDataRoom.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.dataRooms.findIndex((dr) => dr.id === action.payload.id);
        if (index !== -1) {
          state.dataRooms[index] = action.payload;
        }
      })
      .addCase(updateDataRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update data room';
      });
  },
});

export const { setActiveDataRoom } = dataroomSlice.actions;
export default dataroomSlice.reducer;

