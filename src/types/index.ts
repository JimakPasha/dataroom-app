export interface DataRoom {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  dataRoomId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FileType = 
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  | 'application/vnd.ms-excel' // .xls
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
  | 'text/plain' // .txt
  | 'text/csv' // .csv
  | 'application/csv'; // .csv alternative

export interface File {
  id: string;
  name: string;
  folderId: string | null;
  dataRoomId: string;
  type: FileType;
  size: number;
  content: ArrayBuffer;
  createdAt: Date;
  updatedAt: Date;
}



