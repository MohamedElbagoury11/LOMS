import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentsModule20260711000003 implements MigrationInterface {
    name = 'CreateDocumentsModule20260711000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`documents\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`created_by\` char(36) NULL,
                \`updated_by\` char(36) NULL,
                \`deleted_by\` char(36) NULL,
                \`client_id\` varchar(36) NOT NULL,
                \`case_id\` varchar(36) NULL,
                \`display_name\` varchar(255) NOT NULL,
                \`original_file_name\` varchar(255) NOT NULL,
                \`extension\` varchar(50) NOT NULL,
                \`mime_type\` varchar(100) NOT NULL,
                \`file_size\` int UNSIGNED NOT NULL,
                \`storage_key\` varchar(500) NOT NULL,
                \`description\` text NULL,
                PRIMARY KEY (\`id\`),
                KEY \`idx_documents_client_id\` (\`client_id\`),
                KEY \`idx_documents_case_id\` (\`case_id\`),
                KEY \`idx_documents_display_name\` (\`display_name\`),
                CONSTRAINT \`FK_documents_client_id\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION,
                CONSTRAINT \`FK_documents_case_id\` FOREIGN KEY (\`case_id\`) REFERENCES \`cases\` (\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `documents` DROP FOREIGN KEY `FK_documents_case_id`');
        await queryRunner.query('ALTER TABLE `documents` DROP FOREIGN KEY `FK_documents_client_id`');
        await queryRunner.query('DROP TABLE `documents`');
    }
}
