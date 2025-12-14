import { useRef, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { createFile } from '@/store/fileSlice';
import { validateFileType, validateFileSize } from '@/lib/validators';
import { generateUniqueName, sanitizeFileName } from '@/lib/utils';
import { Upload, FolderPlus } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { setCreateFolderDialogOpen } from '@/store/uiSlice';
import type { FileType } from '@/types';

export const FileUpload = () => {
  const dispatch = useAppDispatch();
  const { currentFolderId } = useAppSelector((state) => state.folder);
  const { activeDataRoomId } = useAppSelector((state) => state.dataroom);
  const { files } = useAppSelector((state) => state.file);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const currentFiles = files.filter((f) => f.folderId === currentFolderId && f.dataRoomId === activeDataRoomId);
  const existingNames = currentFiles.map((f) => f.name);

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

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
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
      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mb-6">
        Drag and drop files here, or click to browse
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
        <span className="text-sm text-muted-foreground hidden sm:inline">or</span>
        <Button
          variant="outline"
          onClick={() => dispatch(setCreateFolderDialogOpen(true))}
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

