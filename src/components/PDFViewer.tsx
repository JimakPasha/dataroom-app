import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setViewingFile } from '@/store/fileSlice';
import { db } from '@/lib/db';
import { Dialog, DialogContent } from './ui/dialog';
import { useEffect, useState } from 'react';

export const PDFViewer = () => {
  const dispatch = useAppDispatch();
  const { viewingFileId, files } = useAppSelector((state) => state.file);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const file = viewingFileId ? files.find((f) => f.id === viewingFileId) : null;

  useEffect(() => {
    if (!file) {
      return;
    }

    let currentUrl: string | null = null;

    const loadPdf = async () => {
      try {
        const fileData = await db.getFileById(file.id);
        if (fileData) {
          const blob = new Blob([fileData.content], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          currentUrl = url;
          setPdfUrl(url);
        }
      } catch (error) {
        setPdfUrl(null);
      }
    };

    loadPdf();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [file]);

  const handleClose = () => {
    dispatch(setViewingFile(null));
  };

  if (!file) {
    return null;
  }

  return (
    <Dialog open={!!viewingFileId} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold truncate flex-1">{file.name}</h2>
        </div>
        <div className="flex-1 overflow-auto p-4 pt-0">
          {pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-full min-h-[480px] border-0"  />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading PDF...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

