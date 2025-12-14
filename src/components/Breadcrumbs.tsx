import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { ChevronRight, Database, MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { setCurrentFolder } from '@/store/folderSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Breadcrumbs = () => {
  const dispatch = useAppDispatch();
  const { folders, currentFolderId } = useAppSelector((state) => state.folder);
  const { activeDataRoomId, dataRooms } = useAppSelector((state) => state.dataroom);

  const buildPath = () => {
    if (!currentFolderId) {
      return [];
    }

    const path: typeof folders = [];
    let current = folders.find((f) => f.id === currentFolderId);

    while (current) {
      path.unshift(current);
      current = current?.parentId ? folders.find((f) => f.id === current?.parentId) : undefined;
    }

    return path;
  };

  const path = buildPath();
  const activeRoom = dataRooms.find((r) => r.id === activeDataRoomId);
  const companyName = activeRoom?.name || 'Company 1';

  const handleNavigate = (folderId: string | null) => {
    dispatch(setCurrentFolder(folderId));
  };

  if (!activeDataRoomId) {
    return null;
  }

  const shouldCollapse = path.length > 2;
  const visibleFolders = shouldCollapse ? path.slice(-2) : path;
  const hiddenFolders = shouldCollapse ? path.slice(0, -2) : [];

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Button variant="ghost" size="sm" onClick={() => handleNavigate(null)} className="h-8 gap-1">
        <Database className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate max-w-[200px]" title={companyName}>
          {companyName}
        </span>
      </Button>
      
      {shouldCollapse && hiddenFolders.length > 0 && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {hiddenFolders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => handleNavigate(folder.id)}
                  className="max-w-[300px]"
                >
                  <span className="truncate" title={folder.name}>
                    {folder.name}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {visibleFolders.map((folder) => (
        <div key={folder.id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate(folder.id)}
            className="h-8 text-sm font-normal"
          >
            <span className="truncate max-w-[200px]" title={folder.name}>
              {folder.name}
            </span>
          </Button>
        </div>
      ))}
    </div>
  );
};

