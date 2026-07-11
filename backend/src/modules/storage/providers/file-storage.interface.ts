import { Readable } from 'node:stream';

export interface FileStorageProvider {
    upload(file: Buffer, fileName: string, directory: string): Promise<string>;
    download(fileName: string, directory: string): Promise<Readable>;
    delete(fileName: string, directory: string): Promise<void>;
    exists(fileName: string, directory: string): Promise<boolean>;
    getAbsolutePath(fileName: string, directory: string): Promise<string>;
    createDirectory(directory: string): Promise<void>;
}
