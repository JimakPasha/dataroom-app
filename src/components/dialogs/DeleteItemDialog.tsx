import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { deleteFile } from '@/store/fileSlice';
import { deleteFolder } from '@/store/folderSlice';
import { setSelectedItem } from '@/store/uiSlice';
import { useDialog } from '@/contexts/DialogContext';
import { useState } from 'react';
import { Spinner } from '../ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

export const DeleteItemDialog = () => {
  const dispatch = useAppDispatch();
  const { isDeleteItemDialogOpen, closeDeleteItemDialog } = useDialog();
  const { selectedItem } = useAppSelector((state) => state.ui);
  const { files } = useAppSelector((state) => state.file);
  const { folders } = useAppSelector((state) => state.folder);
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const item = selectedItem
    ? selectedItem.type === 'file'
      ? files.find((f) => f.id === selectedItem.id)
      : folders.find((f) => f.id === selectedItem.id)
    : null;

  const handleDelete = async () => {
    if (!selectedItem || deleting) {
      return;
    }

    setDeleting(true);
    try {
      if (selectedItem.type === 'file') {
        await dispatch(deleteFile(selectedItem.id)).unwrap();
        toast({
          title: 'File deleted',
          description: 'The file has been permanently deleted',
        });
      } else {
        await dispatch(deleteFolder(selectedItem.id)).unwrap();
        toast({
          title: 'Folder deleted',
          description: 'The folder and all its contents have been permanently deleted',
        });
      }
      closeDeleteItemDialog();
      dispatch(setSelectedItem(null));
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete ${selectedItem.type}`,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!item) {
    return null;
  }

  const isFolder = selectedItem?.type === 'folder';

  return (
    <Dialog 
      open={isDeleteItemDialogOpen} 
      onOpenChange={(open) => {
        if (!open) {
          closeDeleteItemDialog();
          dispatch(setSelectedItem(null));
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete {isFolder ? 'Folder' : 'File'}</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete <strong>&quot;{item.name}&quot;</strong>?
          </p>
          {isFolder && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive mb-2">
                ⚠️ Warning: This will permanently delete:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>All subfolders and nested folders</li>
                <li>All files within this folder</li>
                <li>All data associated with this folder</li>
              </ul>
              <p className="text-sm font-medium text-destructive mt-3">
                This action cannot be undone!
              </p>
            </div>
          )}
          {!isFolder && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium text-destructive">
                ⚠️ This file will be permanently deleted and cannot be recovered.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              closeDeleteItemDialog();
              dispatch(setSelectedItem(null));
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
