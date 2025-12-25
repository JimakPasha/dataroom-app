import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateFolder } from '@/store/folderSlice';
import { updateFile } from '@/store/fileSlice';
import { setRenameDialogOpen, setSelectedItem } from '@/store/uiSlice';
import { validateFolderName, validateFileName } from '@/lib/validators';
import { generateUniqueName, sanitizeFileName } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '../ui/spinner';

export const RenameDialog = () => {
  const dispatch = useAppDispatch();
  const { isRenameDialogOpen, selectedItem } = useAppSelector((state) => state.ui);
  const { folders } = useAppSelector((state) => state.folder);
  const { files } = useAppSelector((state) => state.file);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const folder = selectedItem?.type === 'folder' 
    ? folders.find((f) => f.id === selectedItem.id) 
    : null;
  const file = selectedItem?.type === 'file' 
    ? files.find((f) => f.id === selectedItem.id) 
    : null;
  const item = folder || file;

  
  const currentName = item?.name ?? '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedItem) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const inputValue = formData.get('name') as string || currentName;
    const sanitizedName = sanitizeFileName(inputValue);

    if (selectedItem.type === 'folder' && folder) {
      const validation = validateFolderName(sanitizedName);
      if (!validation.valid) {
        toast({
          title: 'Validation error',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      const currentFolders = folders.filter(
        (f) => f.parentId === folder.parentId && f.dataRoomId === folder.dataRoomId && f.id !== folder.id
      );
      const existingNames = currentFolders.map((f) => f.name);
      const uniqueName = generateUniqueName(sanitizedName, existingNames);

      setLoading(true);
      try {
        await dispatch(updateFolder({ ...folder, name: uniqueName })).unwrap();
        dispatch(setRenameDialogOpen(false));
        dispatch(setSelectedItem(null));
        toast({
          title: 'Folder renamed',
          description: `Folder has been renamed to ${uniqueName}`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to rename folder',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else if (selectedItem.type === 'file' && file) {
      const validation = validateFileName(sanitizedName);
      if (!validation.valid) {
        toast({
          title: 'Validation error',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      const currentFiles = files.filter(
        (f) => f.folderId === file.folderId && f.dataRoomId === file.dataRoomId && f.id !== file.id
      );
      const existingNames = currentFiles.map((f) => f.name);
      const uniqueName = generateUniqueName(sanitizedName, existingNames);

      setLoading(true);
      try {
        await dispatch(updateFile({ ...file, name: uniqueName })).unwrap();
        dispatch(setRenameDialogOpen(false));
        dispatch(setSelectedItem(null));
        toast({
          title: 'File renamed',
          description: `File has been renamed to ${uniqueName}`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to rename file',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog 
      open={isRenameDialogOpen} 
      onOpenChange={(open) => {
        dispatch(setRenameDialogOpen(open));
        if (!open) {
          dispatch(setSelectedItem(null));
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {selectedItem?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
          <DialogDescription>Enter a new name for this {selectedItem?.type === 'folder' ? 'folder' : 'file'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input
              name="name"
              placeholder={`${selectedItem?.type === 'folder' ? 'Folder' : 'File'} name`}
              defaultValue={currentName}
              autoFocus
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                dispatch(setRenameDialogOpen(false));
                dispatch(setSelectedItem(null));
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

