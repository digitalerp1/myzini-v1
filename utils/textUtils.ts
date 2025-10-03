/**
 * Sanitizes a string to be URL and path friendly.
 * It converts the string to lowercase, replaces spaces with underscores,
 * and removes any characters that are not alphanumeric, underscore, dot, or hyphen.
 * @param input The string to sanitize.
 * @returns A sanitized, path-safe string.
 */
export const sanitizeForPath = (input: string): string => {
    if (!input) return 'unknown';
    return input.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '');
};
