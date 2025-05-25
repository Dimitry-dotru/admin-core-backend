import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MinioConfigService } from '../minio/minio-config.service';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

interface UploadResult {
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
}

// Helper function for error handling
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Helper function to check if error is HttpException
function isHttpException(error: unknown): error is HttpException {
  return error instanceof HttpException;
}

@Injectable()
export class ImagesService {
  constructor(private readonly minioConfigService: MinioConfigService) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'uploads',
    resize?: { width?: number; height?: number },
  ): Promise<UploadResult> {
    try {
      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        throw new HttpException(
          'Only image files are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      let processedBuffer = file.buffer;
      let processedSize = file.size;

      // Process image if resize options provided
      if (resize) {
        try {
          const sharpInstance = sharp(file.buffer);

          if (resize.width || resize.height) {
            sharpInstance.resize(resize.width, resize.height, {
              fit: 'inside',
              withoutEnlargement: true,
            });
          }

          // Optimize image based on format
          const format = file.mimetype.split('/')[1];
          if (format === 'jpeg' || format === 'jpg') {
            sharpInstance.jpeg({ quality: 85 });
          } else if (format === 'png') {
            sharpInstance.png({ quality: 85 });
          } else if (format === 'webp') {
            sharpInstance.webp({ quality: 85 });
          }

          processedBuffer = await sharpInstance.toBuffer();
          processedSize = processedBuffer.length;
        } catch (sharpError) {
          console.error(
            'Error processing image with Sharp:',
            getErrorMessage(sharpError),
          );
          // Continue with original buffer if Sharp processing fails
          processedBuffer = file.buffer;
          processedSize = file.size;
        }
      }

      // Upload to MinIO
      const minioClient = this.minioConfigService.getClient();
      const bucketName = this.minioConfigService.getBucketName();

      await minioClient.putObject(
        bucketName,
        fileName,
        processedBuffer,
        processedSize,
        {
          'Content-Type': file.mimetype,
          'Cache-Control': 'max-age=31536000',
        },
      );

      const publicUrl = this.minioConfigService.getPublicUrl(fileName);

      return {
        url: publicUrl,
        fileName,
        originalName: file.originalname,
        size: processedSize,
        mimeType: file.mimetype,
      } as UploadResult;
    } catch (error) {
      console.error('Error uploading image:', getErrorMessage(error));

      // Re-throw HttpExceptions as-is
      if (isHttpException(error)) {
        throw error;
      }

      // Wrap other errors
      throw new HttpException(
        `Failed to upload image: ${getErrorMessage(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateImage(
    oldFileName: string,
    file: Express.Multer.File,
    folder: string = 'uploads',
    resize?: { width?: number; height?: number },
  ): Promise<UploadResult> {
    try {
      // Delete old image if it exists
      if (oldFileName && oldFileName.trim() !== '') {
        try {
          await this.deleteImage(oldFileName);
        } catch (deleteError) {
          console.warn(
            'Failed to delete old image:',
            getErrorMessage(deleteError),
          );
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      return await this.uploadImage(file, folder, resize);
    } catch (error) {
      console.error('Error updating image:', getErrorMessage(error));

      // Re-throw HttpExceptions as-is
      if (isHttpException(error)) {
        throw error;
      }

      throw new HttpException(
        `Failed to update image: ${getErrorMessage(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteImage(fileName: string): Promise<boolean> {
    try {
      if (!fileName || fileName.trim() === '') {
        throw new HttpException(
          'File name is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const minioClient = this.minioConfigService.getClient();
      const bucketName = this.minioConfigService.getBucketName();

      // Extract filename from URL if full URL is provided
      let cleanFileName = fileName;

      // If it's a full URL, extract the path after bucket name
      if (fileName.includes('http')) {
        const url = new URL(fileName);
        const pathParts = url.pathname.split('/');
        // Remove empty string and bucket name, keep the rest
        cleanFileName = pathParts.slice(2).join('/');
      } else if (fileName.includes('/')) {
        // If it's already a path, use last two parts (folder/filename)
        const parts = fileName.split('/');
        cleanFileName =
          parts.length >= 2 ? parts.slice(-2).join('/') : fileName;
      }

      await minioClient.removeObject(bucketName, cleanFileName);
      return true;
    } catch (error) {
      console.error('Error deleting image:', getErrorMessage(error));

      // Check if it's a "not found" error, which is acceptable
      if (error instanceof Error && error.message.includes('NoSuchKey')) {
        console.warn('Image not found, considering deletion successful');
        return true;
      }

      throw new HttpException(
        `Failed to delete image: ${getErrorMessage(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getImageUrl(fileName: string): Promise<string> {
    try {
      if (!fileName || fileName.trim() === '') {
        throw new HttpException(
          'File name is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const minioClient = this.minioConfigService.getClient();
      const bucketName = this.minioConfigService.getBucketName();

      // Generate presigned URL (valid for 7 days)
      const presignedUrl = await minioClient.presignedGetObject(
        bucketName,
        fileName,
        7 * 24 * 60 * 60, // 7 days in seconds
      );

      return presignedUrl;
    } catch (error) {
      console.error('Error generating image URL:', getErrorMessage(error));

      throw new HttpException(
        `Failed to generate image URL: ${getErrorMessage(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listImages(folder: string = 'uploads'): Promise<string[]> {
    try {
      const minioClient = this.minioConfigService.getClient();
      const bucketName = this.minioConfigService.getBucketName();

      const objectsStream = minioClient.listObjects(bucketName, folder, true);
      const objects: string[] = [];

      return new Promise<string[]>((resolve, reject) => {
        objectsStream.on('data', (obj) => {
          if (obj.name) {
            objects.push(this.minioConfigService.getPublicUrl(obj.name));
          }
        });

        objectsStream.on('error', (streamError: Error) => {
          console.error('Stream error:', streamError.message);
          reject(
            new HttpException(
              `Failed to list images: ${streamError.message}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        });

        objectsStream.on('end', () => {
          resolve(objects);
        });
      });
    } catch (error) {
      console.error('Error listing images:', getErrorMessage(error));

      throw new HttpException(
        `Failed to list images: ${getErrorMessage(error)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Additional utility methods
  async imageExists(fileName: string): Promise<boolean> {
    try {
      const minioClient = this.minioConfigService.getClient();
      const bucketName = this.minioConfigService.getBucketName();

      await minioClient.statObject(bucketName, fileName);
      return true;
    } catch (error) {
      // If error is "not found", return false
      if (error instanceof Error && error.message.includes('NoSuchKey')) {
        return false;
      }
      // For other errors, log and return false
      console.error('Error checking image existence:', getErrorMessage(error));
      return false;
    }
  }

  async getImageMetadata(fileName: string): Promise<{
    size: number;
    lastModified: Date;
    contentType: string;
  } | null> {
    try {
      const minioClient = this.minioConfigService.getClient();
      const bucketName = this.minioConfigService.getBucketName();

      const stat = await minioClient.statObject(bucketName, fileName);

      return {
        size: stat.size,
        lastModified: stat.lastModified,
        contentType:
          (stat.metaData as Record<string, string>)['content-type'] ||
          'application/octet-stream',
      };
    } catch (error) {
      console.error('Error getting image metadata:', getErrorMessage(error));
      return null;
    }
  }
}
