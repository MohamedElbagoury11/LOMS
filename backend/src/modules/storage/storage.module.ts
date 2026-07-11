import { Module } from '@nestjs/common';

import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageService } from './services/storage.service';

@Module({
    providers: [
        LocalStorageProvider,
        StorageService,
        {
            provide: 'FILE_STORAGE_PROVIDER',
            useExisting: LocalStorageProvider,
        },
    ],
    exports: [StorageService, 'FILE_STORAGE_PROVIDER'],
})
export class StorageModule {}
