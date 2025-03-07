import { FileTicketEntity } from '../entities/file-ticket.entity';

/**
 * Token para inyección de dependencia del proveedor de archivos
 */
export const FILE_PROVIDER = 'FILE_PROVIDER';

/**
 * Interface for file provider operations
 */
export interface FileProvider {
  /**
   * Gets file information
   * @param fileId The file ID
   */
  getFile(fileId: string): Promise<Buffer>;

  /**
   * Gets multiple files information
   * @param fileIds The file IDs
   */
  getFiles(fileIds: string[]): Promise<{ id: string, name: string, mimetype: string }[]>;

  /**
   * Activates files (marks them as in use)
   * @param fileIds The file IDs to activate
   */
  activateFiles(fileIds: string[]): Promise<void>;

  /**
   * Checks if a file exists and is accessible
   * @param fileId The file ID
   */
  fileExists(fileId: string): Promise<boolean>;
}