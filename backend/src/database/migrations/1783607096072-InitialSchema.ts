import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783607096072 implements MigrationInterface {
    name = 'InitialSchema1783607096072'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`created_by\` char(36) NULL, \`updated_by\` char(36) NULL, \`deleted_by\` char(36) NULL, \`username\` varchar(100) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`first_name\` varchar(100) NOT NULL, \`last_name\` varchar(100) NOT NULL, \`phone\` varchar(20) NOT NULL, \`email\` varchar(255) NULL, \`status\` enum ('active', 'inactive', 'locked') NOT NULL DEFAULT 'active', \`must_change_password\` tinyint NOT NULL DEFAULT 1, \`failed_login_attempts\` int UNSIGNED NOT NULL DEFAULT '0', \`locked_until\` timestamp NULL, \`last_login_at\` timestamp NULL, INDEX \`IDX_f32b1cb14a9920477bcfd63df2\` (\`created_by\`), INDEX \`IDX_b75c92ef36f432fe68ec300a7d\` (\`updated_by\`), INDEX \`IDX_021e2c9d9dca9f0885e8d73832\` (\`deleted_by\`), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), INDEX \`IDX_3676155292d72c67cd4e090514\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`name\` varchar(100) NOT NULL, \`display_name\` varchar(100) NOT NULL, \`description\` varchar(500) NULL, \`status\` enum ('active', 'archived') NOT NULL DEFAULT 'active', \`is_system\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), INDEX \`IDX_14958a120176d4e1e8be423977\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_roles\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_id\` varchar(36) NOT NULL, \`role_id\` varchar(36) NOT NULL, INDEX \`IDX_87b8888186ca9769c960e92687\` (\`user_id\`), INDEX \`IDX_b23c65e50a758245a33ee35fda\` (\`role_id\`), UNIQUE INDEX \`uq_user_roles_user_id_role_id\` (\`user_id\`, \`role_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`name\` varchar(100) NOT NULL, \`display_name\` varchar(100) NOT NULL, \`description\` varchar(500) NULL, \`status\` enum ('active', 'archived') NOT NULL DEFAULT 'active', UNIQUE INDEX \`IDX_48ce552495d14eae9b187bb671\` (\`name\`), INDEX \`IDX_bbf6febffd0f64508b38a2cd51\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_permission_overrides\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_id\` varchar(36) NOT NULL, \`permission_id\` varchar(36) NOT NULL, \`override_type\` enum ('allow', 'deny') NOT NULL, INDEX \`IDX_1d942b6fc3eeefb988291fb128\` (\`user_id\`), INDEX \`IDX_b23ab6a57668ecca2e2398287e\` (\`permission_id\`), UNIQUE INDEX \`uq_user_permission_overrides_user_id_permission_id\` (\`user_id\`, \`permission_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`role_id\` varchar(36) NOT NULL, \`permission_id\` varchar(36) NOT NULL, INDEX \`IDX_178199805b901ccd220ab7740e\` (\`role_id\`), INDEX \`IDX_17022daf3f885f7d35423e9971\` (\`permission_id\`), UNIQUE INDEX \`uq_role_permissions_role_id_permission_id\` (\`role_id\`, \`permission_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sessions\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_id\` varchar(36) NOT NULL, \`refresh_token_hash\` varchar(255) NOT NULL, \`ip_address\` varchar(45) NOT NULL, \`user_agent\` varchar(500) NOT NULL, \`device\` varchar(100) NULL, \`operating_system\` varchar(100) NULL, \`last_activity_at\` timestamp NOT NULL, \`expires_at\` timestamp NOT NULL, \`revoked_at\` timestamp NULL, \`status\` enum ('active', 'revoked', 'expired') NOT NULL DEFAULT 'active', INDEX \`IDX_085d540d9f418cfbdc7bd55bb1\` (\`user_id\`), INDEX \`IDX_d57f1751111f794b17f4dd9a64\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_permission_overrides\` ADD CONSTRAINT \`FK_1d942b6fc3eeefb988291fb1286\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_permission_overrides\` ADD CONSTRAINT \`FK_b23ab6a57668ecca2e2398287ea\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_085d540d9f418cfbdc7bd55bb19\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_085d540d9f418cfbdc7bd55bb19\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`user_permission_overrides\` DROP FOREIGN KEY \`FK_b23ab6a57668ecca2e2398287ea\``);
        await queryRunner.query(`ALTER TABLE \`user_permission_overrides\` DROP FOREIGN KEY \`FK_1d942b6fc3eeefb988291fb1286\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``);
        await queryRunner.query(`DROP INDEX \`IDX_d57f1751111f794b17f4dd9a64\` ON \`sessions\``);
        await queryRunner.query(`DROP INDEX \`IDX_085d540d9f418cfbdc7bd55bb1\` ON \`sessions\``);
        await queryRunner.query(`DROP TABLE \`sessions\``);
        await queryRunner.query(`DROP INDEX \`uq_role_permissions_role_id_permission_id\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`uq_user_permission_overrides_user_id_permission_id\` ON \`user_permission_overrides\``);
        await queryRunner.query(`DROP INDEX \`IDX_b23ab6a57668ecca2e2398287e\` ON \`user_permission_overrides\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d942b6fc3eeefb988291fb128\` ON \`user_permission_overrides\``);
        await queryRunner.query(`DROP TABLE \`user_permission_overrides\``);
        await queryRunner.query(`DROP INDEX \`IDX_bbf6febffd0f64508b38a2cd51\` ON \`permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_48ce552495d14eae9b187bb671\` ON \`permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP INDEX \`uq_user_roles_user_id_role_id\` ON \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\``);
        await queryRunner.query(`DROP TABLE \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_14958a120176d4e1e8be423977\` ON \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_3676155292d72c67cd4e090514\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_021e2c9d9dca9f0885e8d73832\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_b75c92ef36f432fe68ec300a7d\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_f32b1cb14a9920477bcfd63df2\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
