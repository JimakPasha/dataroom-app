import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDataRooms } from '@/store/dataroomSlice';
import { setCreateDataRoomDialogOpen, setRenameDataRoomDialogOpen, setDeleteDataRoomDialogOpen, setSelectedDataRoomId } from '@/store/uiSlice';
import { setLayoutMode, setSortBy, setSortDirection } from '@/store/settingsSlice';
import { Button } from '@/components/ui/button';
import { Plus, Database, MoreVertical, Trash2, Edit, Grid3x3, List, ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { CreateDataRoomDialog } from '@/components/dialogs/CreateDataRoomDialog';
import { RenameDataRoomDialog } from '@/components/dialogs/RenameDataRoomDialog';
import { DeleteDataRoomDialog } from '@/components/dialogs/DeleteDataRoomDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { SortMenuRooms } from '@/components/SortMenuRooms';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { shouldLoadMocks, generateMockData } from '@/lib/mockData';

export const HomePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dataRooms, loading } = useAppSelector((state) => state.dataroom);
  const { layoutMode, sortBy, sortDirection } = useAppSelector((state) => state.settings);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const needsMocks = await shouldLoadMocks();
        if (needsMocks) {
          await generateMockData();
        }
        dispatch(fetchDataRooms());
      } catch (error) {
        dispatch(fetchDataRooms());
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  const sortedRooms = useMemo(() => {
    const sorted = [...dataRooms].sort((a, b) => {
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
  }, [dataRooms, sortBy, sortDirection]);

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleRename = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedDataRoomId(roomId));
    dispatch(setRenameDataRoomDialogOpen(true));
  };

  const handleDelete = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedDataRoomId(roomId));
    dispatch(setDeleteDataRoomDialogOpen(true));
  };

  const handleSortClick = (field: 'name' | 'dateModified') => {
    if (sortBy === field) {
      dispatch(setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortDirection('asc'));
    }
  };

  if (initializing || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">
          {initializing ? 'Initializing application...' : 'Loading data rooms...'}
        </p>
      </div>
    );
  }

  const renderGridItem = (room: typeof dataRooms[0]) => {
    const isHovered = hoveredRoomId === room.id;

    return (
      <ContextMenu key={room.id}>
        <ContextMenuTrigger asChild>
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow relative group"
            onMouseEnter={() => setHoveredRoomId(room.id)}
            onMouseLeave={() => setHoveredRoomId(null)}
            onMouseDown={(e) => {
              if (e.button === 0) {
                handleRoomClick(room.id);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate" title={room.name}>
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDate(room.createdAt)}
                  </p>
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
                        setHoveredRoomId(room.id);
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
                  <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuItem onClick={(e) => handleRename(room.id, e)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDelete(room.id, e)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={(e) => handleRename(room.id, e)}>
            <Edit className="h-4 w-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={(e) => handleDelete(room.id, e)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  const renderListItem = (room: typeof dataRooms[0]) => {
    return (
      <ContextMenu key={room.id}>
        <ContextMenuTrigger asChild>
          <div
            className="px-4 py-3 cursor-pointer hover:bg-accent transition-colors group grid grid-cols-[1fr_auto_auto] gap-4 items-center"
            onMouseEnter={() => setHoveredRoomId(room.id)}
            onMouseLeave={() => setHoveredRoomId(null)}
            onMouseDown={(e) => {
              if (e.button === 0) {
                handleRoomClick(room.id);
              }
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Database className="h-5 w-5 flex-shrink-0 text-primary" />
              <h3 className="font-semibold truncate" title={room.name}>
                {room.name}
              </h3>
            </div>
            <div className="text-sm text-muted-foreground text-right hidden md:block">
              {formatDate(room.updatedAt)}
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
                      setHoveredRoomId(room.id);
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
                <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
                  <DropdownMenuItem onClick={(e) => handleRename(room.id, e)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleDelete(room.id, e)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={(e) => handleRename(room.id, e)}>
            <Edit className="h-4 w-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={(e) => handleDelete(room.id, e)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-muted-foreground">Select a room to view and manage documents</p>
          </div>
          <div className="flex items-center gap-3">
            {dataRooms.length > 0 && (
              <>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={layoutMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-r-none"
                    onClick={() => dispatch(setLayoutMode('grid'))}
                    title="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layoutMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-l-none border-l"
                    onClick={() => dispatch(setLayoutMode('list'))}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <SortMenuRooms />
                <div className="h-6 w-px bg-border" />
              </>
            )}
            <Button onClick={() => dispatch(setCreateDataRoomDialogOpen(true))}>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>
        </div>

        {dataRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <Database className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">No rooms yet</h2>
            <p className="text-muted-foreground mb-6">Create your first data room to get started</p>
            <Button onClick={() => dispatch(setCreateDataRoomDialogOpen(true))}>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>
        ) : layoutMode === 'list' ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 border-b px-4 py-2 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
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
                  className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                >
                  Date Modified
                  {sortBy === 'dateModified' && (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div className="font-medium text-sm text-right w-12"></div>
            </div>
            <div className="divide-y">
              {sortedRooms.map((room) => renderListItem(room))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedRooms.map((room) => renderGridItem(room))}
          </div>
        )}
      </div>
      <CreateDataRoomDialog />
      <RenameDataRoomDialog />
      <DeleteDataRoomDialog />
    </div>
  );
};
