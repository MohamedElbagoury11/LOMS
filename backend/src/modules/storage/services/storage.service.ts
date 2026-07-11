import { Injectable } from '@nestjs/common';
import { Readable } from 'node:stream';

import { FileStorageProvider } from '../providers/file-storage.interface';
import { StoredFile } from '../types/stored-file.interface';

@Injectable()
export class StorageService {
    constructor(private readonly fileStorageProvider: FileStorageProvider) {}

    async upload(file: Buffer, fileName: string, directory: string): Promise<StoredFile> {
        const absolutePath = await this.fileStorageProvider.upload(file, fileName, directory);

        return {
            fileName,
            directory,
            absolutePath,
            size: file.length,
            createdAt: new Date(),
        };
    }

    async download(fileName: string, directory: string): Promise<Readable> {
        return this.fileStorageProvider.download(fileName, directory);
    }

    async delete(fileName: string, directory: string): Promise<void> {
        await this.fileStorageProvider.delete(fileName, directory);
    }

    async exists(fileName: string, directory: string): Promise<boolean> {
        return this.fileStorageProvider.exists(fileName, directory);
    }

    async getAbsolutePath(fileName: string, directory: string): Promise<string> {
        return this.fileStorageProvider.getAbsolutePath(fileName, directory);
    }

    async createDirectory(directory: string): Promise<void> {
        await this.fileStorageProvider.createDirectory(directory);
    }
}
