import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsModule20260711000000 implements MigrationInterface {
    name = 'CreateClientsModule20260711000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`clients\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`created_by\` varchar(36) NULL,
                \`updated_by\` varchar(36) NULL,
                \`deleted_by\` varchar(36) NULL,
                \`client_code\` varchar(20) NOT NULL,
                \`type\` enum('INDIVIDUAL','ORGANIZATION') NOT NULL,
                \`status\` enum('ACTIVE','INACTIVE','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
                \`first_name\` varchar(100) NULL,
                \`last_name\` varchar(100) NULL,
                \`organization_name\` varchar(200) NULL,
                \`passport_number\` varchar(50) NULL,
                \`phone\` varchar(20) NOT NULL,
                \`email\` varchar(255) NULL,
                \`national_id\` varchar(50) NULL,
                \`tax_number\` varchar(50) NULL,
                \`commercial_registration\` varchar(50) NULL,
                \`date_of_birth\` date NULL,
                \`gender\` varchar(20) NULL,
                \`preferred_language\` varchar(50) NULL,
                \`notes\` text NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`UQ_clients_client_code\` (\`client_code\`),
                UNIQUE KEY \`UQ_clients_phone\` (\`phone\`),
                UNIQUE KEY \`UQ_clients_email\` (\`email\`),
                UNIQUE KEY \`UQ_clients_national_id\` (\`national_id\`),
                UNIQUE KEY \`UQ_clients_tax_number\` (\`tax_number\`),
                UNIQUE KEY \`UQ_clients_commercial_registration\` (\`commercial_registration\`),
                UNIQUE KEY \`UQ_clients_passport_number\` (\`passport_number\`),
                KEY \`idx_clients_status\` (\`status\`),
                KEY \`idx_clients_type\` (\`type\`),
                KEY \`idx_clients_organization_name\` (\`organization_name\`),
                KEY \`idx_clients_created_at\` (\`created_at\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`client_contacts\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`created_by\` varchar(36) NULL,
                \`updated_by\` varchar(36) NULL,
                \`deleted_by\` varchar(36) NULL,
                \`client_id\` varchar(36) NOT NULL,
                \`name\` varchar(150) NOT NULL,
                \`position\` varchar(100) NULL,
                \`phone\` varchar(20) NULL,
                \`email\` varchar(255) NULL,
                \`is_primary\` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (\`id\`),
                KEY \`idx_client_contacts_client_id\` (\`client_id\`),
                KEY \`idx_client_contacts_is_primary\` (\`is_primary\`),
                KEY \`idx_client_contacts_email\` (\`email\`),
                KEY \`idx_client_contacts_phone\` (\`phone\`),
                CONSTRAINT \`fk_client_contacts_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`client_addresses\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`created_by\` varchar(36) NULL,
                \`updated_by\` varchar(36) NULL,
                \`deleted_by\` varchar(36) NULL,
                \`client_id\` varchar(36) NOT NULL,
                \`country\` varchar(100) NOT NULL,
                \`city\` varchar(100) NOT NULL,
                \`district\` varchar(100) NULL,
                \`street\` varchar(200) NULL,
                \`building\` varchar(100) NULL,
                \`floor\` varchar(50) NULL,
                \`postal_code\` varchar(20) NULL,
                \`is_primary\` tinyint(1) NOT NULL DEFAULT '0',
                PRIMARY KEY (\`id\`),
                KEY \`idx_client_addresses_client_id\` (\`client_id\`),
                KEY \`idx_client_addresses_is_primary\` (\`is_primary\`),
                CONSTRAINT \`fk_client_addresses_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`client_notes\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`created_by\` varchar(36) NULL,
                \`updated_by\` varchar(36) NULL,
                \`deleted_by\` varchar(36) NULL,
                \`client_id\` varchar(36) NOT NULL,
                \`content\` text NOT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`idx_client_notes_client_id\` (\`client_id\`),
                KEY \`idx_client_notes_created_at\` (\`created_at\`),
                CONSTRAINT \`fk_client_notes_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        await queryRunner.query(`
            CREATE TABLE \`client_attachments\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` timestamp(6) NULL,
                \`created_by\` varchar(36) NULL,
                \`updated_by\` varchar(36) NULL,
                \`deleted_by\` varchar(36) NULL,
                \`client_id\` varchar(36) NOT NULL,
                \`file_name\` varchar(255) NOT NULL,
                \`file_size\` int unsigned NOT NULL,
                \`mime_type\` varchar(100) NOT NULL,
                \`storage_key\` varchar(500) NOT NULL,
                \`type\` enum('PASSPORT','NATIONAL_ID','POWER_OF_ATTORNEY','CONTRACT','COURT_DOCUMENT','OTHER') NOT NULL,
                PRIMARY KEY (\`id\`),
                KEY \`idx_client_attachments_client_id\` (\`client_id\`),
                KEY \`idx_client_attachments_type\` (\`type\`),
                KEY \`idx_client_attachments_uploaded_at\` (\`created_at\`),
                CONSTRAINT \`fk_client_attachments_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`clients\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS `client_attachments`');
        await queryRunner.query('DROP TABLE IF EXISTS `client_notes`');
        await queryRunner.query('DROP TABLE IF EXISTS `client_addresses`');
        await queryRunner.query('DROP TABLE IF EXISTS `client_contacts`');
        await queryRunner.query('DROP TABLE IF EXISTS `clients`');
    }
}
