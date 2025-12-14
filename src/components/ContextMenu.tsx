import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { Edit, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/hooks/redux';
import { setSelectedItem, setRenameDialogOpen, setDeleteItemDialogOpen } from '@/store/uiSlice';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';

interface ContextMenuProps {
  type: 'folder' | 'file';
  id: string;
  children: React.ReactNode;
}

export const ContextMenu = ({ type, id, children }: ContextMenuProps) => {
  const dispatch = useAppDispatch();

  const handleRename = () => {
    dispatch(setSelectedItem({ type, id }));
    dispatch(setRenameDialogOpen(true));
  };

  const handleDelete = () => {
    dispatch(setSelectedItem({ type, id }));
    dispatch(setDeleteItemDialogOpen(true));
  };

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleRename}>
          <Edit className="h-4 w-4 mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuPrimitive.Root>
  );
};

