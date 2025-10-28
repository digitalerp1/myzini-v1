import React, { useState } from 'react';
import { uploadImage } from '../services/githubService';
import Spinner from './Spinner';
import UserCircleIcon from './icons/UserCircleIcon';

interface ImageUploadProps {
    label: string;
    currentUrl: string | null | undefined;
    onUrlChange: (url: string) => void;
    getUploadPath: (fileName: string) => Promise<string>;
}

const MAX_SIZE_KB = 20;

const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    return reject(new Error('Could not get canvas context.'));
                }

                let { width, height } = img;
                
                // If image is very large, do a preliminary resize to save processing time
                const MAX_DIMENSION = 1024;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIMENSION) / width);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width * MAX_DIMENSION) / height);
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                const attemptCompression = (quality: number) => {
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            return reject(new Error('Canvas to Blob conversion failed.'));
                        }

                        if (blob.size / 1024 <= MAX_SIZE_KB) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else if (quality > 0.1) {
                            // Recursively call with lower quality
                            attemptCompression(quality - 0.1);
                        } else {
                            // If even at lowest quality it's too big, reject
                            reject(new Error(`Could not compress image under ${MAX_SIZE_KB} KB. Final size was ${(blob.size / 1024).toFixed(2)} KB.`));
                        }
                    }, 'image/jpeg', quality);
                };

                // Start with high quality and reduce if necessary
                attemptCompression(0.9);
            };
            img.onerror = (error) => reject(new Error(`Image loading failed.`));
        };
        reader.onerror = (error) => reject(new Error(`File reading failed.`));
    });
};

const ImageUpload: React.FC<ImageUploadProps> = ({ label, currentUrl, onUrlChange, getUploadPath }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setMessage(null);

        try {
            if (file.size / 1024 > MAX_SIZE_KB) {
                setMessage(`Original size is ${(file.size / 1024).toFixed(1)} KB. Compressing to under ${MAX_SIZE_KB} KB...`);
                try {
                    file = await compressImage(file);
                } catch (compressionError: any) {
                    setError(`Compression failed: ${compressionError.message}`);
                    setUploading(false);
                    e.target.value = '';
                    return;
                }
            }

            const path = await getUploadPath(file.name);
            const newUrl = await uploadImage(file, path);
            onUrlChange(newUrl);
            setMessage(null);
        } catch (err: any) {
            setError(err.message);
            setMessage(null);
        } finally {
            setUploading(false);
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
                            <input id={label + "-file-upload"} name={label + "-file-upload"} type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={uploading} />
                        </label>
                    </div>
                </div>
            </div>
            {message && !error && <p className="mt-2 text-sm text-blue-600">{message}</p>}
            {error && <p className="mt-2 text-sm text-red-600">Upload failed: {error}</p>}
        </div>
    );
};

export default ImageUpload;