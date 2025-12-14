import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setViewingFile } from '@/store/fileSlice';
import { db } from '@/lib/db';
import { Dialog, DialogContent } from './ui/dialog';
import { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Spinner } from './ui/spinner';
import { mockApiCall } from '@/lib/api-mock';

export const FileViewer = () => {
  const dispatch = useAppDispatch();
  const { viewingFileId, files } = useAppSelector((state) => state.file);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excelWorkbook, setExcelWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [excelSheetNames, setExcelSheetNames] = useState<string[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState<number>(0);

  const file = viewingFileId ? files.find((f) => f.id === viewingFileId) : null;

  useEffect(() => {
    if (!file) {
      setContent(null);
      setError(null);
      setExcelWorkbook(null);
      setExcelSheetNames([]);
      setCurrentSheetIndex(0);
      return;
    }

    let pdfUrl: string | null = null;

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      setContent(null);

      try {
        const fileData = await mockApiCall(
          () => db.getFileById(file.id),
          {
            minDelay: 300,
            maxDelay: 800,
          }
        );
        if (!fileData) {
          setError('File not found');
          setLoading(false);
          return;
        }

        const fileType = file.type;

        if (fileType === 'application/pdf') {
          const blob = new Blob([fileData.content], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          pdfUrl = url;
          setContent(url);
          setLoading(false);
          return;
        }

        if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          try {
            const result = await mammoth.convertToHtml({ arrayBuffer: fileData.content });
            setContent(result.value);
            setLoading(false);
          } catch (err) {
            setError('Failed to parse Word document');
            setLoading(false);
          }
          return;
        }

        if (
          fileType === 'application/vnd.ms-excel' ||
          fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          try {
            const workbook = XLSX.read(fileData.content, { 
              type: 'array',
              cellDates: true,
              cellNF: false,
              cellStyles: false,
              sheetStubs: false,
            });
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              setError('Excel file has no sheets');
              setLoading(false);
              return;
            }

            setExcelWorkbook(workbook);
            setExcelSheetNames(workbook.SheetNames);
            setCurrentSheetIndex(0);

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            if (!worksheet) {
              setError('Failed to read worksheet');
              setLoading(false);
              return;
            }

            const html = XLSX.utils.sheet_to_html(worksheet, {
              id: 'excel-table',
              editable: false,
            });

            const styledHtml = `
              <div style="overflow-x: auto; width: 100%;">
                <style>
                  #excel-table {
                    border-collapse: collapse;
                    width: 100%;
                    font-size: 14px;
                  }
                  #excel-table td, #excel-table th {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                  }
                  #excel-table th {
                    background-color: #f2f2f2;
                    font-weight: 600;
                  }
                  #excel-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                  }
                </style>
                ${html}
              </div>
            `;
            
            setContent(styledHtml);
            setLoading(false);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to parse Excel file: ${errorMessage}`);
            setLoading(false);
          }
          return;
        }

        if (
          fileType === 'text/plain' ||
          fileType === 'text/csv' ||
          fileType === 'application/csv'
        ) {
          try {
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(fileData.content);
            const formattedText = text
              .split('\n')
              .map((line) => line.replace(/\t/g, '  '))
              .join('\n');
            setContent(formattedText);
            setLoading(false);
          } catch (err) {
            setError('Failed to read text file');
            setLoading(false);
          }
          return;
        }

        setError('Unsupported file type');
        setLoading(false);
      } catch (err) {
        setError('Failed to load file');
        setLoading(false);
      }
    };

    loadFile();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [file]);

  useEffect(() => {
    if (!excelWorkbook || excelSheetNames.length === 0 || currentSheetIndex < 0 || currentSheetIndex >= excelSheetNames.length) {
      return;
    }

    const sheetName = excelSheetNames[currentSheetIndex];
    const worksheet = excelWorkbook.Sheets[sheetName];
    
    if (!worksheet) {
      return;
    }

    const html = XLSX.utils.sheet_to_html(worksheet, {
      id: 'excel-table',
      editable: false,
    });

    const styledHtml = `
      <div style="overflow-x: auto; width: 100%;">
        <style>
          #excel-table {
            border-collapse: collapse;
            width: 100%;
            font-size: 14px;
          }
          #excel-table td, #excel-table th {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          #excel-table th {
            background-color: #f2f2f2;
            font-weight: 600;
          }
          #excel-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
        </style>
        ${html}
      </div>
    `;
    
    setContent(styledHtml);
  }, [excelWorkbook, excelSheetNames, currentSheetIndex]);

  const handleClose = () => {
    dispatch(setViewingFile(null));
  };

  const handleSheetChange = (index: number) => {
    setCurrentSheetIndex(index);
  };

  if (!file) {
    return null;
  }

  const fileType = file.type;
  const isPdf = fileType === 'application/pdf';
  const isText = fileType === 'text/plain' || fileType === 'text/csv' || fileType === 'application/csv';
  const isExcel = fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  return (
    <Dialog open={!!viewingFileId} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] p-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b h-14 flex-shrink-0">
          <h2 className="text-lg font-semibold truncate flex-1">{file.name}</h2>
        </div>
        {isExcel && excelSheetNames.length > 1 && (
          <div className="border-b px-4 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto">
              {excelSheetNames.map((sheetName, index) => (
                <button
                  key={sheetName}
                  onClick={() => handleSheetChange(index)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    currentSheetIndex === index
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  {sheetName}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-auto p-4 pt-0 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full w-full gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-muted-foreground">Loading file...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full w-full">
              <p className="text-destructive">{error}</p>
            </div>
          ) : content ? (
            <>
              {isPdf ? (
                <div className="w-full h-full min-h-[480px] flex items-center justify-center">
                  <iframe src={content} className="w-full h-full min-h-[480px] border-0" />
                </div>
              ) : isText ? (
                <div className="w-full max-w-4xl mx-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-6 rounded-lg shadow-sm">
                    {content}
                  </pre>
                </div>
              ) : (
                <div className="w-full max-w-5xl mx-auto">
                  <div 
                    className="prose max-w-none bg-background p-6 rounded-lg shadow-sm"
                    style={{
                      fontFamily: 'inherit',
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

