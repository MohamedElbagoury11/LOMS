/* eslint-disable no-console */
/**
 * Main seed entry point.
 *
 * Runs all seeders in the correct dependency order:
 *
 *   1. permissions  – inserts all RBAC permission records
 *   2. roles        – inserts all RBAC role records
 *   3. role-perms   – assigns every permission to Administrator
 *   4. admin        – creates the admin user and assigns Administrator role
 *
 * Usage:
 *
 *   npx ts-node -r tsconfig-paths/register src/database/seeds/seed.ts
 *
 * or, add a convenience script to package.json:
 *
 *   "seed": "ts-node -r tsconfig-paths/register src/database/seeds/seed.ts"
 *
 * The script connects using the same environment variables as data-source.ts.
 * A running MySQL instance and a valid .env file (or exported env vars) are required.
 */

import 'dotenv/config';

import { DataSource } from 'typeorm';

import { Permission } from '../../modules/permissions/entities/permission.entity';
import { RolePermission } from '../../modules/role-permissions/entities/role-permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { UserRole } from '../../modules/user-roles/entities/user-role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { seedAdmin } from './admin.seed';
import { PERMISSION_DEFINITIONS } from './permissions.seed';
import { seedRolePermissions } from './role-permissions.seed';
import { ROLE_DEFINITIONS } from './roles.seed';

const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'loms',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'loms',
    charset: 'utf8mb4_unicode_ci',
    synchronize: false,
    logging: false,
    entities: [User, Role, Permission, UserRole, RolePermission],
});

async function run(): Promise<void> {
    await dataSource.initialize();
    console.log('[seed] Database connection established.');

    try {
        // ── 1. Permissions ────────────────────────────────────────────────────────
        console.log('[seed] Running permissions seeder…');
        const permissionRepository = dataSource.getRepository(Permission);

        for (const def of PERMISSION_DEFINITIONS) {
            const existing = await permissionRepository.findOne({
                where: { name: def.name },
            });

            if (!existing) {
                const permission = permissionRepository.create({
                    name: def.name,
                    displayName: def.displayName,
                    description: def.description,
                });
                await permissionRepository.save(permission);
                console.log(`[permissions.seed] Created permission "${def.name}".`);
            } else {
                console.log(
                    `[permissions.seed] Permission "${def.name}" already exists. Skipping.`,
                );
            }
        }

        // ── 2. Roles ──────────────────────────────────────────────────────────────
        console.log('[seed] Running roles seeder…');
        const roleRepository = dataSource.getRepository(Role);

        for (const def of ROLE_DEFINITIONS) {
            const existing = await roleRepository.findOne({
                where: { name: def.name },
            });

            if (!existing) {
                const role = roleRepository.create({
                    name: def.name,
                    displayName: def.displayName,
                    description: def.description,
                    isSystem: def.isSystem,
                });
                await roleRepository.save(role);
                console.log(`[roles.seed] Created role "${def.name}".`);
            } else {
                console.log(
                    `[roles.seed] Role "${def.name}" already exists. Skipping.`,
                );
            }
        }

        // ── 3. Role-Permission assignments ─────────────────────────────────────────
        console.log('[seed] Running role-permissions seeder…');
        await seedRolePermissions(dataSource);

        // ── 4. Admin user ─────────────────────────────────────────────────────────
        console.log('[seed] Running admin seeder…');
        await seedAdmin(dataSource);

        console.log('[seed] ✔ All seeders completed successfully.');
    } finally {
        await dataSource.destroy();
        console.log('[seed] Database connection closed.');
    }
}

void run().catch((err: unknown) => {
    console.error('[seed] Fatal error during seeding:', err);
    process.exit(1);
});
