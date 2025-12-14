import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { deleteDataRoom } from '@/store/dataroomSlice';
import { setDeleteDataRoomDialogOpen, setSelectedDataRoomId } from '@/store/uiSlice';
import { useNavigate } from 'react-router-dom';
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
import { useState } from 'react';
import { Spinner } from '../ui/spinner';

export const DeleteDataRoomDialog = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDeleteDataRoomDialogOpen, selectedDataRoomId } = useAppSelector((state) => state.ui);
  const { dataRooms, activeDataRoomId } = useAppSelector((state) => state.dataroom);
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const dataRoom = selectedDataRoomId 
    ? dataRooms.find((dr) => dr.id === selectedDataRoomId)
    : null;

  const handleDelete = async () => {
    if (!selectedDataRoomId || deleting) {
      return;
    }

    setDeleting(true);
    try {
      await dispatch(deleteDataRoom(selectedDataRoomId)).unwrap();
      dispatch(setDeleteDataRoomDialogOpen(false));
      dispatch(setSelectedDataRoomId(null));
      toast({
        title: 'Data room deleted',
        description: 'The data room and all its contents have been permanently deleted',
      });
      if (activeDataRoomId === selectedDataRoomId) {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete data room',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog 
      open={isDeleteDataRoomDialogOpen} 
      onOpenChange={(open) => {
        dispatch(setDeleteDataRoomDialogOpen(open));
        if (!open) {
          dispatch(setSelectedDataRoomId(null));
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
              <DialogTitle>Delete Data Room</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to delete <strong>&quot;{dataRoom?.name}&quot;</strong>?
          </p>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium text-destructive mb-2">
              ⚠️ Warning: This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All folders and subfolders</li>
              <li>All files and documents</li>
              <li>All data associated with this room</li>
            </ul>
            <p className="text-sm font-medium text-destructive mt-3">
              This action cannot be undone!
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              dispatch(setDeleteDataRoomDialogOpen(false));
              dispatch(setSelectedDataRoomId(null));
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

