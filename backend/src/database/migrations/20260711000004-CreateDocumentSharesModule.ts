import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentSharesModule20260711000004 implements MigrationInterface {
    name = 'CreateDocumentSharesModule20260711000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`document_shares\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`created_by\` char(36) NULL,
                \`updated_by\` char(36) NULL,
                \`deleted_by\` char(36) NULL,
                \`document_id\` varchar(36) NOT NULL,
                \`token\` varchar(128) NOT NULL,
                \`expires_at\` timestamp(6) NOT NULL,
                \`revoked_at\` timestamp(6) NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`idx_document_shares_token\` (\`token\`),
                KEY \`idx_document_shares_document_id\` (\`document_id\`),
                KEY \`idx_document_shares_expires_at\` (\`expires_at\`),
                KEY \`idx_document_shares_revoked_at\` (\`revoked_at\`),
                CONSTRAINT \`FK_document_shares_document_id\` FOREIGN KEY (\`document_id\`) REFERENCES \`documents\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `document_shares` DROP FOREIGN KEY `FK_document_shares_document_id`');
        await queryRunner.query('DROP TABLE `document_shares`');
    }
}
