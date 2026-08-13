import { Global, Module } from '@nestjs/common'
import { StorageService } from './storage.service'

/**
 * Global so any feature module can inject StorageService for file persistence
 * without importing this module explicitly.
 */
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
