import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CasesController } from './controllers/cases.controller';
import { CaseAttachment } from './entities/case-attachment.entity';
import { CaseClient } from './entities/case-client.entity';
import { CaseLawyer } from './entities/case-lawyer.entity';
import { CaseNote } from './entities/case-note.entity';
import { CaseOppositeParty } from './entities/case-opposite-party.entity';
import { Case } from './entities/case.entity';
import { CasesService } from './services/cases.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Case, CaseClient, CaseLawyer, CaseOppositeParty, CaseNote, CaseAttachment]),
        AuditModule,
        AuthModule,
        AuthorizationModule,
    ],
    providers: [CasesService],
    controllers: [CasesController],
    exports: [CasesService, TypeOrmModule],
})
export class CasesModule { }
