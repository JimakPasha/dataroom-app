import { FolderTree } from './FolderTree';
import { FileList } from './FileList';
import { Breadcrumbs } from './Breadcrumbs';
import { FileUpload } from './FileUpload';
import { SortMenu } from './SortMenu';
import { Button } from './ui/button';
import { Plus, FolderPlus, Grid3x3, List, Upload, Info, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useDialog } from '@/contexts/DialogContext';
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
import { TooltipProvider } from './ui/tooltip';
import { setLayoutMode } from '@/store/settingsSlice';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { fetchFolders } from '@/store/folderSlice';
import { fetchFiles, createFile } from '@/store/fileSlice';
import { Spinner } from './ui/spinner';
import { validateFileType, validateFileSize } from '@/lib/validators';
import { generateUniqueName, sanitizeFileName, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { FileType } from '@/types';

export const Layout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { openCreateFolderDialog, openFolderInfoDialog, openSearchDialog } = useDialog();
  const { activeDataRoomId } = useAppSelector((state) => state.dataroom);
  const { currentFolderId, folders, loading: foldersLoading, error: foldersError } = useAppSelector((state) => state.folder);
  const { layoutMode } = useAppSelector((state) => state.settings);
  const { files, loading: filesLoading, error: filesError } = useAppSelector((state) => state.file);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frozenContentRef = useRef<'empty' | 'files' | null>(null);
  const frozenFilesRef = useRef<typeof files>([]);
  const frozenFoldersRef = useRef<typeof folders>([]);

  useEffect(() => {
    if (activeDataRoomId) {
      dispatch(fetchFolders(activeDataRoomId));
      dispatch(fetchFiles(activeDataRoomId));
    }
  }, [activeDataRoomId, dispatch]);

  useEffect(() => {
    if (foldersError) {
      toast({
        title: 'Error loading folders',
        description: foldersError,
        variant: 'destructive',
      });
    }
  }, [foldersError, toast]);

  useEffect(() => {
    if (filesError) {
      toast({
        title: 'Error loading files',
        description: filesError,
        variant: 'destructive',
      });
    }
  }, [filesError, toast]);

  const currentFiles = useMemo(
    () => files.filter((f) => f.folderId === currentFolderId && f.dataRoomId === activeDataRoomId),
    [files, currentFolderId, activeDataRoomId]
  );
  const currentFolders = useMemo(
    () => folders.filter((f) => f.parentId === currentFolderId && f.dataRoomId === activeDataRoomId),
    [folders, currentFolderId, activeDataRoomId]
  );

  const displayFiles = uploading ? frozenFilesRef.current : currentFiles;
  const displayFolders = uploading ? frozenFoldersRef.current : currentFolders;
  
  const existingNames = currentFiles.map((f) => f.name);
  const isEmpty = displayFiles.length === 0 && displayFolders.length === 0;
  
  const shouldShowEmpty = uploading 
    ? (frozenContentRef.current === 'empty')
    : isEmpty;

  const handleFileSelect = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || !activeDataRoomId) {
        return;
      }

      const initialIsEmpty = currentFiles.length === 0 && currentFolders.length === 0;
      frozenContentRef.current = initialIsEmpty ? 'empty' : 'files';
      frozenFilesRef.current = [...currentFiles];
      frozenFoldersRef.current = [...currentFolders];
      setUploading(true);

      const files = Array.from(fileList);
      const results = { success: 0, failed: 0 };
      const updatedNames = [...existingNames];

      try {
        for (const file of files) {
          try {
            const typeValidation = validateFileType(file);
            if (!typeValidation.valid) {
              toast({
                title: 'Upload failed',
                description: `${file.name}: ${typeValidation.error}`,
                variant: 'destructive',
              });
              results.failed++;
              continue;
            }

            const sizeValidation = validateFileSize(file, 10);
            if (!sizeValidation.valid) {
              toast({
                title: 'Upload failed',
                description: `${file.name}: ${sizeValidation.error}`,
                variant: 'destructive',
              });
              results.failed++;
              continue;
            }

            const sanitizedName = sanitizeFileName(file.name);
            const uniqueName = generateUniqueName(sanitizedName, updatedNames);
            updatedNames.push(uniqueName);

            const arrayBuffer = await file.arrayBuffer();

            let fileType: FileType;
            if (!file.type || file.type === 'application/octet-stream') {
              const fileName = file.name.toLowerCase();
              if (fileName.endsWith('.pdf')) {
                fileType = 'application/pdf';
              } else if (fileName.endsWith('.docx')) {
                fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              } else if (fileName.endsWith('.xlsx')) {
                fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
              } else if (fileName.endsWith('.xls')) {
                fileType = 'application/vnd.ms-excel';
              } else if (fileName.endsWith('.txt')) {
                fileType = 'text/plain';
              } else if (fileName.endsWith('.csv')) {
                fileType = 'text/csv';
              } else {
                fileType = 'application/pdf';
              }
            } else {
              fileType = file.type as FileType;
            }

            await dispatch(
              createFile({
                name: uniqueName,
                folderId: currentFolderId,
                dataRoomId: activeDataRoomId,
                type: fileType,
                size: file.size,
                content: arrayBuffer,
              })
            ).unwrap();

            results.success++;
          } catch (error) {
            results.failed++;
            const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading';
            toast({
              title: 'Upload failed',
              description: `${file.name}: ${errorMessage}`,
              variant: 'destructive',
            });
          }
        }

        if (results.success > 0) {
          toast({
            title: 'Upload complete',
            description: `${results.success} file${results.success > 1 ? 's' : ''} uploaded successfully${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          });
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'An error occurred while uploading files',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        setTimeout(() => {
          frozenContentRef.current = null;
          frozenFilesRef.current = [];
          frozenFoldersRef.current = [];
        }, 100);
      }
    },
    [activeDataRoomId, currentFolderId, existingNames, currentFiles, currentFolders, dispatch, toast]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );


  return (
    <TooltipProvider>
      <div className="flex h-full">
        <aside className="w-64 border-r flex flex-col">
          <div className="border-b flex items-center h-[61px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="w-full justify-start gap-2 h-full rounded-none px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Rooms
            </Button>
          </div>
          <div className="flex-1 overflow-auto overflow-x-auto">
            <div className="pr-4" style={{ minWidth: 'max-content' }}>
              <FolderTree />
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b">
            <div className="flex items-center justify-between p-5 h-[60px]">
              <Breadcrumbs />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
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
                  <SortMenu />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openSearchDialog}
                    disabled={!activeDataRoomId}
                    title="Search files and folders"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="h-6 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={!activeDataRoomId}
                        title="Create folder or upload file"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={openCreateFolderDialog}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create Folder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openFolderInfoDialog}
                    disabled={!activeDataRoomId}
                    title="Folder Information"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className={cn(
                  'flex-1 relative',
                  shouldShowEmpty ? 'flex items-center justify-center' : 'overflow-auto',
                  isDragging && !uploading && 'bg-accent/50',
                  uploading && 'overflow-hidden'
                )}
                style={uploading ? { minHeight: '100%' } : undefined}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {uploading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md border-2 border-dashed border-primary rounded-lg m-4">
                    <div className="space-y-4 flex flex-col items-center justify-center space-y-4">
                      <Spinner size="lg" />
                      <p className="text-lg font-medium">Uploading files...</p>
                      <p className="text-sm text-muted-foreground">
                        Please wait while files are being uploaded
                      </p>
                    </div>
                  </div>
                )}
                {!uploading && isDragging && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg m-4">
                    <div className="text-center space-y-4">
                      <Upload className="h-16 w-16 mx-auto text-primary" />
                      <p className="text-lg font-medium">Drop file here to upload</p>
                      <p className="text-sm text-muted-foreground">Maximum file size: 10MB</p>
                      <p className="text-xs text-muted-foreground">
                        Supported: PDF, Word, Excel, TXT, CSV
                      </p>
                    </div>
                  </div>
                )}
                {foldersLoading || filesLoading ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="flex flex-col items-center gap-3">
                      <Spinner size="lg" />
                      <p className="text-sm text-muted-foreground">Loading files and folders...</p>
                    </div>
                  </div>
                ) : shouldShowEmpty ? (
                  <div className="w-full h-full p-4">
                    <FileUpload />
                  </div>
                ) : (
                  <div className="p-4">
                    <FileList 
                      frozenFiles={uploading ? frozenFilesRef.current : undefined}
                      frozenFolders={uploading ? frozenFoldersRef.current : undefined}
                    />
                  </div>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={openCreateFolderDialog}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </ContextMenuItem>
              <ContextMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </ContextMenuItem>
              <ContextMenuItem onClick={openFolderInfoDialog}>
                <Info className="h-4 w-4 mr-2" />
                Folder Information
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xls,.xlsx,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </main>
      </div>
    </TooltipProvider>
  );
};

