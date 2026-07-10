import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs20260710120000 implements MigrationInterface {
    name = 'CreateAuditLogs20260710120000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`audit_logs\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`user_id\` varchar(36) NULL,
                \`username\` varchar(100) NULL,
                \`action\` enum('LOGIN','LOGIN_FAILED','LOGOUT','LOGOUT_ALL','REFRESH_TOKEN','PASSWORD_CHANGED','PASSWORD_RESET','SESSION_REVOKED','SESSION_EXPIRED','ACCOUNT_LOCKED','USER_CREATED','USER_UPDATED','USER_DELETED','ROLE_CREATED','ROLE_UPDATED','ROLE_DELETED','PERMISSION_GRANTED','PERMISSION_DENIED','PERMISSION_REVOKED','CLIENT_CREATED','CLIENT_UPDATED','CLIENT_DELETED','CASE_CREATED','CASE_UPDATED','CASE_DELETED','DOCUMENT_CREATED','DOCUMENT_UPDATED','DOCUMENT_DELETED','REPORT_EXPORTED','SETTINGS_UPDATED') NOT NULL,
                \`entity\` enum('SYSTEM','AUTH','USER','ROLE','PERMISSION','CLIENT','CASE','DOCUMENT','REPORT','SETTINGS','SESSION') NOT NULL,
                \`entity_id\` varchar(36) NULL,
                \`result\` enum('SUCCESS','FAILED','DENIED') NOT NULL,
                \`ip_address\` varchar(45) NOT NULL,
                \`user_agent\` varchar(500) NOT NULL,
                \`details\` json NOT NULL,
                \`metadata\` json NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_created_at\` ON \`audit_logs\` (\`created_at\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_user_id\` ON \`audit_logs\` (\`user_id\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_entity\` ON \`audit_logs\` (\`entity\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_entity_id\` ON \`audit_logs\` (\`entity_id\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_action\` ON \`audit_logs\` (\`action\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_result\` ON \`audit_logs\` (\`result\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_created_at_result\` ON \`audit_logs\` (\`created_at\`, \`result\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_user_created_at\` ON \`audit_logs\` (\`user_id\`, \`created_at\`)`);
        await queryRunner.query(`CREATE INDEX \`idx_audit_logs_entity_action\` ON \`audit_logs\` (\`entity\`, \`action\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_entity_action\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_user_created_at\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_created_at_result\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_result\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_action\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_entity_id\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_entity\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_user_id\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`idx_audit_logs_created_at\` ON \`audit_logs\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }
}
