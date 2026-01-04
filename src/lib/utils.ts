import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FileType } from '@/types';
import { FileText, FileSpreadsheet, File } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const generateUniqueName = (name: string, existingNames: string[]): string => {
  if (!existingNames.includes(name)) {
    return name;
  }
  
  const extensionMatch = name.match(/\.([^.]+)$/);
  const extension = extensionMatch ? extensionMatch[0] : '';
  const baseName = extension ? name.slice(0, -extension.length) : name;
  
  let counter = 1;
  let newName = `${baseName} (${counter})${extension}`;
  while (existingNames.includes(newName)) {
    counter++;
    newName = `${baseName} (${counter})${extension}`;
  }
  return newName;
};

export const sanitizeFileName = (name: string): string => {
  return name.replace(/[<>:"/\\|?*]/g, '').trim();
};

export interface FileIconInfo {
  Icon: LucideIcon;
  color: string;
}

export const getFileIcon = (fileType: FileType): FileIconInfo => {
  switch (fileType) {
    case 'application/pdf':
      return { Icon: FileText, color: 'text-red-500' };
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return { Icon: FileText, color: 'text-blue-500' };
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return { Icon: FileSpreadsheet, color: 'text-green-500' };
    case 'text/plain':
      return { Icon: FileText, color: 'text-gray-500' };
    case 'text/csv':
    case 'application/csv':
      return { Icon: FileSpreadsheet, color: 'text-blue-600' };
    default:
      return { Icon: File, color: 'text-gray-500' };
  }
};

export interface PathItem {
  id: string;
  name: string;
}

export const buildFolderPath = (
  folderId: string | null,
  folders: Array<{ id: string; name: string; parentId: string | null }>
): PathItem[] => {
  if (!folderId) {
    return [];
  }

  const path: PathItem[] = [];
  let current = folders.find((f) => f.id === folderId);

  while (current) {
    path.unshift({ id: current.id, name: current.name });
    current = current?.parentId ? folders.find((f) => f.id === current?.parentId) : undefined;
  }

  return path;
};

export const buildFilePath = (
  folderId: string | null,
  folders: Array<{ id: string; name: string; parentId: string | null }>
): PathItem[] => {
  return buildFolderPath(folderId, folders);
};

export const formatPath = (path: PathItem[], dataRoomName: string): string => {
  if (path.length === 0) {
    return dataRoomName;
  }
  return `${dataRoomName} / ${path.map((p) => p.name).join(' / ')}`;
};

interface FileSystemFileEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  file(callback: (file: File) => void): void;
}

interface FileSystemDirectoryEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  createReader(): FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
  readEntries(callback: (entries: (FileSystemFileEntry | FileSystemDirectoryEntry)[]) => void): void;
}

type DataTransferItemWithFileSystem = DataTransferItem & {
  webkitGetAsEntry?: () => FileSystemFileEntry | FileSystemDirectoryEntry | null;
  getAsFileSystemHandle?: () => FileSystemFileEntry | FileSystemDirectoryEntry | null;
}

export interface ProcessedFile {
  file: File;
  relativePath: string;
  folderPath: string[];
}

export interface ProcessedFolder {
  name: string;
  folderPath: string[];
}

export const processDirectoryEntry = async (
  entry: FileSystemDirectoryEntry,
  basePath: string[] = []
): Promise<{ files: ProcessedFile[]; folders: ProcessedFolder[] }> => {
  const files: ProcessedFile[] = [];
  const folders: ProcessedFolder[] = [];
  const currentPath = [...basePath, entry.name];

  folders.push({
    name: entry.name,
    folderPath: basePath,
  });

  return new Promise((resolve, reject) => {
    const reader = entry.createReader();
    const entries: (FileSystemFileEntry | FileSystemDirectoryEntry)[] = [];

    const readEntries = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          Promise.all(
            entries.map(async (entry) => {
              if (entry.isDirectory) {
                const result = await processDirectoryEntry(entry as FileSystemDirectoryEntry, currentPath);
                folders.push(...result.folders);
                files.push(...result.files);
              } else if (entry.isFile) {
                return new Promise<void>((resolveFile) => {
                  (entry as FileSystemFileEntry).file((file) => {
                    files.push({
                      file,
                      relativePath: entry.fullPath,
                      folderPath: currentPath,
                    });
                    resolveFile();
                  });
                });
              }
            })
          )
            .then(() => {
              resolve({ files, folders });
            })
            .catch(reject);
        } else {
          entries.push(...batch);
          readEntries();
        }
      });
    };

    readEntries();
  });
};

export const processDataTransferItems = async (
  items: DataTransferItemList
): Promise<{ files: ProcessedFile[]; folders: ProcessedFolder[]; plainFiles: File[] }> => {
  const processedFiles: ProcessedFile[] = [];
  const processedFolders: ProcessedFolder[] = [];
  const plainFiles: File[] = [];

  const processPromises: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as DataTransferItemWithFileSystem;

    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry?.() || item.getAsFileSystemHandle?.();

      if (entry) {
        if (entry.isDirectory) {
          processPromises.push(
            processDirectoryEntry(entry as FileSystemDirectoryEntry).then((result) => {
              processedFiles.push(...result.files);
              processedFolders.push(...result.folders);
            })
          );
        } else if (entry.isFile) {
          processPromises.push(
            new Promise<void>((resolve) => {
              (entry as FileSystemFileEntry).file((file) => {
                plainFiles.push(file);
                resolve();
              });
            })
          );
        }
      } else {
        const file = item.getAsFile();
        if (file) {
          plainFiles.push(file);
        }
      }
    }
  }

  await Promise.all(processPromises);

  return {
    files: processedFiles,
    folders: processedFolders,
    plainFiles,
  };
};

