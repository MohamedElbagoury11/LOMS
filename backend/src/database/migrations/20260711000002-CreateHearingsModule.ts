import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHearingsModule20260711000002 implements MigrationInterface {
    name = 'CreateHearingsModule20260711000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`hearings\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`hearing_number\` varchar(30) NOT NULL, \`case_id\` varchar(36) NOT NULL, \`court_name\` varchar(255) NULL, \`chamber\` varchar(255) NULL, \`hearing_date\` date NULL, \`hearing_time\` time NULL, \`status\` enum ('scheduled','completed','cancelled','postponed') NOT NULL DEFAULT 'scheduled', \`result\` enum ('pending','adjourned','granted','dismissed','settled','other') NOT NULL DEFAULT 'pending', \`judge_name\` varchar(255) NULL, \`notes\` text NULL, \`next_hearing_date\` date NULL, INDEX \`idx_hearings_case_id\` (\`case_id\`), INDEX \`idx_hearings_hearing_date\` (\`hearing_date\`), INDEX \`idx_hearings_status\` (\`status\`), INDEX \`idx_hearings_result\` (\`result\`), INDEX \`idx_hearings_created_at\` (\`created_at\`), UNIQUE INDEX \`UQ_hearings_hearing_number\` (\`hearing_number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`hearing_notes\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`hearing_id\` varchar(36) NOT NULL, \`content\` text NOT NULL, INDEX \`idx_hearing_notes_hearing_id\` (\`hearing_id\`), INDEX \`idx_hearing_notes_created_at\` (\`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`hearing_attachments\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`hearing_id\` varchar(36) NOT NULL, \`file_name\` varchar(255) NOT NULL, \`file_size\` int UNSIGNED NOT NULL, \`mime_type\` varchar(100) NOT NULL, \`storage_key\` varchar(500) NOT NULL, INDEX \`idx_hearing_attachments_hearing_id\` (\`hearing_id\`), INDEX \`idx_hearing_attachments_created_at\` (\`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`ALTER TABLE \`hearings\` ADD CONSTRAINT \`FK_hearings_case_id\` FOREIGN KEY (\`case_id\`) REFERENCES \`cases\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hearing_notes\` ADD CONSTRAINT \`FK_hearing_notes_hearing_id\` FOREIGN KEY (\`hearing_id\`) REFERENCES \`hearings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`hearing_attachments\` ADD CONSTRAINT \`FK_hearing_attachments_hearing_id\` FOREIGN KEY (\`hearing_id\`) REFERENCES \`hearings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`hearing_attachments\` DROP FOREIGN KEY \`FK_hearing_attachments_hearing_id\``);
        await queryRunner.query(`ALTER TABLE \`hearing_notes\` DROP FOREIGN KEY \`FK_hearing_notes_hearing_id\``);
        await queryRunner.query(`ALTER TABLE \`hearings\` DROP FOREIGN KEY \`FK_hearings_case_id\``);
        await queryRunner.query(`DROP TABLE \`hearing_attachments\``);
        await queryRunner.query(`DROP TABLE \`hearing_notes\``);
        await queryRunner.query(`DROP TABLE \`hearings\``);
    }
}
