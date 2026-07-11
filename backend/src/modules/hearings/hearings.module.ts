import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../audit/audit.module';
import { Case } from '../cases/entities/case.entity';
import { HearingsController } from './controllers/hearings.controller';
import { HearingAttachment } from './entities/hearing-attachment.entity';
import { HearingNote } from './entities/hearing-note.entity';
import { Hearing } from './entities/hearing.entity';
import { HearingsService } from './services/hearings.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Hearing, HearingNote, HearingAttachment, Case]),
        AuditModule,
    ],
    controllers: [HearingsController],
    providers: [HearingsService],
    exports: [HearingsService, TypeOrmModule],
})
export class HearingsModule {}
