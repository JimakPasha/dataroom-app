import type { DataRoom, Folder, File, FileType } from '@/types';
import { db } from './db';

/**
 * Loads a file from the public/mock-files directory and returns it as an ArrayBuffer
 */
const loadFileAsArrayBuffer = async (filename: string): Promise<ArrayBuffer> => {
  const response = await fetch(`/mock-files/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load file: ${filename}`);
  }
  return await response.arrayBuffer();
};

export const generateMockData = async (): Promise<void> => {
  const now = new Date();
  const roomId = crypto.randomUUID();

  const dataRoom: DataRoom = {
    id: roomId,
    name: 'Demo Features',
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  };

  await db.createDataRoom(dataRoom);

  const fileContents = {
    'example.txt': await loadFileAsArrayBuffer('example.txt'),
    'example_short.txt': await loadFileAsArrayBuffer('example_short.txt'),
    'pdf-test.pdf': await loadFileAsArrayBuffer('pdf-test.pdf'),
    'file-sample_100kB.docx': await loadFileAsArrayBuffer('file-sample_100kB.docx'),
    'customers-100.csv': await loadFileAsArrayBuffer('customers-100.csv'),
    'tests-example.xls': await loadFileAsArrayBuffer('tests-example.xls'),
  };

  const folders: Folder[] = [];
  const files: File[] = [];

  const createFolder = (name: string, parentId: string | null): string => {
    const folderId = crypto.randomUUID();
    folders.push({
      id: folderId,
      name,
      parentId,
      dataRoomId: roomId,
      createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
    return folderId;
  };

  const createFile = (
    name: string,
    type: FileType,
    content: ArrayBuffer,
    folderId: string | null
  ): void => {
    files.push({
      id: crypto.randomUUID(),
      name,
      folderId,
      dataRoomId: roomId,
      type,
      size: content.byteLength,
      content,
      createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  };

  const rootFolder1 = createFolder('Documents', null);
  const rootFolder2 = createFolder('Financial Reports', null);
  const rootFolder3 = createFolder('Legal Contracts', null);
  const rootFolder4 = createFolder('Very Deep Nested Structure Test', null);
  const rootFolder5 = createFolder('Files with Long Names Test', null);
  const rootFolder6 = createFolder('Duplicate Names Test', null);

  createFile('readme.txt', 'text/plain', fileContents['example.txt'], null);
  createFile('quick-start.txt', 'text/plain', fileContents['example_short.txt'], null);
  createFile('large-text-file.txt', 'text/plain', fileContents['example.txt'], null);

  const docsSub1 = createFolder('Project Alpha', rootFolder1);
  const docsSub2 = createFolder('Project Beta', rootFolder1);
  const docsSub3 = createFolder('Archive', rootFolder1);

  createFile('project-plan.txt', 'text/plain', fileContents['example.txt'], docsSub1);
  createFile('meeting-notes.txt', 'text/plain', fileContents['example_short.txt'], docsSub1);
  createFile('requirements.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], docsSub1);
  createFile('requirements (1).docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], docsSub1);

  createFile('specification.pdf', 'application/pdf', fileContents['pdf-test.pdf'], docsSub2);
  createFile('design-doc.pdf', 'application/pdf', fileContents['pdf-test.pdf'], docsSub2);
  createFile('presentation.pdf', 'application/pdf', fileContents['pdf-test.pdf'], docsSub2);

  const archiveSub1 = createFolder('2023', docsSub3);
  createFolder('2024', docsSub3);
  createFile('old-document.txt', 'text/plain', fileContents['example.txt'], archiveSub1);
  createFile('old-document (1).txt', 'text/plain', fileContents['example_short.txt'], archiveSub1);

  const financialSub1 = createFolder('Q1 Reports', rootFolder2);
  const financialSub2 = createFolder('Q2 Reports', rootFolder2);
  const financialSub3 = createFolder('Annual Summary', rootFolder2);

  createFile('revenue.csv', 'text/csv', fileContents['customers-100.csv'], financialSub1);
  createFile('expenses.csv', 'text/csv', fileContents['customers-100.csv'], financialSub1);
  createFile('budget.xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], financialSub1);
  createFile('budget (1).xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], financialSub1);
  createFile('budget (2).xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], financialSub1);

  createFile('q2-summary.pdf', 'application/pdf', fileContents['pdf-test.pdf'], financialSub2);
  createFile('analysis.xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], financialSub2);

  createFile('annual-report.pdf', 'application/pdf', fileContents['pdf-test.pdf'], financialSub3);
  createFile('financial-statement.pdf', 'application/pdf', fileContents['pdf-test.pdf'], financialSub3);

  const legalSub1 = createFolder('NDAs', rootFolder3);
  const legalSub2 = createFolder('Contracts', rootFolder3);
  const legalSub3 = createFolder('Agreements', rootFolder3);

  createFile('nda-template.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], legalSub1);
  createFile('nda-template (1).docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], legalSub1);
  createFile('client-contract.pdf', 'application/pdf', fileContents['pdf-test.pdf'], legalSub2);
  createFile('vendor-agreement.pdf', 'application/pdf', fileContents['pdf-test.pdf'], legalSub2);
  createFile('partnership-agreement.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], legalSub3);

  let deepFolder = rootFolder4;
  for (let i = 1; i <= 8; i++) {
    deepFolder = createFolder(`Level ${i} - Deep Nesting`, deepFolder);
    if (i === 4) {
      createFile(`file-at-level-${i}.txt`, 'text/plain', fileContents['example.txt'], deepFolder);
    }
    if (i === 8) {
      createFile('deep-file.txt', 'text/plain', fileContents['example.txt'], deepFolder);
      createFile('deep-file (1).txt', 'text/plain', fileContents['example_short.txt'], deepFolder);
    }
  }

  createFile('This is a file with a very long name that tests how the UI handles long file names and truncation.txt', 'text/plain', fileContents['example_short.txt'], rootFolder5);
  createFile('Another file with an extremely long name that should be truncated properly in the UI to ensure good user experience.txt', 'text/plain', fileContents['example_short.txt'], rootFolder5);
  
  const longNameFolder = createFolder('This is a folder with a very long name that tests folder name display and truncation', rootFolder5);
  createFile('file-in-long-folder.txt', 'text/plain', fileContents['example_short.txt'], longNameFolder);

  createFile('duplicate.txt', 'text/plain', fileContents['example.txt'], rootFolder6);
  createFile('duplicate (1).txt', 'text/plain', fileContents['example_short.txt'], rootFolder6);
  createFile('duplicate (2).txt', 'text/plain', fileContents['example.txt'], rootFolder6);
  createFile('duplicate.pdf', 'application/pdf', fileContents['pdf-test.pdf'], rootFolder6);
  createFile('duplicate (1).pdf', 'application/pdf', fileContents['pdf-test.pdf'], rootFolder6);

  const mixedFolder = createFolder('Mixed File Types', null);
  createFile('text-file.txt', 'text/plain', fileContents['example.txt'], mixedFolder);
  createFile('csv-data.csv', 'text/csv', fileContents['customers-100.csv'], mixedFolder);
  createFile('document.pdf', 'application/pdf', fileContents['pdf-test.pdf'], mixedFolder);
  createFile('word-doc.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], mixedFolder);
  createFile('excel-sheet.xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], mixedFolder);

  const smallFilesFolder = createFolder('Small Files', null);
  createFile('tiny.txt', 'text/plain', fileContents['example_short.txt'], smallFilesFolder);
  createFile('small.txt', 'text/plain', fileContents['example_short.txt'], smallFilesFolder);

  const largeFilesFolder = createFolder('Larger Files', null);
  createFile('medium.txt', 'text/plain', fileContents['example.txt'], largeFilesFolder);
  createFile('large.txt', 'text/plain', fileContents['example.txt'], largeFilesFolder);

  const csvFolder = createFolder('CSV Data Files', null);
  createFile('employees.csv', 'text/csv', fileContents['customers-100.csv'], csvFolder);
  createFile('products.csv', 'text/csv', fileContents['customers-100.csv'], csvFolder);
  createFile('sales-data.csv', 'text/csv', fileContents['customers-100.csv'], csvFolder);

  const excelFolder = createFolder('Excel Spreadsheets', null);
  createFile('budget-2024.xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], excelFolder);
  createFile('inventory.xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], excelFolder);
  createFile('sales-report.xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], excelFolder);
  createFile('budget-2024 (1).xls', 'application/vnd.ms-excel', fileContents['tests-example.xls'], excelFolder);

  const wordFolder = createFolder('Word Documents', null);
  createFile('report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], wordFolder);
  createFile('memo.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], wordFolder);
  createFile('letter.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], wordFolder);
  createFile('report (1).docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileContents['file-sample_100kB.docx'], wordFolder);

  const pdfFolder = createFolder('PDF Documents', null);
  createFile('manual.pdf', 'application/pdf', fileContents['pdf-test.pdf'], pdfFolder);
  createFile('guide.pdf', 'application/pdf', fileContents['pdf-test.pdf'], pdfFolder);
  createFile('tutorial.pdf', 'application/pdf', fileContents['pdf-test.pdf'], pdfFolder);
  createFile('manual (1).pdf', 'application/pdf', fileContents['pdf-test.pdf'], pdfFolder);

  const nestedTestFolder = createFolder('Nested Structure Test', null);
  let nestedLevel = nestedTestFolder;
  for (let i = 1; i <= 5; i++) {
    nestedLevel = createFolder(`Nested Level ${i}`, nestedLevel);
    if (i === 2 || i === 5) {
      createFile(`file-level-${i}.txt`, 'text/plain', fileContents['example.txt'], nestedLevel);
    }
  }

  const shortNamesFolder = createFolder('Short Names', null);
  createFile('a.txt', 'text/plain', fileContents['example_short.txt'], shortNamesFolder);
  createFile('b.csv', 'text/csv', fileContents['customers-100.csv'], shortNamesFolder);
  createFile('c.pdf', 'application/pdf', fileContents['pdf-test.pdf'], shortNamesFolder);

  for (const folder of folders) {
    await db.createFolder(folder);
  }

  for (const file of files) {
    await db.createFile(file);
  }

  const emptyRoom: DataRoom = {
    id: crypto.randomUUID(),
    name: 'Empty Room',
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
  };

  await db.createDataRoom(emptyRoom);

  await db.setMetadata('mocksLoaded', 'true');
};

const MOCKS_LOADED_KEY = 'mocksLoaded';

export const shouldLoadMocks = async (): Promise<boolean> => {
  const mocksLoaded = await db.getMetadata(MOCKS_LOADED_KEY);
  if (mocksLoaded === 'true') {
    return false;
  }
  
  if (mocksLoaded === 'loading') {
    return false;
  }
  
  const dataRooms = await db.getAllDataRooms();
  const demoRooms = dataRooms.filter((dr) => dr.name === 'Demo Features');
  const emptyRooms = dataRooms.filter((dr) => dr.name === 'Empty Room');
  
  if (demoRooms.length === 1 && emptyRooms.length === 1) {
    await db.setMetadata(MOCKS_LOADED_KEY, 'true');
    return false;
  }
  
  if (demoRooms.length >= 1 && emptyRooms.length >= 1) {
    await db.setMetadata(MOCKS_LOADED_KEY, 'true');
    return false;
  }
  
  if (dataRooms.length === 0) {
    await db.setMetadata(MOCKS_LOADED_KEY, 'loading');
    return true;
  }
  
  return false;
};
