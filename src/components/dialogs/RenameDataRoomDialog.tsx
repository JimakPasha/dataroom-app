import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateDataRoom } from '@/store/dataroomSlice';
import { setRenameDataRoomDialogOpen, setSelectedDataRoomId } from '@/store/uiSlice';
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
  const { isRenameDataRoomDialogOpen, selectedDataRoomId } = useAppSelector((state) => state.ui);
  const { dataRooms } = useAppSelector((state) => state.dataroom);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const dataRoom = selectedDataRoomId 
    ? dataRooms.find((dr) => dr.id === selectedDataRoomId)
    : null;

  useEffect(() => {
    if (dataRoom) {
      setName(dataRoom.name);
    }
  }, [dataRoom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataRoom || !selectedDataRoomId) {
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

    const otherRooms = dataRooms.filter((dr) => dr.id !== selectedDataRoomId);
    const existingNames = otherRooms.map((dr) => dr.name);
    const uniqueName = generateUniqueName(sanitizedName, existingNames);

    setLoading(true);
    try {
      await dispatch(updateDataRoom({ ...dataRoom, name: uniqueName })).unwrap();
      dispatch(setRenameDataRoomDialogOpen(false));
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
        dispatch(setRenameDataRoomDialogOpen(open));
        if (!open) {
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
              placeholder="Data room name"
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
              onClick={() => {
                dispatch(setRenameDataRoomDialogOpen(false));
                dispatch(setSelectedDataRoomId(null));
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
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

