import { supabase } from './supabase';

const BUCKET_NAME = 'school_assets';
const MAX_FILE_SIZE_KB = 20;

/**
 * Uploads an image file to Supabase Storage.
 * @param file The file to upload.
 * @param path The full path including the filename where the file should be stored.
 * @returns A promise that resolves with the public URL of the uploaded file.
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
    if (file.size > MAX_FILE_SIZE_KB * 1024) {
        // This check is a safeguard. The client-side should have already compressed the image.
        throw new Error(`File size exceeds the final limit of ${MAX_FILE_SIZE_KB} KB after compression attempts.`);
    }

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true, // Overwrite file if it exists to handle potential name collisions
        });

    if (error) {
        throw new Error(`Supabase Storage Error: ${error.message}`);
    }

    if (!data) {
        throw new Error("Upload successful, but no data returned from Supabase.");
    }

    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

    if (!publicUrl) {
        throw new Error("Could not get public URL for the uploaded file.");
    }

    // Append a timestamp to the URL to bypass cache after an update (upsert)
    return `${publicUrl}?t=${new Date().getTime()}`;
};