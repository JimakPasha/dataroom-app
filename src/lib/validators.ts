export const validateFileName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'File name cannot be empty' };
  }
  if (name.length > 255) {
    return { valid: false, error: 'File name is too long (max 255 characters)' };
  }
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { valid: false, error: 'File name contains invalid characters' };
  }
  return { valid: true };
};

export const validateFolderName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Folder name cannot be empty' };
  }
  if (name.length > 255) {
    return { valid: false, error: 'Folder name is too long (max 255 characters)' };
  }
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { valid: false, error: 'Folder name contains invalid characters' };
  }
  return { valid: true };
};

export const validateFileType = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain', // .txt
    'text/csv', // .csv
    'application/csv', // .csv alternative
  ];

  if (file.type && allowedTypes.includes(file.type)) {
    return { valid: true };
  }

  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.pdf', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
  const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (hasAllowedExtension) {
    return { valid: true };
  }

  return { 
    valid: false, 
    error: 'Only PDF, Word (.docx), Excel (.xls, .xlsx), TXT, and CSV files are allowed' 
  };
};

export const validateFileSize = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  return { valid: true };
};

