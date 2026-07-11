import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ClientsController } from './controllers/clients.controller';
import { ClientAddress } from './entities/client-address.entity';
import { ClientAttachment } from './entities/client-attachment.entity';
import { ClientContact } from './entities/client-contact.entity';
import { ClientNote } from './entities/client-note.entity';
import { Client } from './entities/client.entity';
import { ClientsService } from './services/clients.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Client, ClientContact, ClientAddress, ClientNote, ClientAttachment]),
        AuthModule,
        AuthorizationModule,
        AuditModule,
    ],
    providers: [ClientsService],
    controllers: [ClientsController],
    exports: [ClientsService],
})
export class ClientsModule {}
