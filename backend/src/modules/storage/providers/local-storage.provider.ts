import { Injectable } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { access, mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Readable } from 'node:stream';

import { storageConfig } from '../config/storage.config';
import { FileStorageProvider } from './file-storage.interface';

@Injectable()
export class LocalStorageProvider implements FileStorageProvider {
    private readonly storageRoot = storageConfig.storageRoot;

    async upload(file: Buffer, fileName: string, directory: string): Promise<string> {
        const resolvedDirectory = await this.resolveDirectory(directory);
        const targetPath = join(resolvedDirectory, fileName);
        await writeFile(targetPath, file, { mode: storageConfig.directoryPermissions });
        return targetPath;
    }

    async download(fileName: string, directory: string): Promise<Readable> {
        const targetPath = await this.getAbsolutePath(fileName, directory);
        return createReadStream(targetPath);
    }

    async delete(fileName: string, directory: string): Promise<void> {
        const targetPath = await this.getAbsolutePath(fileName, directory);
        await rm(targetPath, { force: true });
    }

    async exists(fileName: string, directory: string): Promise<boolean> {
        const targetPath = await this.getAbsolutePath(fileName, directory);

        try {
            await access(targetPath);
            return true;
        } catch {
            return false;
        }
    }

    async getAbsolutePath(fileName: string, directory: string): Promise<string> {
        const resolvedDirectory = await this.resolveDirectory(directory);
        return resolve(join(resolvedDirectory, fileName));
    }

    async createDirectory(directory: string): Promise<void> {
        await this.resolveDirectory(directory);
    }

    private async resolveDirectory(directory: string): Promise<string> {
        const normalizedDirectory = directory.startsWith('/') ? directory : join(this.storageRoot, directory);
        const resolvedDirectory = resolve(normalizedDirectory);

        await mkdir(resolvedDirectory, { recursive: true, mode: storageConfig.directoryPermissions });
        return resolvedDirectory;
    }
}
