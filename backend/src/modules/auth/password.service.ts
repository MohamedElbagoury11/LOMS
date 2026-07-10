import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * Reusable password hashing and verification service using Argon2id.
 *
 * Implements password hashing specification from docs/06-AUTHENTICATION_DESIGN.md.
 */
@Injectable()
export class PasswordService {
    /**
     * Hashes a plain-text password using Argon2id.
     *
     * @param password Plain-text password to hash.
     * @returns Promisified Argon2id hashed string.
     */
    async hashPassword(password: string): Promise<string> {
        return argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64MB memory cost
            timeCost: 3,       // 3 iterations
            parallelism: 4,    // 4 parallel threads
        });
    }

    /**
     * Verifies a plain-text password against a stored Argon2id hash.
     *
     * @param password Plain-text password to verify.
     * @param hash Stored password hash.
     * @returns Promisified boolean indicating match status.
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, password);
        } catch {
            // Return false in case of format errors or validation exceptions
            return false;
        }
    }
}
