/** Nest Imports */
import { Module } from '@nestjs/common';
/** Servicio Cache Manager */
import { CacheManagerService } from './service';

@Module({
  imports: [],
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}
