
import { supabase } from './supabase';

const WORKER_URL = "https://apizini.teamdigitalerp.workers.dev";

/**
 * Uploads an image file to the Zini Cloudflare Worker.
 * @param file The file to upload.
 * @param schoolName The name of the school (for folder organization).
 * @param schoolUid The UID of the school owner.
 * @returns A promise that resolves with the public URL of the uploaded file.
 */
export const uploadImage = async (file: File, schoolName: string, schoolUid: string): Promise<string> => {
    const formData = new FormData();
    formData.append('school_name', schoolName);
    formData.append('school_uid', schoolUid);
    formData.append('image', file);

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Request-Type': 'upload_image'
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to upload image to server.");
        }

        return result.public_url;
    } catch (error: any) {
        console.error("Upload Error:", error);
        throw new Error(error.message || "Network error during upload.");
    }
};
