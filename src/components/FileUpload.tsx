import { useRef, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { createFile } from '@/store/fileSlice';
import { createFolder } from '@/store/folderSlice';
import { useDialog } from '@/contexts/DialogContext';
import { validateFileType, validateFileSize } from '@/lib/validators';
import { generateUniqueName, sanitizeFileName } from '@/lib/utils';
import { Upload, FolderPlus, Folder } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { FileType } from '@/types';

export const FileUpload = () => {
  const dispatch = useAppDispatch();
  const { openCreateFolderDialog } = useDialog();
  const { currentFolderId, folders } = useAppSelector((state) => state.folder);
  const { activeDataRoomId } = useAppSelector((state) => state.dataroom);
  const { files } = useAppSelector((state) => state.file);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const currentFiles = files.filter((f) => f.folderId === currentFolderId && f.dataRoomId === activeDataRoomId);
  const currentFolders = folders.filter((f) => f.parentId === currentFolderId && f.dataRoomId === activeDataRoomId);
  const existingNames = currentFiles.map((f) => f.name);
  const existingFolderNames = currentFolders.map((f) => f.name);

  const handleFileSelect = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || !activeDataRoomId) {
        return;
      }

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
                fileType = 'application/pdf'; // fallback
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
            toast({
              title: 'Upload failed',
              description: `${file.name}: An error occurred while uploading`,
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
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [activeDataRoomId, currentFolderId, existingNames, dispatch, toast]
  );

  type FileWithRelativePath = File & {
    webkitRelativePath?: string;
  };

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

  const handleFolderSelect = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || !activeDataRoomId) {
        return;
      }

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
      }
    },
    [activeDataRoomId, currentFolderId, existingNames, existingFolderNames, dispatch, toast, handleFileSelect]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  const handleFolderInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFolderSelect(e.target.files);
    },
    [handleFolderSelect]
  );

  if (!activeDataRoomId) {
    return null;
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full h-full flex flex-col items-center justify-center',
        'border-muted-foreground/25',
        uploading && 'opacity-50 pointer-events-none'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xls,.xlsx,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={uploading}
      />
      <input
        ref={folderInputRef}
        type="file"
        {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
        onChange={handleFolderInputChange}
        className="hidden"
        disabled={uploading}
      />
      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mb-6">
        Drag and drop files or folders here, or click to browse
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        Supported: PDF, Word, Excel, TXT, CSV
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-4">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          {uploading ? 'Uploading...' : 'Select Files'}
        </Button>
        <Button
          variant="outline"
          onClick={() => folderInputRef.current?.click()}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          <Folder className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Select Folder'}
        </Button>
        <span className="text-sm text-muted-foreground hidden sm:inline">or</span>
        <Button
          variant="outline"
          onClick={openCreateFolderDialog}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Create Folder
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
    </div>
  );
};

