import {
  Controller,
  Post,
  Delete,
  Put,
  Get,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MultipleUploadResponseDto, UploadResultDto } from './dto/image.dto';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

type CbType = (error: Error | null, acceptFile: boolean) => void;

const multerOptions: MulterOptions = {
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: CbType) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image files are allowed!'), false);
    }
  },
};

@ApiTags('images')
@Controller('images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiOperation({ summary: 'Upload a new image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
        folder: {
          type: 'string',
          description: 'Folder to upload image to',
          default: 'uploads',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            fileName: { type: 'string' },
            originalName: { type: 'string' },
            size: { type: 'number' },
            mimeType: { type: 'string' },
          },
        },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<UploadResultDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.imagesService.uploadImage(
      file,
      folder || 'uploads',
    );

    console.log('Result response:', result);

    return result;
  }

  @Put('update/:fileName')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiOperation({ summary: 'Update an existing image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'fileName', description: 'Current image file name' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'New image file',
        },
        folder: {
          type: 'string',
          description: 'Folder to upload new image to',
          default: 'uploads',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            fileName: { type: 'string' },
            originalName: { type: 'string' },
            size: { type: 'number' },
            mimeType: { type: 'string' },
          },
        },
      },
    },
  })
  async updateImage(
    @Param('fileName') fileName: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<UploadResultDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.imagesService.updateImage(
      decodeURIComponent(fileName),
      file,
      folder || 'uploads',
    );

    return result;
  }

  @Delete(':fileName')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiParam({ name: 'fileName', description: 'Image file name to delete' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async deleteImage(@Param('fileName') fileName: string) {
    await this.imagesService.deleteImage(decodeURIComponent(fileName));

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }

  @Get('url/:fileName')
  @ApiOperation({ summary: 'Get presigned URL for an image' })
  @ApiParam({ name: 'fileName', description: 'Image file name' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string' },
          },
        },
      },
    },
  })
  async getImageUrl(@Param('fileName') fileName: string) {
    const url = await this.imagesService.getImageUrl(
      decodeURIComponent(fileName),
    );

    return {
      success: true,
      message: 'Presigned URL generated successfully',
      data: { url },
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'List all images in a folder' })
  @ApiQuery({ name: 'folder', required: false, description: 'Folder name' })
  @ApiResponse({
    status: 200,
    description: 'Images listed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            images: {
              type: 'array',
              items: { type: 'string' },
            },
            count: { type: 'number' },
          },
        },
      },
    },
  })
  async listImages(@Query('folder') folder?: string) {
    const images = await this.imagesService.listImages(folder || 'uploads');

    return {
      success: true,
      message: 'Images listed successfully',
      data: {
        images,
        count: images.length,
      },
    };
  }

  @Post('upload-multiple')
  @UseInterceptors(FileInterceptor('images', multerOptions))
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Multiple image files to upload',
        },
        folder: {
          type: 'string',
          description: 'Folder to upload images to',
          default: 'uploads',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            uploaded: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  fileName: { type: 'string' },
                  originalName: { type: 'string' },
                  size: { type: 'number' },
                  mimeType: { type: 'string' },
                },
              },
            },
            count: { type: 'number' },
          },
        },
      },
    },
  })
  async uploadMultipleImages(
    @UploadedFile() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ): Promise<MultipleUploadResponseDto> {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const uploadPromises = files.map((file) =>
      this.imagesService.uploadImage(file, folder || 'uploads'),
    );

    const results = await Promise.all(uploadPromises);

    return {
      uploaded: results,
      count: results.length,
    };
  }
}
