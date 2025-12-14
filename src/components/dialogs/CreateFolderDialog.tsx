import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createFolder } from '@/store/folderSlice';
import { setCreateFolderDialogOpen } from '@/store/uiSlice';
import { validateFolderName } from '@/lib/validators';
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

export const CreateFolderDialog = () => {
  const dispatch = useAppDispatch();
  const { isCreateFolderDialogOpen } = useAppSelector((state) => state.ui);
  const { currentFolderId } = useAppSelector((state) => state.folder);
  const { activeDataRoomId } = useAppSelector((state) => state.dataroom);
  const { folders } = useAppSelector((state) => state.folder);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const currentFolders = folders.filter(
    (f) => f.parentId === currentFolderId && f.dataRoomId === activeDataRoomId
  );
  const existingNames = currentFolders.map((f) => f.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeDataRoomId) {
      return;
    }

    const sanitizedName = sanitizeFileName(name);
    const validation = validateFolderName(sanitizedName);

    if (!validation.valid) {
      toast({
        title: 'Validation error',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    const uniqueName = generateUniqueName(sanitizedName, existingNames);

    setLoading(true);
    try {
      await dispatch(
        createFolder({
          name: uniqueName,
          parentId: currentFolderId,
          dataRoomId: activeDataRoomId,
        })
      ).unwrap();
      dispatch(setCreateFolderDialogOpen(false));
      setName('');
      toast({
        title: 'Folder created',
        description: `${uniqueName} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isCreateFolderDialogOpen} onOpenChange={(open) => dispatch(setCreateFolderDialogOpen(open))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>Create a new folder to organize your files</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(setCreateFolderDialogOpen(false))}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};



