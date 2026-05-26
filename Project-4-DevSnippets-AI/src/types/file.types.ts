// ============================================================
// DevNest — File Types
// ============================================================

export type FileType = 'image' | 'text' | 'document' | 'template' | 'backup';

export interface DevNestFile {
  id: string;
  snippetId?: string;   // optional — file may not be attached to a snippet
  folderId?: string;
  fileName: string;
  filePath: string;     // documentDirectory relative path
  fileType: FileType;
  mimeType?: string;
  sizeBytes?: number;
  createdAt: string;
}

export interface FileRow {
  id: string;
  snippetId: string | null;
  folderId: string | null;
  fileName: string;
  filePath: string;
  fileType: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

export interface DevNestFolder {
  id: string;
  name: string;
  color: string;        // Hex color for folder icon
  icon: string;         // Lucide icon name
  snippetCount: number;
  createdAt: string;
}

export interface FolderRow {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}
