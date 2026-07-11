import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCasesModule20260711000001 implements MigrationInterface {
    name = 'CreateCasesModule20260711000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`cases\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`case_number\` varchar(30) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`status\` enum ('draft','open','in_progress','waiting','closed','archived') NOT NULL DEFAULT 'draft', \`type\` enum ('civil','criminal','commercial','family','labor','administrative','appeal','execution','custom') NOT NULL DEFAULT 'custom', \`court_name\` varchar(255) NULL, \`court_circuit\` varchar(255) NULL, \`judge_name\` varchar(255) NULL, \`filing_date\` date NULL, \`opening_date\` date NULL, \`closing_date\` date NULL, \`priority\` enum ('low','medium','high','urgent') NOT NULL DEFAULT 'medium', INDEX \`idx_cases_status\` (\`status\`), INDEX \`idx_cases_type\` (\`type\`), INDEX \`idx_cases_priority\` (\`priority\`), INDEX \`idx_cases_created_at\` (\`created_at\`), UNIQUE INDEX \`UQ_cases_case_number\` (\`case_number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`case_clients\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`case_id\` varchar(36) NOT NULL, \`client_id\` varchar(36) NOT NULL, \`is_primary\` boolean NOT NULL DEFAULT false, UNIQUE INDEX \`UQ_case_clients_case_client\` (\`case_id\`, \`client_id\`), INDEX \`idx_case_clients_case_id\` (\`case_id\`), INDEX \`idx_case_clients_client_id\` (\`client_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`case_lawyers\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`case_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, \`is_primary\` boolean NOT NULL DEFAULT false, UNIQUE INDEX \`UQ_case_lawyers_case_user\` (\`case_id\`, \`user_id\`), INDEX \`idx_case_lawyers_case_id\` (\`case_id\`), INDEX \`idx_case_lawyers_user_id\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`case_opposite_parties\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`case_id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`role\` varchar(100) NULL, \`organization_name\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`email\` varchar(255) NULL, INDEX \`idx_case_opposite_parties_case_id\` (\`case_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`case_notes\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`case_id\` varchar(36) NOT NULL, \`content\` text NOT NULL, INDEX \`idx_case_notes_case_id\` (\`case_id\`), INDEX \`idx_case_notes_created_at\` (\`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`case_attachments\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`case_id\` varchar(36) NOT NULL, \`file_name\` varchar(255) NOT NULL, \`file_size\` int UNSIGNED NOT NULL, \`mime_type\` varchar(100) NOT NULL, \`storage_key\` varchar(500) NOT NULL, INDEX \`idx_case_attachments_case_id\` (\`case_id\`), INDEX \`idx_case_attachments_created_at\` (\`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`ALTER TABLE \`case_clients\` ADD CONSTRAINT \`FK_case_clients_case_id\` FOREIGN KEY (\`case_id\`) REFERENCES \`cases\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_clients\` ADD CONSTRAINT \`FK_case_clients_client_id\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_lawyers\` ADD CONSTRAINT \`FK_case_lawyers_case_id\` FOREIGN KEY (\`case_id\`) REFERENCES \`cases\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_opposite_parties\` ADD CONSTRAINT \`FK_case_opposite_parties_case_id\` FOREIGN KEY (\`case_id\`) REFERENCES \`cases\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_notes\` ADD CONSTRAINT \`FK_case_notes_case_id\` FOREIGN KEY (\`case_id\`) REFERENCES \`cases\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_attachments\` ADD CONSTRAINT \`FK_case_attachments_case_id\` FOREIGN KEY (\`case_id\`) REFERENCES \`cases\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case_attachments\` DROP FOREIGN KEY \`FK_case_attachments_case_id\``);
        await queryRunner.query(`ALTER TABLE \`case_notes\` DROP FOREIGN KEY \`FK_case_notes_case_id\``);
        await queryRunner.query(`ALTER TABLE \`case_opposite_parties\` DROP FOREIGN KEY \`FK_case_opposite_parties_case_id\``);
        await queryRunner.query(`ALTER TABLE \`case_lawyers\` DROP FOREIGN KEY \`FK_case_lawyers_case_id\``);
        await queryRunner.query(`ALTER TABLE \`case_clients\` DROP FOREIGN KEY \`FK_case_clients_client_id\``);
        await queryRunner.query(`ALTER TABLE \`case_clients\` DROP FOREIGN KEY \`FK_case_clients_case_id\``);
        await queryRunner.query(`DROP TABLE \`case_attachments\``);
        await queryRunner.query(`DROP TABLE \`case_notes\``);
        await queryRunner.query(`DROP TABLE \`case_opposite_parties\``);
        await queryRunner.query(`DROP TABLE \`case_lawyers\``);
        await queryRunner.query(`DROP TABLE \`case_clients\``);
        await queryRunner.query(`DROP TABLE \`cases\``);
    }
}
