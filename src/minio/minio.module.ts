import { Module } from '@nestjs/common';
import { MinioConfigService } from './minio-config.service';

@Module({
  providers: [MinioConfigService],
  exports: [MinioConfigService],
})
export class MinioModule {}
