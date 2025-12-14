import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setActiveDataRoom, fetchDataRooms } from '@/store/dataroomSlice';
import { fetchFolders, setCurrentFolder } from '@/store/folderSlice';
import { fetchFiles } from '@/store/fileSlice';
import { Layout } from '@/components/Layout';
import { CreateDataRoomDialog } from '@/components/dialogs/CreateDataRoomDialog';
import { CreateFolderDialog } from '@/components/dialogs/CreateFolderDialog';
import { RenameDialog } from '@/components/dialogs/RenameDialog';
import { FolderInfoDialog } from '@/components/dialogs/FolderInfoDialog';
import { ItemInfoDialog } from '@/components/dialogs/ItemInfoDialog';
import { DeleteItemDialog } from '@/components/dialogs/DeleteItemDialog';
import { SearchDialog } from '@/components/dialogs/SearchDialog';
import { FileViewer } from '@/components/FileViewer';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle, Database } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dataRooms, activeDataRoomId, loading } = useAppSelector((state) => state.dataroom);
  const [roomNotFound, setRoomNotFound] = useState(false);

  useEffect(() => {
    dispatch(fetchDataRooms());
  }, [dispatch]);

  useEffect(() => {
    if (roomId && !loading && dataRooms.length >= 0) {
      const room = dataRooms.find((r) => r.id === roomId);
      if (room) {
        setRoomNotFound(false);
        dispatch(setActiveDataRoom(roomId));
        dispatch(setCurrentFolder(null));
        dispatch(fetchFolders(roomId));
        dispatch(fetchFiles(roomId));
      } else {
        setRoomNotFound(true);
      }
    }
  }, [roomId, dataRooms, loading, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setActiveDataRoom(null));
      dispatch(setCurrentFolder(null));
    };
  }, [dispatch]);

  const renderSimpleHeader = () => (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Data Room</h1>
          </div>
        </div>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {renderSimpleHeader()}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (roomNotFound || !roomId) {
    return (
      <div className="min-h-screen flex flex-col">
        {renderSimpleHeader()}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="relative">
                <AlertCircle className="h-24 w-24 text-muted-foreground" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Room Not Found</h1>
              <p className="text-muted-foreground">
                The data room you're looking for doesn't exist or has been deleted.
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="gap-2">
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeDataRoomId) {
    return (
      <div className="min-h-screen flex flex-col">
        {renderSimpleHeader()}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <Layout />
      </div>
      <CreateDataRoomDialog />
      <CreateFolderDialog />
      <RenameDialog />
      <FolderInfoDialog />
      <ItemInfoDialog />
      <DeleteItemDialog />
      <SearchDialog />
      <FileViewer />
      <Toaster />
    </div>
  );
};

