import type { DataRoom, Folder, File } from '@/types';

const DB_NAME = 'DataRoomDB';
const DB_VERSION = 2;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('dataRooms')) {
        const dataRoomsStore = db.createObjectStore('dataRooms', { keyPath: 'id' });
        dataRoomsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('folders')) {
        const foldersStore = db.createObjectStore('folders', { keyPath: 'id' });
        foldersStore.createIndex('parentId', 'parentId', { unique: false });
        foldersStore.createIndex('dataRoomId', 'dataRoomId', { unique: false });
      }
      if (!db.objectStoreNames.contains('files')) {
        const filesStore = db.createObjectStore('files', { keyPath: 'id' });
        filesStore.createIndex('folderId', 'folderId', { unique: false });
        filesStore.createIndex('dataRoomId', 'dataRoomId', { unique: false });
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
    };
  });
};

export const db = {
  async getAllDataRooms(): Promise<DataRoom[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['dataRooms'], 'readonly');
      const store = transaction.objectStore('dataRooms');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result.map((item: DataRoom) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        resolve(data);
      };
    });
  },

  async createDataRoom(dataRoom: DataRoom): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['dataRooms'], 'readwrite');
      const store = transaction.objectStore('dataRooms');
      const request = store.add(dataRoom);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async updateDataRoom(dataRoom: DataRoom): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['dataRooms'], 'readwrite');
      const store = transaction.objectStore('dataRooms');
      const request = store.put(dataRoom);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async deleteDataRoom(id: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['dataRooms', 'folders', 'files'], 'readwrite');
      
      const foldersStore = transaction.objectStore('folders');
      const foldersIndex = foldersStore.index('dataRoomId');
      const foldersRequest = foldersIndex.getAll(id);
      foldersRequest.onsuccess = () => {
        foldersRequest.result.forEach((folder: Folder) => {
          foldersStore.delete(folder.id);
        });
      };

      const filesStore = transaction.objectStore('files');
      const filesIndex = filesStore.index('dataRoomId');
      const filesRequest = filesIndex.getAll(id);
      filesRequest.onsuccess = () => {
        filesRequest.result.forEach((file: File) => {
          filesStore.delete(file.id);
        });
      };

      const dataRoomsStore = transaction.objectStore('dataRooms');
      const request = dataRoomsStore.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async getAllFolders(dataRoomId?: string): Promise<Folder[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['folders'], 'readonly');
      const store = transaction.objectStore('folders');
      const index = store.index('dataRoomId');
      const request = dataRoomId ? index.getAll(dataRoomId) : store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result.map((item: Folder) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        resolve(data);
      };
    });
  },

  async getFoldersByParent(parentId: string | null): Promise<Folder[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['folders'], 'readonly');
      const store = transaction.objectStore('folders');
      const index = store.index('parentId');
      const request = index.getAll(parentId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result.map((item: Folder) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        resolve(data);
      };
    });
  },

  async createFolder(folder: Folder): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['folders'], 'readwrite');
      const store = transaction.objectStore('folders');
      const request = store.add(folder);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async updateFolder(folder: Folder): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['folders'], 'readwrite');
      const store = transaction.objectStore('folders');
      const request = store.put(folder);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async deleteFolder(id: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['folders'], 'readwrite');
      const store = transaction.objectStore('folders');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async getAllFiles(dataRoomId?: string): Promise<File[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const index = store.index('dataRoomId');
      const request = dataRoomId ? index.getAll(dataRoomId) : store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result.map((item: File) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        resolve(data);
      };
    });
  },

  async getFilesByFolder(folderId: string | null): Promise<File[]> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const index = store.index('folderId');
      const request = index.getAll(folderId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const data = request.result.map((item: File) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        resolve(data);
      };
    });
  },

  async createFile(file: File): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.add(file);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async updateFile(file: File): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.put(file);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async deleteFile(id: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async getFileById(id: string): Promise<File | null> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          const data = {
            ...request.result,
            createdAt: new Date(request.result.createdAt),
            updatedAt: new Date(request.result.updatedAt),
          };
          resolve(data);
        } else {
          resolve(null);
        }
      };
    });
  },

  async getMetadata(key: string): Promise<string | null> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };
    });
  },

  async setMetadata(key: string, value: string): Promise<void> {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key, value });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },
};

