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

