/**
 * Filename sanitization utility for safe file handling.
 * 
 * Removes path traversal, CRLF injection, invalid characters,
 * and prevents reserved Windows filenames.
 */

const RESERVED_WINDOWS_NAMES = new Set([
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);

// eslint-disable-next-line no-control-regex
const INVALID_FILENAME_CHARS_REGEX = /[\x00-\x1f\x7f"<>|?*:/\\]/g;
const CRLF_REGEX = /[\r\n]/g;
const PATH_TRAVERSAL_REGEX = /\.\./g;
const MULTIPLE_SPACES_REGEX = /\s+/g;

export class FileNameUtil {
    /**
     * Sanitize a filename for safe use in Content-Disposition headers and display.
     * 
     * @param fileName Original filename
     * @param maxLength Maximum filename length (default: 255)
     * @returns Sanitized filename safe for all contexts
     * 
     * @example
     * sanitize("../../../etc/passwd") // "etcpasswd"
     * sanitize("report.pdf\r\nAttack") // "report.pdfAttack"
     * sanitize("my  file.pdf") // "my file.pdf"
     */
    static sanitize(fileName: string, maxLength = 255): string {
        if (!fileName || typeof fileName !== 'string') {
            return 'file';
        }

        let sanitized = fileName.trim();

        // Remove CRLF (prevent HTTP header injection)
        sanitized = sanitized.replace(CRLF_REGEX, '');

        // Remove path traversal attempts
        sanitized = sanitized.replace(PATH_TRAVERSAL_REGEX, '');

        // Remove leading/trailing path separators
        sanitized = sanitized.replace(/^[/\\]+|[/\\]+$/g, '');

        // Remove invalid filename characters
        sanitized = sanitized.replace(INVALID_FILENAME_CHARS_REGEX, '');

        // Normalize multiple spaces to single space
        sanitized = sanitized.replace(MULTIPLE_SPACES_REGEX, ' ');

        // Remove leading/trailing spaces again after normalization
        sanitized = sanitized.trim();

        // Truncate to filename without extension for validation
        const lastDotIndex = sanitized.lastIndexOf('.');
        let fileNamePart = lastDotIndex > 0 ? sanitized.substring(0, lastDotIndex) : sanitized;
        const extension = lastDotIndex > 0 ? sanitized.substring(lastDotIndex) : '';

        // Check if name (without extension) is a reserved Windows name
        if (RESERVED_WINDOWS_NAMES.has(fileNamePart.toUpperCase())) {
            fileNamePart = `_${fileNamePart}`;
        }

        // Recombine filename and extension
        sanitized = fileNamePart + extension;

        // If empty after sanitization, provide default
        if (!sanitized || sanitized.length === 0) {
            return 'file';
        }

        // Enforce max length
        if (sanitized.length > maxLength) {
            // Preserve extension when truncating
            const lastDot = sanitized.lastIndexOf('.');
            if (lastDot > 0 && lastDot < maxLength) {
                const ext = sanitized.substring(lastDot);
                const nameMaxLength = maxLength - ext.length;
                sanitized = sanitized.substring(0, nameMaxLength) + ext;
            } else {
                sanitized = sanitized.substring(0, maxLength);
            }
        }

        return sanitized;
    }

    /**
     * Check if a filename is safe for use.
     * 
     * @param fileName Filename to check
     * @returns true if safe, false otherwise
     */
    static isSafe(fileName: string): boolean {
        if (!fileName || typeof fileName !== 'string') {
            return false;
        }

        // Check for CRLF
        if (CRLF_REGEX.test(fileName)) {
            return false;
        }

        // Check for path traversal
        if (PATH_TRAVERSAL_REGEX.test(fileName)) {
            return false;
        }

        // Check for invalid characters
        if (INVALID_FILENAME_CHARS_REGEX.test(fileName)) {
            return false;
        }

        // Check for reserved names
        const fileNamePart = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
        if (RESERVED_WINDOWS_NAMES.has(fileNamePart.toUpperCase())) {
            return false;
        }

        return true;
    }
}
