import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useDialog } from '@/contexts/DialogContext';
import { setCurrentFolder } from '@/store/folderSlice';
import { setViewingFile } from '@/store/fileSlice';
import { buildFolderPath, buildFilePath, formatPath, getFileIcon } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, File, Folder, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { File as FileType } from '@/types';

interface SearchResult {
  type: 'file' | 'folder';
  id: string;
  name: string;
  path: Array<{ id: string; name: string }>;
  file?: FileType;
}

export const SearchDialog = () => {
  const dispatch = useAppDispatch();
  const { isSearchDialogOpen, openSearchDialog, closeSearchDialog } = useDialog();
  const { folders } = useAppSelector((state) => state.folder);
  const { files } = useAppSelector((state) => state.file);
  const { activeDataRoomId, dataRooms } = useAppSelector((state) => state.dataroom);
  const [searchQuery, setSearchQuery] = useState('');

  const activeRoom = dataRooms.find((r) => r.id === activeDataRoomId);
  const dataRoomName = activeRoom?.name || 'Data Room';

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !activeDataRoomId) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    folders
      .filter((folder) => folder.dataRoomId === activeDataRoomId)
      .forEach((folder) => {
        if (folder.name.toLowerCase().includes(query)) {
          const path = buildFolderPath(folder.id, folders);
          results.push({
            type: 'folder',
            id: folder.id,
            name: folder.name,
            path,
          });
        }
      });

    files
      .filter((file) => file.dataRoomId === activeDataRoomId)
      .forEach((file) => {
        if (file.name.toLowerCase().includes(query)) {
          const path = buildFilePath(file.folderId, folders);
          results.push({
            type: 'file',
            id: file.id,
            name: file.name,
            path,
            file,
          });
        }
      });

    return results.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, folders, files, activeDataRoomId]);

  const handleNavigateToFolder = (folderId: string) => {
    dispatch(setCurrentFolder(folderId));
    closeSearchDialog();
    setSearchQuery('');
  };

  const handleOpenFile = (fileId: string) => {
    dispatch(setViewingFile(fileId));
    closeSearchDialog();
    setSearchQuery('');
  };

  const handleNavigateToPath = (path: Array<{ id: string; name: string }>) => {
    if (path.length > 0) {
      const lastFolderId = path[path.length - 1].id;
      handleNavigateToFolder(lastFolderId);
    } else {
      dispatch(setCurrentFolder(null));
      closeSearchDialog();
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    closeSearchDialog();
    setSearchQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isSearchDialogOpen) {
          openSearchDialog();
        }
      }
      if (e.key === 'Escape' && isSearchDialogOpen) {
        closeSearchDialog();
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchDialogOpen, openSearchDialog, closeSearchDialog]);

  return (
    <Dialog open={isSearchDialogOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Files and Folders</DialogTitle>
          <DialogDescription>
            Search for files and folders by name within the current data room. Press{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded border">Ctrl+K</kbd> to open search.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-auto border rounded-lg min-h-0">
            {!searchQuery.trim() ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>Enter a search query to find files and folders</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>No results found</p>
              </div>
            ) : (
              <div className="divide-y">
                {searchResults.map((result) => {
                  const isFolder = result.type === 'folder';
                  const Icon = isFolder ? Folder : File;
                  const iconColor = isFolder ? 'text-blue-500' : result.file ? getFileIcon(result.file.type).color : 'text-gray-500';
                  const fullPath = formatPath(result.path, dataRoomName);

                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={cn(
                        'p-4 hover:bg-accent transition-colors',
                        'flex items-start gap-3',
                        !isFolder && 'cursor-pointer'
                      )}
                      onClick={() => {
                        if (!isFolder) {
                          handleOpenFile(result.id);
                        }
                      }}
                    >
                      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium mb-1.5">{result.name}</div>
                        <div className="text-sm text-muted-foreground mb-1.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="truncate" title={fullPath}>{fullPath}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateToPath(result.path);
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Go to path
                          </Button>
                          {!isFolder && result.file && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.file.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
