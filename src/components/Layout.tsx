import { FolderTree } from './FolderTree';
import { FileList } from './FileList';
import { Breadcrumbs } from './Breadcrumbs';
import { FileUpload } from './FileUpload';
import { SortMenu } from './SortMenu';
import { Button } from './ui/button';
import { Plus, FolderPlus, Grid3x3, List, Upload, Info, ArrowLeft, Search, Folder } from 'lucide-react';
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
import { fetchFolders, createFolder } from '@/store/folderSlice';
import { fetchFiles, createFile } from '@/store/fileSlice';
import { Spinner } from './ui/spinner';
import { validateFileType, validateFileSize } from '@/lib/validators';
import { generateUniqueName, sanitizeFileName, cn, processDataTransferItems } from '@/lib/utils';
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
  const folderInputRef = useRef<HTMLInputElement>(null);
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
  const existingFolderNames = currentFolders.map((f) => f.name);
  const isEmpty = displayFiles.length === 0 && displayFolders.length === 0;
  
  const shouldShowEmpty = uploading 
    ? (frozenContentRef.current === 'empty')
    : isEmpty;

  const getFileType = (file: File): FileType => {
    if (!file.type || file.type === 'application/octet-stream') {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.pdf')) {
        return 'application/pdf';
      } else if (fileName.endsWith('.docx')) {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (fileName.endsWith('.xlsx')) {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (fileName.endsWith('.xls')) {
        return 'application/vnd.ms-excel';
      } else if (fileName.endsWith('.txt')) {
        return 'text/plain';
      } else if (fileName.endsWith('.csv')) {
        return 'text/csv';
      } else {
        return 'application/pdf';
      }
    } else {
      return file.type as FileType;
    }
  };

  const handleFolderAndFileUpload = useCallback(
    async (processedData: { files: Array<{ file: File; relativePath: string; folderPath: string[] }>; folders: Array<{ name: string; folderPath: string[] }>; plainFiles: File[] }) => {
      if (!activeDataRoomId) {
        return;
      }

      const createFolderStructure = async (
        folders: Array<{ name: string; folderPath: string[] }>,
        baseFolderId: string | null,
        existingFolderNames: string[]
      ): Promise<Map<string, string>> => {
        const folderMap = new Map<string, string>();
        const updatedFolderNames = [...existingFolderNames];

        const sortedFolders = [...folders].sort((a, b) => a.folderPath.length - b.folderPath.length);

        for (const folderInfo of sortedFolders) {
          const parentPath = folderInfo.folderPath.join('/');
          const parentId = folderMap.get(parentPath) || baseFolderId;

          const sanitizedName = sanitizeFileName(folderInfo.name);
          const uniqueName = generateUniqueName(sanitizedName, updatedFolderNames);
          updatedFolderNames.push(uniqueName);

          try {
            const newFolder = await dispatch(
              createFolder({
                name: uniqueName,
                parentId: parentId,
                dataRoomId: activeDataRoomId,
              })
            ).unwrap();

            const currentPath = folderInfo.folderPath.length > 0 
              ? `${parentPath}/${folderInfo.name}`
              : folderInfo.name;
            folderMap.set(currentPath, newFolder.id);
          } catch (error) {
            console.error(`Failed to create folder ${folderInfo.name}:`, error);
          }
        }

        return folderMap;
      };

      const initialIsEmpty = currentFiles.length === 0 && currentFolders.length === 0;
      frozenContentRef.current = initialIsEmpty ? 'empty' : 'files';
      frozenFilesRef.current = [...currentFiles];
      frozenFoldersRef.current = [...currentFolders];
      setUploading(true);

      const results = { filesSuccess: 0, filesFailed: 0, foldersSuccess: 0, foldersFailed: 0 };
      const updatedFileNames = [...existingNames];
      const updatedFolderNames = [...existingFolderNames];

      try {
        if (processedData.folders.length > 0) {
          const folderMap = await createFolderStructure(
            processedData.folders,
            currentFolderId,
            updatedFolderNames
          );

          for (const fileInfo of processedData.files) {
            try {
              const file = fileInfo.file;

              const typeValidation = validateFileType(file);
              if (!typeValidation.valid) {
                toast({
                  title: 'Upload failed',
                  description: `${file.name}: ${typeValidation.error}`,
                  variant: 'destructive',
                });
                results.filesFailed++;
                continue;
              }

              const sizeValidation = validateFileSize(file, 10);
              if (!sizeValidation.valid) {
                toast({
                  title: 'Upload failed',
                  description: `${file.name}: ${sizeValidation.error}`,
                  variant: 'destructive',
                });
                results.filesFailed++;
                continue;
              }

              const targetFolderPath = fileInfo.folderPath.join('/');
              const targetFolderId = folderMap.get(targetFolderPath) || currentFolderId;

              const sanitizedName = sanitizeFileName(file.name);
              const uniqueName = generateUniqueName(sanitizedName, updatedFileNames);
              updatedFileNames.push(uniqueName);

              const arrayBuffer = await file.arrayBuffer();
              const fileType = getFileType(file);

              await dispatch(
                createFile({
                  name: uniqueName,
                  folderId: targetFolderId,
                  dataRoomId: activeDataRoomId,
                  type: fileType,
                  size: file.size,
                  content: arrayBuffer,
                })
              ).unwrap();

              results.filesSuccess++;
            } catch (error) {
              results.filesFailed++;
              const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading';
              toast({
                title: 'Upload failed',
                description: `${fileInfo.file.name}: ${errorMessage}`,
                variant: 'destructive',
              });
            }
          }
        }

        for (const file of processedData.plainFiles) {
          try {
            const typeValidation = validateFileType(file);
            if (!typeValidation.valid) {
              toast({
                title: 'Upload failed',
                description: `${file.name}: ${typeValidation.error}`,
                variant: 'destructive',
              });
              results.filesFailed++;
              continue;
            }

            const sizeValidation = validateFileSize(file, 10);
            if (!sizeValidation.valid) {
              toast({
                title: 'Upload failed',
                description: `${file.name}: ${sizeValidation.error}`,
                variant: 'destructive',
              });
              results.filesFailed++;
              continue;
            }

            const sanitizedName = sanitizeFileName(file.name);
            const uniqueName = generateUniqueName(sanitizedName, updatedFileNames);
            updatedFileNames.push(uniqueName);

            const arrayBuffer = await file.arrayBuffer();
            const fileType = getFileType(file);

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

            results.filesSuccess++;
          } catch (error) {
            results.filesFailed++;
            const errorMessage = error instanceof Error ? error.message : 'An error occurred while uploading';
            toast({
              title: 'Upload failed',
              description: `${file.name}: ${errorMessage}`,
              variant: 'destructive',
            });
          }
        }

        const parts: string[] = [];
        if (results.filesSuccess > 0) {
          parts.push(`${results.filesSuccess} file${results.filesSuccess > 1 ? 's' : ''} uploaded`);
        }
        if (processedData.folders.length > 0) {
          parts.push(`${processedData.folders.length} folder${processedData.folders.length > 1 ? 's' : ''} created`);
        }
        if (results.filesFailed > 0 || results.foldersFailed > 0) {
          const failedCount = results.filesFailed + results.foldersFailed;
          parts.push(`${failedCount} failed`);
        }

        if (parts.length > 0) {
          toast({
            title: 'Upload complete',
            description: parts.join(', '),
          });
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'An error occurred while uploading',
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
    [activeDataRoomId, currentFolderId, existingNames, existingFolderNames, currentFiles, currentFolders, dispatch, toast]
  );

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
            const fileType = getFileType(file);

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

  const handleFolderSelectClick = useCallback(async () => {
    if (!activeDataRoomId) {
      return;
    }

    interface WindowWithDirectoryPicker extends Window {
      showDirectoryPicker?: () => Promise<{ name: string; kind: string; values: () => AsyncIterableIterator<{ name: string; kind: string }> }>;
    }
    const windowWithPicker = window as WindowWithDirectoryPicker;

    if (windowWithPicker.showDirectoryPicker) {
      try {
        const directoryHandle = await windowWithPicker.showDirectoryPicker();
        const folderName = directoryHandle.name;

        const initialIsEmpty = currentFiles.length === 0 && currentFolders.length === 0;
        frozenContentRef.current = initialIsEmpty ? 'empty' : 'files';
        frozenFilesRef.current = [...currentFiles];
        frozenFoldersRef.current = [...currentFolders];
        setUploading(true);

        try {
          const entries: Array<{ name: string; kind: string }> = [];
          for await (const entry of directoryHandle.values()) {
            entries.push(entry);
          }

          if (entries.length === 0) {
            const sanitizedName = sanitizeFileName(folderName);
            const uniqueName = generateUniqueName(sanitizedName, existingFolderNames);

            await dispatch(
              createFolder({
                name: uniqueName,
                parentId: currentFolderId,
                dataRoomId: activeDataRoomId,
              })
            ).unwrap();

            toast({
              title: 'Upload complete',
              description: `Folder "${uniqueName}" created`,
            });
          } else {
            interface DirectoryHandle {
              name: string;
              kind: string;
              getFile: (name: string) => Promise<File>;
              getDirectoryHandle: (name: string) => Promise<DirectoryHandle>;
              values: () => AsyncIterableIterator<DirectoryHandle>;
            }

            interface ProcessedEntry {
              file?: File;
              folderName?: string;
              relativePath: string;
              folderPath: string[];
            }

            const processDirectory = async (
              dirHandle: DirectoryHandle,
              basePath: string[] = []
            ): Promise<{ files: ProcessedEntry[]; folders: Array<{ name: string; folderPath: string[] }> }> => {
              const files: ProcessedEntry[] = [];
              const folders: Array<{ name: string; folderPath: string[] }> = [];
              const currentPath = [...basePath, dirHandle.name];

              folders.push({
                name: dirHandle.name,
                folderPath: basePath,
              });

              for await (const entry of dirHandle.values()) {
                if (entry.kind === 'file') {
                  try {
                    const file = await entry.getFile(entry.name);
                    files.push({
                      file,
                      relativePath: [...currentPath, entry.name].join('/'),
                      folderPath: currentPath,
                    });
                  } catch (error) {
                    console.error(`Failed to get file ${entry.name}:`, error);
                  }
                } else if (entry.kind === 'directory') {
                  const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);
                  const result = await processDirectory(subDirHandle, currentPath);
                  files.push(...result.files);
                  folders.push(...result.folders);
                }
              }

              return { files, folders };
            };

            const { files: processedFiles, folders: processedFolders } = await processDirectory(
              directoryHandle as unknown as DirectoryHandle,
              []
            );

            const createFolderStructure = async (
              folders: Array<{ name: string; folderPath: string[] }>,
              baseFolderId: string | null
            ): Promise<Map<string, string>> => {
              const folderMap = new Map<string, string>();
              const updatedFolderNames = [...existingFolderNames];

              const sortedFolders = [...folders].sort((a, b) => a.folderPath.length - b.folderPath.length);

              for (const folderInfo of sortedFolders) {
                const parentPath = folderInfo.folderPath.join('/');
                const parentId = folderMap.get(parentPath) || baseFolderId;

                const sanitizedName = sanitizeFileName(folderInfo.name);
                const uniqueName = generateUniqueName(sanitizedName, updatedFolderNames);
                updatedFolderNames.push(uniqueName);

                try {
                  const newFolder = await dispatch(
                    createFolder({
                      name: uniqueName,
                      parentId: parentId,
                      dataRoomId: activeDataRoomId,
                    })
                  ).unwrap();

                  const currentPath = folderInfo.folderPath.length > 0
                    ? `${parentPath}/${folderInfo.name}`
                    : folderInfo.name;
                  folderMap.set(currentPath, newFolder.id);
                } catch (error) {
                  console.error(`Failed to create folder ${folderInfo.name}:`, error);
                }
              }

              return folderMap;
            };

            const folderMap = await createFolderStructure(processedFolders, currentFolderId);

            const results = { filesSuccess: 0, filesFailed: 0 };
            const updatedFileNames = [...existingNames];

            for (const entry of processedFiles) {
              if (!entry.file) continue;

              try {
                const file = entry.file;
                const pathParts = entry.relativePath.split('/');
                const fileName = pathParts[pathParts.length - 1];
                const folderPath = entry.folderPath.join('/');
                const targetFolderId = folderMap.get(folderPath) || currentFolderId;

                const typeValidation = validateFileType(file);
                if (!typeValidation.valid) {
                  toast({
                    title: 'Upload failed',
                    description: `${entry.relativePath}: ${typeValidation.error}`,
                    variant: 'destructive',
                  });
                  results.filesFailed++;
                  continue;
                }

                const sizeValidation = validateFileSize(file, 10);
                if (!sizeValidation.valid) {
                  toast({
                    title: 'Upload failed',
                    description: `${entry.relativePath}: ${sizeValidation.error}`,
                    variant: 'destructive',
                  });
                  results.filesFailed++;
                  continue;
                }

                const sanitizedName = sanitizeFileName(fileName);
                const uniqueName = generateUniqueName(sanitizedName, updatedFileNames);
                updatedFileNames.push(uniqueName);

                const arrayBuffer = await file.arrayBuffer();
                const fileType = getFileType(file);

                await dispatch(
                  createFile({
                    name: uniqueName,
                    folderId: targetFolderId,
                    dataRoomId: activeDataRoomId,
                    type: fileType,
                    size: file.size,
                    content: arrayBuffer,
                  })
                ).unwrap();

                results.filesSuccess++;
              } catch (error) {
                results.filesFailed++;
                toast({
                  title: 'Upload failed',
                  description: `${entry.relativePath}: An error occurred while uploading`,
                  variant: 'destructive',
                });
              }
            }

            const parts: string[] = [];
            if (results.filesSuccess > 0) {
              parts.push(`${results.filesSuccess} file${results.filesSuccess > 1 ? 's' : ''} uploaded`);
            }
            if (processedFolders.length > 0) {
              parts.push(`${processedFolders.length} folder${processedFolders.length > 1 ? 's' : ''} created`);
            }
            if (results.filesFailed > 0) {
              parts.push(`${results.filesFailed} failed`);
            }

            if (parts.length > 0) {
              toast({
                title: 'Upload complete',
                description: parts.join(', '),
              });
            }
          }
        } catch (error) {
          toast({
            title: 'Upload failed',
            description: 'An error occurred while creating folder',
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
        return;
      } catch (error) {
        console.error('Error selecting folder:', error);
      }
    }

    folderInputRef.current?.click();
  }, [activeDataRoomId, currentFolderId, existingFolderNames, existingNames, currentFiles, currentFolders, dispatch, toast]);

  const handleFolderSelect = useCallback(
    async (fileList: FileList | null) => {
      if (!activeDataRoomId) {
        return;
      }

      if (!fileList || fileList.length === 0) {
        toast({
          title: 'Empty folder',
          description: 'Empty folders cannot be uploaded via folder selection. Please use "Create Folder" or add files to the folder first.',
          variant: 'destructive',
        });
        if (folderInputRef.current) {
          folderInputRef.current.value = '';
        }
        return;
      }

      type FileWithRelativePath = File & {
        webkitRelativePath?: string;
      };

      const createFolderStructureFromPaths = async (
        filePaths: string[],
        baseFolderId: string | null
      ): Promise<Map<string, string>> => {
        const folderMap = new Map<string, string>();
        const updatedFolderNames = [...existingFolderNames];
        const folderPaths = new Set<string>();

        for (const filePath of filePaths) {
          const parts = filePath.split('/').slice(0, -1);
          let currentPath = '';
          for (const part of parts) {
            if (currentPath) {
              currentPath += '/' + part;
            } else {
              currentPath = part;
            }
            folderPaths.add(currentPath);
          }
        }

        const sortedPaths = Array.from(folderPaths).sort((a, b) => {
          const depthA = a.split('/').length;
          const depthB = b.split('/').length;
          return depthA - depthB;
        });

        for (const folderPath of sortedPaths) {
          const parts = folderPath.split('/');
          const folderName = parts[parts.length - 1];
          const parentPath = parts.slice(0, -1).join('/');
          const parentId = folderMap.get(parentPath) || baseFolderId;

          const sanitizedName = sanitizeFileName(folderName);
          const uniqueName = generateUniqueName(sanitizedName, updatedFolderNames);
          updatedFolderNames.push(uniqueName);

          try {
            const newFolder = await dispatch(
              createFolder({
                name: uniqueName,
                parentId: parentId,
                dataRoomId: activeDataRoomId,
              })
            ).unwrap();

            folderMap.set(folderPath, newFolder.id);
          } catch (error) {
            console.error(`Failed to create folder ${folderName}:`, error);
          }
        }

        return folderMap;
      };

      const initialIsEmpty = currentFiles.length === 0 && currentFolders.length === 0;
      frozenContentRef.current = initialIsEmpty ? 'empty' : 'files';
      frozenFilesRef.current = [...currentFiles];
      frozenFoldersRef.current = [...currentFolders];
      setUploading(true);

      const files = Array.from(fileList);
      const results = { filesSuccess: 0, filesFailed: 0, foldersCreated: 0 };

      try {
        const hasRelativePaths = files.some((f) => (f as FileWithRelativePath).webkitRelativePath);

        if (hasRelativePaths) {
          const filePaths = files.map((f) => (f as FileWithRelativePath).webkitRelativePath || f.name);
          const folderMap = await createFolderStructureFromPaths(filePaths, currentFolderId);
          results.foldersCreated = folderMap.size;

          const updatedFileNames = [...existingNames];

          for (const file of files) {
            try {
              const relativePath = (file as FileWithRelativePath).webkitRelativePath || file.name;
              const pathParts = relativePath.split('/');
              const fileName = pathParts[pathParts.length - 1];
              const folderPath = pathParts.slice(0, -1).join('/');
              const targetFolderId = folderMap.get(folderPath) || currentFolderId;

              const typeValidation = validateFileType(file);
              if (!typeValidation.valid) {
                toast({
                  title: 'Upload failed',
                  description: `${relativePath}: ${typeValidation.error}`,
                  variant: 'destructive',
                });
                results.filesFailed++;
                continue;
              }

              const sizeValidation = validateFileSize(file, 10);
              if (!sizeValidation.valid) {
                toast({
                  title: 'Upload failed',
                  description: `${relativePath}: ${sizeValidation.error}`,
                  variant: 'destructive',
                });
                results.filesFailed++;
                continue;
              }

              const sanitizedName = sanitizeFileName(fileName);
              const uniqueName = generateUniqueName(sanitizedName, updatedFileNames);
              updatedFileNames.push(uniqueName);

              const arrayBuffer = await file.arrayBuffer();
              const fileType = getFileType(file);

              await dispatch(
                createFile({
                  name: uniqueName,
                  folderId: targetFolderId,
                  dataRoomId: activeDataRoomId,
                  type: fileType,
                  size: file.size,
                  content: arrayBuffer,
                })
              ).unwrap();

              results.filesSuccess++;
            } catch (error) {
              results.filesFailed++;
              const fileWithPath = file as FileWithRelativePath;
              toast({
                title: 'Upload failed',
                description: `${fileWithPath.webkitRelativePath || file.name}: An error occurred while uploading`,
                variant: 'destructive',
              });
            }
          }

          const parts: string[] = [];
          if (results.filesSuccess > 0) {
            parts.push(`${results.filesSuccess} file${results.filesSuccess > 1 ? 's' : ''} uploaded`);
          }
          if (results.foldersCreated > 0) {
            parts.push(`${results.foldersCreated} folder${results.foldersCreated > 1 ? 's' : ''} created`);
          }
          if (results.filesFailed > 0) {
            parts.push(`${results.filesFailed} failed`);
          }

          if (parts.length > 0) {
            toast({
              title: 'Upload complete',
              description: parts.join(', '),
            });
          }
        } else {
          await handleFileSelect(fileList);
        }
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'An error occurred while uploading folder',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        if (folderInputRef.current) {
          folderInputRef.current.value = '';
        }
        setTimeout(() => {
          frozenContentRef.current = null;
          frozenFilesRef.current = [];
          frozenFoldersRef.current = [];
        }, 100);
      }
    },
    [activeDataRoomId, currentFolderId, existingNames, existingFolderNames, currentFiles, currentFolders, dispatch, toast, handleFileSelect]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (!activeDataRoomId) {
        return;
      }

      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        try {
          const processedData = await processDataTransferItems(e.dataTransfer.items);
          await handleFolderAndFileUpload(processedData);
        } catch (error) {
          console.error('Error processing drag & drop items:', error);
          handleFileSelect(e.dataTransfer.files);
        }
      } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [activeDataRoomId, handleFileSelect, handleFolderAndFileUpload]
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
                      <DropdownMenuItem onClick={handleFolderSelectClick}>
                        <Folder className="h-4 w-4 mr-2" />
                        Upload Folder
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
                {(foldersLoading || filesLoading) && files.length === 0 && folders.length === 0 ? (
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
              <ContextMenuItem onClick={handleFolderSelectClick}>
                <Folder className="h-4 w-4 mr-2" />
                Upload Folder
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
          <input
            ref={folderInputRef}
            type="file"
            {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
            onChange={(e) => handleFolderSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </main>
      </div>
    </TooltipProvider>
  );
};

