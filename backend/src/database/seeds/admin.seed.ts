/* eslint-disable no-console */
/**
 * Admin user seed.
 *
 * Creates the initial system administrator account:
 *   username : admin
 *   phone    : 00000000000  (placeholder – must be changed after first login)
 *   status   : active
 *   mustChangePassword : true
 *   passwordHash : PLACEHOLDER_CHANGE_BEFORE_USE
 *
 * Then assigns the Administrator role to this user.
 *
 * This seed is fully idempotent:
 *   - A second run finds the existing admin by username and skips creation.
 *   - The role assignment is also skipped if it already exists.
 *
 * IMPORTANT: Replace `passwordHash` with a proper bcrypt or argon2 hash
 *            before deploying to any non-development environment.
 */

import { DataSource } from 'typeorm';

import { UserStatus } from '../../common/enums/user-status.enum';
import { Role } from '../../modules/roles/entities/role.entity';
import { UserRole } from '../../modules/user-roles/entities/user-role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { ADMINISTRATOR_ROLE_NAME } from './roles.seed';

const ADMIN_USERNAME = 'admin';

/** Placeholder hash – replace with a real hash before production deployment. */
const PLACEHOLDER_PASSWORD_HASH = 'PLACEHOLDER_CHANGE_BEFORE_USE';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const userRoleRepository = dataSource.getRepository(UserRole);

    // ── 1. Create the admin user if it does not exist ──────────────────────────
    let admin = await userRepository.findOne({
        where: { username: ADMIN_USERNAME },
    });

    if (!admin) {
        admin = userRepository.create({
            username: ADMIN_USERNAME,
            firstName: 'System',
            lastName: 'Administrator',
            phone: '00000000000',
            email: null,
            passwordHash: PLACEHOLDER_PASSWORD_HASH,
            status: UserStatus.Active,
            mustChangePassword: true,
            lastLoginAt: null,
        });

        await userRepository.save(admin);
        console.log(`[admin.seed] Created admin user "${ADMIN_USERNAME}".`);
    } else {
        console.log(
            `[admin.seed] Admin user "${ADMIN_USERNAME}" already exists. Skipping creation.`,
        );
    }

    // ── 2. Assign Administrator role to admin user ─────────────────────────────
    const adminRole = await roleRepository.findOne({
        where: { name: ADMINISTRATOR_ROLE_NAME },
    });

    if (!adminRole) {
        throw new Error(
            `[admin.seed] Administrator role not found. Run roles seed first.`,
        );
    }

    const existing = await userRoleRepository.findOne({
        where: { userId: admin.id, roleId: adminRole.id },
    });

    if (!existing) {
        const userRole = userRoleRepository.create({
            userId: admin.id,
            roleId: adminRole.id,
        });
        await userRoleRepository.save(userRole);
        console.log(
            `[admin.seed] Assigned Administrator role to "${ADMIN_USERNAME}".`,
        );
    } else {
        console.log(
            `[admin.seed] Administrator role already assigned to "${ADMIN_USERNAME}". Skipping.`,
        );
    }
}
