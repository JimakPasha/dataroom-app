import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setItemInfoDialogOpen } from '@/store/uiSlice';
import { formatFileSize, formatDate, cn, getFileIcon } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Folder } from 'lucide-react';

export const ItemInfoDialog = () => {
  const dispatch = useAppDispatch();
  const { isItemInfoDialogOpen, selectedItem } = useAppSelector((state) => state.ui);
  const { folders } = useAppSelector((state) => state.folder);
  const { files } = useAppSelector((state) => state.file);
  const { activeDataRoomId } = useAppSelector((state) => state.dataroom);

  if (!selectedItem) {
    return null;
  }

  const item = selectedItem.type === 'file' 
    ? files.find((f) => f.id === selectedItem.id)
    : folders.find((f) => f.id === selectedItem.id);

  if (!item) {
    return null;
  }

  const isFile = selectedItem.type === 'file';
  let Icon, iconColor;
  if (isFile) {
    const file = item as typeof files[0];
    const fileIconInfo = getFileIcon(file.type);
    Icon = fileIconInfo.Icon;
    iconColor = fileIconInfo.color;
  } else {
    Icon = Folder;
    iconColor = 'text-blue-500';
  }

  let fileCount = 0;
  let folderCount = 0;
  let totalSize = 0;

  if (!isFile) {
    const folder = item as typeof folders[0];
    const folderFiles = files.filter(
      (f) => f.folderId === folder.id && f.dataRoomId === activeDataRoomId
    );
    const folderFolders = folders.filter(
      (f) => f.parentId === folder.id && f.dataRoomId === activeDataRoomId
    );
    fileCount = folderFiles.length;
    folderCount = folderFolders.length;
    totalSize = folderFiles.reduce((sum, file) => sum + file.size, 0);
  } else {
    const file = item as typeof files[0];
    totalSize = file.size;
  }

  return (
    <Dialog open={isItemInfoDialogOpen} onOpenChange={(open) => dispatch(setItemInfoDialogOpen(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', iconColor)} />
            {isFile ? 'File Information' : 'Folder Information'}
          </DialogTitle>
          <DialogDescription>
            {isFile ? 'Details about the file' : 'Details about the folder'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm text-muted-foreground">{isFile ? 'File' : 'Folder'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Date Created:</span>
              <span className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Date Modified:</span>
              <span className="text-sm text-muted-foreground">{formatDate(item.updatedAt)}</span>
            </div>
            {isFile ? (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Size:</span>
                <span className="text-sm text-muted-foreground">{formatFileSize(totalSize)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Files:</span>
                  <span className="text-sm text-muted-foreground">{fileCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Folders:</span>
                  <span className="text-sm text-muted-foreground">{folderCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Size:</span>
                  <span className="text-sm text-muted-foreground">{formatFileSize(totalSize)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

