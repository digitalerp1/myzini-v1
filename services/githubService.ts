import { supabase } from './supabase';

// As requested, these will be configured as environment variables.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const GITHUB_USER = process.env.GITHUB_USER || 'digitalerp1';
const GITHUB_REPO = process.env.GITHUB_REPO || 'imagemyzini';
const CDN_BASE_URL = 'https://image.myzini.in';

/**
 * Converts a File object to a Base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // The result is a data URL: "data:image/jpeg;base64,LzlqLzRBQ...".
            // We only need the Base64 content after the comma.
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

/**
 * Uploads a file to the configured GitHub repository.
 * @param file The file to upload.
 * @param path The full path including the filename where the file should be stored in the repo.
 * @returns A promise that resolves with the final CDN URL of the uploaded file.
 */
export const uploadFileToGitHub = async (file: File, path: string): Promise<string> => {
    if (!GITHUB_TOKEN) {
        throw new Error("GitHub API token is not configured. Please set the GITHUB_TOKEN environment variable.");
    }

    const base64Content = await fileToBase64(file);
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`;

    const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
            message: `feat: upload ${file.name} via MyZini`,
            content: base64Content,
            committer: {
                name: 'My Zini App',
                email: 'app@myzini.in'
            }
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        // Handle case where file already exists by trying to update it
        if (response.status === 422 && errorData.message.includes('sha')) {
             throw new Error(`This file already exists. Please rename the file or upload a different one.`);
        }
        throw new Error(`GitHub API Error: ${errorData.message || 'Failed to upload file.'}`);
    }

    // Construct the final URL using the custom CDN base URL as requested.
    return `${CDN_BASE_URL}/${path}`;
};
