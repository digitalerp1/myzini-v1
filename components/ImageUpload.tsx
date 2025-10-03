import React, { useState } from 'react';
import { uploadFileToGitHub } from '../services/githubService';
import Spinner from './Spinner';
import UserCircleIcon from './icons/UserCircleIcon';

interface ImageUploadProps {
    label: string;
    currentUrl: string | null | undefined;
    onUrlChange: (url: string) => void;
    getUploadPath: (fileName: string) => Promise<string>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, currentUrl, onUrlChange, getUploadPath }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const path = await getUploadPath(file.name);
            const newUrl = await uploadFileToGitHub(file, path);
            onUrlChange(newUrl);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
            // Reset file input to allow re-uploading the same file
            e.target.value = '';
        }
    };

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-1 flex items-center gap-4">
                {currentUrl ? (
                    <img src={currentUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200" />
                ) : (
                    <span className="inline-block h-20 w-20 overflow-hidden rounded-lg bg-gray-100 p-2 text-gray-400">
                       <UserCircleIcon />
                    </span>
                )}
                <div className="flex-grow">
                    <div className="flex rounded-md shadow-sm">
                        <input
                            type="text"
                            value={currentUrl || ''}
                            onChange={(e) => onUrlChange(e.target.value)}
                            placeholder="https://... or upload a file"
                            className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 focus:ring-primary focus:border-primary"
                        />
                        <label htmlFor={label + "-file-upload"} className="relative cursor-pointer bg-white rounded-r-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary border border-l-0 border-gray-300 px-4 inline-flex items-center">
                            <span>{uploading ? <Spinner size="5" /> : 'Upload'}</span>
                            <input id={label + "-file-upload"} name={label + "-file-upload"} type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" disabled={uploading} />
                        </label>
                    </div>
                </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">Upload failed: {error}</p>}
        </div>
    );
};

export default ImageUpload;
