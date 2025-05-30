import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Express } from 'express';
import { unlink } from 'fs/promises';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const unique = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        console.log('Received file with mimetype:', file.mimetype);

        const isImageMimetype = file.mimetype.startsWith('image/');
        const isHeicHeifMimetype = ['image/heic', 'image/heif'].includes(file.mimetype);
        const isOctetStream = file.mimetype === 'application/octet-stream';

        if (!isImageMimetype && !isHeicHeifMimetype && !isOctetStream) {
          return cb(new Error('Only image files are allowed'), false);
        }

        if (isOctetStream) {
          const ext = extname(file.originalname).toLowerCase();
          if (!['.heic', '.heif'].includes(ext)) {
            return cb(new Error('Unsupported file format'), false);
          }
        }

        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('File is missing');
    }

    try {
      console.log('Processing file:', {
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
        path: file.path
      });

      const { imageUrl, publicId } =
        await this.cloudinaryService.uploadImageFromPath(file.path);
      await unlink(file.path);
      return { imageUrl, publicId };
    } catch (error) {
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);
    }
  }
}
