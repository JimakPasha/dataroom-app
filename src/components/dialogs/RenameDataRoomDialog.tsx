import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateDataRoom } from '@/store/dataroomSlice';
import { setSelectedDataRoomId } from '@/store/uiSlice';
import { useDialog } from '@/contexts/DialogContext';
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

export const RenameDataRoomDialog = () => {
  const dispatch = useAppDispatch();
  const { isRenameDataRoomDialogOpen, closeRenameDataRoomDialog } = useDialog();
  const { selectedDataRoomId } = useAppSelector((state) => state.ui);
  const { dataRooms } = useAppSelector((state) => state.dataroom);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const dataRoom = selectedDataRoomId 
    ? dataRooms.find((dr) => dr.id === selectedDataRoomId)
    : null;

  
  const currentName = dataRoom?.name ?? '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!dataRoom || !selectedDataRoomId) {
      return;
    }

    // Get value from form
    const formData = new FormData(e.currentTarget);
    const inputValue = formData.get('name') as string || currentName;
    const sanitizedName = sanitizeFileName(inputValue);
    const validation = validateFolderName(sanitizedName);

    if (!validation.valid) {
      toast({
        title: 'Validation error',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    const otherRooms = dataRooms.filter((dr) => dr.id !== selectedDataRoomId);
    const existingNames = otherRooms.map((dr) => dr.name);
    const uniqueName = generateUniqueName(sanitizedName, existingNames);

    setLoading(true);
    try {
      await dispatch(updateDataRoom({ ...dataRoom, name: uniqueName })).unwrap();
      closeRenameDataRoomDialog();
      dispatch(setSelectedDataRoomId(null));
      toast({
        title: 'Data room renamed',
        description: `Data room has been renamed to ${uniqueName}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rename data room',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={isRenameDataRoomDialogOpen} 
      onOpenChange={(open) => {
        if (!open) {
          closeRenameDataRoomDialog();
          dispatch(setSelectedDataRoomId(null));
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Data Room</DialogTitle>
          <DialogDescription>Enter a new name for this data room</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input
              name="name"
              placeholder="Data room name"
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
                closeRenameDataRoomDialog();
                dispatch(setSelectedDataRoomId(null));
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

