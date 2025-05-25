import { ApiProperty } from '@nestjs/swagger';

export class UploadResultDto {
  @ApiProperty({
    description: 'Public URL of the uploaded image',
    example: 'http://localhost:9000/images/uploads/abc123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'File name in storage',
    example: 'uploads/abc123.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'my-photo.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  mimeType: string;
}

export class ImageMetadataDto {
  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'Last modified date',
    example: '2024-01-01T00:00:00.000Z',
  })
  lastModified: Date;

  @ApiProperty({
    description: 'Content type',
    example: 'image/jpeg',
  })
  contentType: string;
}

export class ImageListResponseDto {
  @ApiProperty({
    description: 'List of image URLs',
    type: [String],
    example: [
      'http://localhost:9000/images/uploads/abc123.jpg',
      'http://localhost:9000/images/uploads/def456.png',
    ],
  })
  images: string[];

  @ApiProperty({
    description: 'Total count of images',
    example: 2,
  })
  count: number;
}

export class MultipleUploadResponseDto {
  @ApiProperty({
    description: 'List of uploaded images',
    type: [UploadResultDto],
  })
  uploaded: UploadResultDto[];

  @ApiProperty({
    description: 'Total count of uploaded images',
    example: 3,
  })
  count: number;
}
