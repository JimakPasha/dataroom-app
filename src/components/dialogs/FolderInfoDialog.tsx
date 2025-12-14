import { useAppSelector } from '@/hooks/redux';
import { setFolderInfoDialogOpen } from '@/store/uiSlice';
import { useAppDispatch } from '@/hooks/redux';
import { formatFileSize, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Folder } from 'lucide-react';

export const FolderInfoDialog = () => {
  const dispatch = useAppDispatch();
  const { isFolderInfoDialogOpen } = useAppSelector((state) => state.ui);
  const { folders, currentFolderId } = useAppSelector((state) => state.folder);
  const { activeDataRoomId, dataRooms } = useAppSelector((state) => state.dataroom);
  const { files } = useAppSelector((state) => state.file);

  const currentFolder = currentFolderId ? folders.find((f) => f.id === currentFolderId) : null;
  const currentDataRoom = dataRooms.find((dr) => dr.id === activeDataRoomId);
  
  const currentFiles = files.filter(
    (f) => f.folderId === currentFolderId && f.dataRoomId === activeDataRoomId
  );
  const currentFolders = folders.filter(
    (f) => f.parentId === currentFolderId && f.dataRoomId === activeDataRoomId
  );

  const totalSize = currentFiles.reduce((sum, file) => sum + file.size, 0);
  const fileCount = currentFiles.length;
  const folderCount = currentFolders.length;

  if (!activeDataRoomId || !currentDataRoom) {
    return null;
  }

  const displayName = currentFolder ? currentFolder.name : currentDataRoom.name;
  const displayDate = currentFolder ? currentFolder.updatedAt : currentDataRoom.updatedAt;

  return (
    <Dialog open={isFolderInfoDialogOpen} onOpenChange={(open) => dispatch(setFolderInfoDialogOpen(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {currentFolder ? 'Folder Information' : 'Data Room Information'}
          </DialogTitle>
          <DialogDescription>
            {currentFolder ? 'Details about the current folder' : 'Details about the current data room'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm text-muted-foreground">{displayName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Date Modified:</span>
              <span className="text-sm text-muted-foreground">{formatDate(displayDate)}</span>
            </div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

