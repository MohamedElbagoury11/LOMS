import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../audit/audit.module';
import { Case } from '../cases/entities/case.entity';
import { Client } from '../clients/entities/client.entity';
import { StorageModule } from '../storage/storage.module';
import { DocumentsController } from './controllers/documents.controller';
import { DocumentShare } from './entities/document-share.entity';
import { Document } from './entities/document.entity';
import { DocumentSharesController } from './controllers/document-shares.controller';
import { DocumentsService } from './services/documents.service';
import { DocumentSharesService } from './services/document-shares.service';

@Module({
    imports: [TypeOrmModule.forFeature([Document, DocumentShare, Client, Case]), AuditModule, StorageModule],
    controllers: [DocumentsController, DocumentSharesController],
    providers: [DocumentsService, DocumentSharesService],
    exports: [DocumentsService, DocumentSharesService],
})
export class DocumentsModule {}
