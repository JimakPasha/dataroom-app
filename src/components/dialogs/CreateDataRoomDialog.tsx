import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createDataRoom, setActiveDataRoom } from '@/store/dataroomSlice';
import { useDialog } from '@/contexts/DialogContext';
import { validateFolderName } from '@/lib/validators';
import { sanitizeFileName, generateUniqueName } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
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

export const CreateDataRoomDialog = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isCreateDataRoomDialogOpen, closeCreateDataRoomDialog } = useDialog();
  const { dataRooms } = useAppSelector((state) => state.dataroom);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const existingNames = dataRooms.map((dr) => dr.name);
    const uniqueName = generateUniqueName(sanitizedName, existingNames);

    setLoading(true);
    try {
      const result = await dispatch(createDataRoom(uniqueName)).unwrap();
      dispatch(setActiveDataRoom(result.id));
      closeCreateDataRoomDialog();
      setName('');
      toast({
        title: 'Data room created',
        description: `${uniqueName} has been created successfully`,
      });
      if (location.pathname === '/') {
        navigate(`/room/${result.id}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create data room',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isCreateDataRoomDialogOpen} onOpenChange={(open) => {
      if (!open) closeCreateDataRoomDialog();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Data Room</DialogTitle>
          <DialogDescription>Create a new data room to organize your documents</DialogDescription>
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
              onClick={closeCreateDataRoomDialog}
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

