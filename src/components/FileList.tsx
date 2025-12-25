import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setViewingFile } from '@/store/fileSlice';
import { setSelectedItem } from '@/store/uiSlice';
import { useDialog } from '@/contexts/DialogContext';
import { setCurrentFolder } from '@/store/folderSlice';
import { setSortBy, setSortDirection } from '@/store/settingsSlice';
import { File as FileIcon, Folder as FolderIcon, MoreVertical, Trash2, Edit, Info, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { formatFileSize, formatDate, getFileIcon } from '@/lib/utils';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';
import { Button } from './ui/button';
import { useState, useMemo, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import type { File } from '@/types';
import type { Folder } from '@/types';

interface FileListProps {
  frozenFiles?: File[];
  frozenFolders?: Folder[];
}

export const FileList = ({ frozenFiles, frozenFolders }: FileListProps = {}) => {
  const dispatch = useAppDispatch();
  const { openRenameDialog, openDeleteItemDialog, openItemInfoDialog } = useDialog();
  const { files } = useAppSelector((state) => state.file);
  const { folders, currentFolderId } = useAppSelector((state) => state.folder);
  const { activeDataRoomId } = useAppSelector((state) => state.dataroom);
  const { layoutMode, sortBy, sortDirection, foldersPosition } = useAppSelector((state) => state.settings);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [hoveredItemType, setHoveredItemType] = useState<'file' | 'folder' | null>(null);
  const contextMenuClickedRef = useRef<string | null>(null);

  const currentFiles = frozenFiles ?? files.filter(
    (f) => f.folderId === currentFolderId && f.dataRoomId === activeDataRoomId
  );

  const currentFolders = frozenFolders ?? folders.filter(
    (f) => f.parentId === currentFolderId && f.dataRoomId === activeDataRoomId
  );

  const sortedFolders = useMemo(() => {
    const sorted = [...currentFolders].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'dateModified') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      if (sortDirection === 'desc') {
        comparison = -comparison;
      }

      return comparison;
    });

    return sorted;
  }, [currentFolders, sortBy, sortDirection]);

  const sortedFiles = useMemo(() => {
    const sorted = [...currentFiles].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'dateModified') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      if (sortDirection === 'desc') {
        comparison = -comparison;
      }

      return comparison;
    });

    return sorted;
  }, [currentFiles, sortBy, sortDirection]);

  const sortedAllItems = useMemo(() => {
    if (foldersPosition === 'top') {
      return { folders: sortedFolders, files: sortedFiles };
    }
    
    const all = [
      ...sortedFolders.map((f) => ({ item: f, type: 'folder' as const })),
      ...sortedFiles.map((f) => ({ item: f, type: 'file' as const })),
    ].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.item.name.localeCompare(b.item.name);
      } else if (sortBy === 'dateModified') {
        comparison = new Date(a.item.updatedAt).getTime() - new Date(b.item.updatedAt).getTime();
      }
      if (sortDirection === 'desc') {
        comparison = -comparison;
      }
      return comparison;
    });

    return { all };
  }, [sortedFolders, sortedFiles, foldersPosition, sortBy, sortDirection]);

  const handleFileClick = (fileId: string) => {
    dispatch(setViewingFile(fileId));
  };

  const handleFolderClick = useCallback((folderId: string) => {
    dispatch(setCurrentFolder(folderId));
  }, [dispatch]);

  const handleRename = (id: string, type: 'file' | 'folder', e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedItem({ type, id }));
    openRenameDialog();
  };

  const handleDelete = (id: string, type: 'file' | 'folder', e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedItem({ type, id }));
    openDeleteItemDialog();
  };

  const handleDownload = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const file = files.find((f) => f.id === fileId);
      if (!file) return;

      const fileData = await db.getFileById(fileId);
      if (fileData) {
        const blob = new Blob([fileData.content], { type: file.type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleInfo = (id: string, type: 'file' | 'folder', e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedItem({ type, id }));
    openItemInfoDialog();
  };

  if (!activeDataRoomId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a data room to view files
      </div>
    );
  }

  if (currentFiles.length === 0 && currentFolders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <FileIcon className="h-12 w-12 opacity-50" />
        <p>No files or folders in this directory</p>
      </div>
    );
  }

  const renderGridItem = (
    item: (typeof currentFolders)[0] | (typeof currentFiles)[0],
    type: 'folder' | 'file'
  ) => {
    const isFolder = type === 'folder';
    const isHovered = hoveredItemId === item.id && hoveredItemType === type;
    let Icon, iconColor;
    if (isFolder) {
      Icon = FolderIcon;
      iconColor = 'text-blue-500';
    } else {
      const fileIconInfo = getFileIcon((item as typeof currentFiles[0]).type);
      Icon = fileIconInfo.Icon;
      iconColor = fileIconInfo.color;
    }
    const itemId = item.id;
    const handleClick = isFolder 
      ? () => handleFolderClick(itemId)
      : () => handleFileClick(itemId);

    const itemKey = `${type}-${item.id}`;

    return (
      <ContextMenu
        key={itemKey}
        onOpenChange={(open) => {
          if (open) {
            contextMenuClickedRef.current = itemKey;
          } else {
            setTimeout(() => {
              if (contextMenuClickedRef.current === itemKey) {
                contextMenuClickedRef.current = null;
              }
            }, 200);
          }
        }}
      >
        <ContextMenuTrigger asChild>
          <Card
            className="p-4 cursor-pointer hover:shadow-md transition-shadow relative group"
            onMouseEnter={() => {
              setHoveredItemId(item.id);
              setHoveredItemType(type);
            }}
            onMouseLeave={() => {
              setHoveredItemId(null);
              setHoveredItemType(null);
            }}
            onMouseDown={(e) => {
              if (contextMenuClickedRef.current === itemKey) {
                contextMenuClickedRef.current = null;
                return;
              }
              const target = e.target as HTMLElement;
              if (target.closest('[role="menu"]') || target.closest('[data-radix-popper-content-wrapper]')) {
                return;
              }
              if (e.button === 0) {
                handleClick();
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Icon className={cn('h-8 w-8 flex-shrink-0', iconColor)} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate" title={item.name}>
                    {item.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(item.createdAt)}</p>
                  {!isFolder && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatFileSize((item as (typeof currentFiles)[0]).size)}
                    </p>
                  )}
                </div>
              </div>
              <div className="relative z-10" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-8 w-8',
                        isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                        'transition-opacity'
                      )}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        setHoveredItemId(item.id);
                        setHoveredItemType(type);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(item.id, type, e);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id, type, e);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                    {type === 'file' && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item.id, e);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInfo(item.id, type, e);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      {type === 'file' ? 'File Information' : 'Folder Information'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent
          onPointerDown={(e) => {
            e.stopPropagation();
            contextMenuClickedRef.current = itemKey;
          }}
          onClick={(e) => {
            e.stopPropagation();
            contextMenuClickedRef.current = itemKey;
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <ContextMenuItem
            onMouseDown={(e) => {
              e.stopPropagation();
              contextMenuClickedRef.current = itemKey;
            }}
            onClick={(e) => {
              contextMenuClickedRef.current = itemKey;
              handleRename(item.id, type, e);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            onMouseDown={(e) => {
              e.stopPropagation();
              contextMenuClickedRef.current = itemKey;
            }}
            onClick={(e) => {
              contextMenuClickedRef.current = itemKey;
              handleDelete(item.id, type, e);
            }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
          {type === 'file' && (
            <ContextMenuItem
              onMouseDown={(e) => {
                e.stopPropagation();
                contextMenuClickedRef.current = itemKey;
              }}
              onClick={(e) => {
                contextMenuClickedRef.current = itemKey;
                handleDownload(item.id, e);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </ContextMenuItem>
          )}
          <ContextMenuItem
            onMouseDown={(e) => {
              e.stopPropagation();
              contextMenuClickedRef.current = itemKey;
            }}
            onClick={(e) => {
              contextMenuClickedRef.current = itemKey;
              handleInfo(item.id, type, e);
            }}
          >
            <Info className="h-4 w-4 mr-2" />
            {type === 'file' ? 'File Information' : 'Folder Information'}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderListItem = (
    item: (typeof currentFolders)[0] | (typeof currentFiles)[0],
    type: 'folder' | 'file'
  ) => {
    const isFolder = type === 'folder';
    let Icon, iconColor;
    if (isFolder) {
      Icon = FolderIcon;
      iconColor = 'text-blue-500';
    } else {
      const fileIconInfo = getFileIcon((item as typeof currentFiles[0]).type);
      Icon = fileIconInfo.Icon;
      iconColor = fileIconInfo.color;
    }
    const itemId = item.id;
    const handleClick = isFolder 
      ? () => handleFolderClick(itemId)
      : () => handleFileClick(itemId);
    const fileSize = isFolder ? '—' : formatFileSize((item as typeof currentFiles[0]).size);

    const itemKey = `${type}-${item.id}`;

    return (
      <ContextMenu 
        key={itemKey}
        onOpenChange={(open) => {
          if (open) {
            contextMenuClickedRef.current = itemKey;
          } else {
            setTimeout(() => {
              if (contextMenuClickedRef.current === itemKey) {
                contextMenuClickedRef.current = null;
              }
            }, 200);
          }
        }}
      >
        <ContextMenuTrigger asChild>
          <div
            className="px-4 py-3 cursor-pointer hover:bg-accent transition-colors group grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center"
            onMouseEnter={() => {
              setHoveredItemId(item.id);
              setHoveredItemType(type);
            }}
            onMouseLeave={() => {
              setHoveredItemId(null);
              setHoveredItemType(null);
            }}
            onMouseDown={(e) => {
              if (contextMenuClickedRef.current === itemKey) {
                contextMenuClickedRef.current = null;
                return;
              }
              const target = e.target as HTMLElement;
              if (target.closest('[role="menu"]') || target.closest('[data-radix-popper-content-wrapper]')) {
                return;
              }
              if (e.button === 0) {
                handleClick();
              }
            }}
          >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={cn('h-5 w-5 flex-shrink-0', iconColor)} />
          <h3 className="font-medium truncate" title={item.name}>
            {item.name}
          </h3>
        </div>
        <div className="text-sm text-muted-foreground text-right hidden md:block">
          {formatDate(item.updatedAt)}
        </div>
        <div className="text-sm text-muted-foreground text-right hidden md:block w-32">
          {fileSize}
        </div>
        <div className="flex justify-end w-12" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setHoveredItemId(item.id);
                  setHoveredItemType(type);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              onCloseAutoFocus={(e) => e.preventDefault()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename(item.id, type, e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id, type, e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              {type === 'file' && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item.id, e);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleInfo(item.id, type, e);
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Info className="h-4 w-4 mr-2" />
                {type === 'file' ? 'File Information' : 'Folder Information'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </ContextMenuTrigger>
      <ContextMenuContent 
        onPointerDown={(e) => {
          e.stopPropagation();
          contextMenuClickedRef.current = itemKey;
        }}
        onClick={(e) => {
          e.stopPropagation();
          contextMenuClickedRef.current = itemKey;
        }}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <ContextMenuItem 
          onMouseDown={(e) => {
            e.stopPropagation();
            contextMenuClickedRef.current = itemKey;
          }}
          onClick={(e) => {
            contextMenuClickedRef.current = itemKey;
            handleRename(item.id, type, e);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem 
          onMouseDown={(e) => {
            e.stopPropagation();
            contextMenuClickedRef.current = itemKey;
          }}
          onClick={(e) => {
            contextMenuClickedRef.current = itemKey;
            handleDelete(item.id, type, e);
          }} 
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
        {type === 'file' && (
          <ContextMenuItem 
            onMouseDown={(e) => {
              e.stopPropagation();
              contextMenuClickedRef.current = itemKey;
            }}
            onClick={(e) => {
              contextMenuClickedRef.current = itemKey;
              handleDownload(item.id, e);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </ContextMenuItem>
        )}
        <ContextMenuItem 
          onMouseDown={(e) => {
            e.stopPropagation();
            contextMenuClickedRef.current = itemKey;
          }}
          onClick={(e) => {
            contextMenuClickedRef.current = itemKey;
            handleInfo(item.id, type, e);
          }}
        >
          <Info className="h-4 w-4 mr-2" />
          {type === 'file' ? 'File Information' : 'Folder Information'}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    );
  };

  const handleSortClick = (field: 'name' | 'dateModified') => {
    if (sortBy === field) {
      dispatch(setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortDirection('asc'));
    }
  };

  if (layoutMode === 'list') {
    return (
      <div className="p-4">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 border-b px-4 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
            <div className="font-medium text-sm flex items-center gap-2">
              <button
                onClick={() => handleSortClick('name')}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
              >
                Name
                {sortBy === 'name' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="font-medium text-sm text-right hidden md:block">
              <button
                onClick={() => handleSortClick('dateModified')}
                className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors cursor-pointer"
              >
                Date Modified
                {sortBy === 'dateModified' && (
                  sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                )}
              </button>
            </div>
            <div className="font-medium text-sm text-right hidden md:block w-32">File Size</div>
            <div className="font-medium text-sm text-right w-12"></div>
          </div>
          <div className="divide-y">
            {foldersPosition === 'top' ? (
              <>
                {sortedFolders.map((folder) => renderListItem(folder, 'folder'))}
                {sortedFiles.map((file) => renderListItem(file, 'file'))}
              </>
            ) : (
              sortedAllItems.all?.map(({ item, type }) => renderListItem(item, type))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {foldersPosition === 'top' ? (
        <>
          {sortedFolders.map((folder) => renderGridItem(folder, 'folder'))}
          {sortedFiles.map((file) => renderGridItem(file, 'file'))}
        </>
      ) : (
        sortedAllItems.all?.map(({ item, type }) => renderGridItem(item, type))
      )}
    </div>
  );
};
