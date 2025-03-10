import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../schemas/file.schema';
import { DeleteFileUseCase } from '../../application/use-cases/delete-file.use-case';

/**
 * Service to clean up temporary files that were not activated
 * Runs every hour to delete files that are more than 40 minutes old and still temporal
 */
@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);
  
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
    private readonly deleteFileUseCase: DeleteFileUseCase
  ) {}
  
  /**
   * Run every hour to clean up old temporal files
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupTemporalFiles() {
    try {
      this.logger.log('Starting cleanup of temporal files');
      
      // Calculate the timestamp for 40 minutes ago
      const olderThan = new Date();
      olderThan.setMinutes(olderThan.getMinutes() - 40);
      
      // Find temporal files older than 40 minutes
      const oldFiles = await this.fileModel.find({
        status: 'temporal',
        createdAt: { $lt: olderThan }
      });
      
      if (oldFiles.length === 0) {
        this.logger.log('No temporal files to clean up');
        return;
      }
      
      this.logger.log(`Found ${oldFiles.length} temporal files to clean up`);
      
      // Delete each file
      let successCount = 0;
      let errorCount = 0;
      
      for (const file of oldFiles) {
        try {
          await this.deleteFileUseCase.execute(file._id.toString());
          successCount++;
        } catch (error) {
          errorCount++;
          this.logger.error(`Error deleting file ${file._id}: ${error.message}`, error.stack);
        }
      }
      
      this.logger.log(`Cleanup completed: ${successCount} files deleted, ${errorCount} errors`);
    } catch (error) {
      this.logger.error(`Error during file cleanup: ${error.message}`, error.stack);
    }
  }
}