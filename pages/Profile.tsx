import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { OwnerProfile } from '../types';
import Spinner from '../components/Spinner';
import ImageUpload from '../components/ImageUpload';
import { sanitizeForPath } from '../utils/textUtils';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('owner')
      .select('*')
      .eq('uid', user.id)
      .single();

    if (data) {
      setProfile(data);
    } else if (error && error.code !== 'PGRST116') { // Ignore "no rows found"
      setMessage({ type: 'error', text: `Error fetching profile: ${error.message}` });
    } else {
        // If no profile exists, initialize a blank one
        setProfile({
            uid: user.id,
            school_name: '',
            mobile_number: '',
        });
    }
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleImageUrlChange = (url: string) => {
    if (profile) {
        setProfile({ ...profile, school_image_url: url });
    }
  };

  const getSchoolImagePath = async (fileName: string): Promise<string> => {
    if (!profile?.school_name) {
        throw new Error("School name must be set before uploading an image.");
    }
    const sanitizedSchoolName = sanitizeForPath(profile.school_name);
    const extension = fileName.split('.').pop() || 'png';
    const uniqueFileName = `logo_${Date.now()}.${extension}`;
    return `${sanitizedSchoolName}/${uniqueFileName}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from('owner').upsert(profile);

    if (error) {
      setMessage({ type: 'error', text: `Error saving profile: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    }
    setSaving(false);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This cannot be undone.')) {
        setSaving(true);
        const { error } = await supabase.from('owner').delete().eq('uid', user.id);
        if (error) {
            setMessage({ type: 'error', text: `Error deleting profile: ${error.message}` });
        } else {
            setMessage({ type: 'success', text: 'Profile deleted.' });
            fetchProfile(); // Refetch to show the create form
        }
        setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="12" /></div>;
  }

  const profileExists = profile && profile.register_date;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{profileExists ? 'Edit Your School Profile' : 'Create Your School Profile'}</h1>
      {message && (
        <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
            <label htmlFor="school_name" className="block text-sm font-medium text-gray-700">School Name</label>
            <input type="text" name="school_name" id="school_name" value={profile?.school_name || ''} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
        </div>
        <div>
            <label htmlFor="principal_name" className="block text-sm font-medium text-gray-700">Principal Name</label>
            <input type="text" name="principal_name" id="principal_name" value={profile?.principal_name || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
        </div>
        <div>
            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input type="tel" name="mobile_number" id="mobile_number" value={profile?.mobile_number || ''} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
        </div>
        <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea name="address" id="address" rows={3} value={profile?.address || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
        </div>
        <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website URL</label>
            <input type="url" name="website" id="website" value={profile?.website || ''} onChange={handleInputChange} placeholder="https://example.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
        </div>
         <div>
            <label htmlFor="school_code" className="block text-sm font-medium text-gray-700">School Code</label>
            <input type="text" name="school_code" id="school_code" value={profile?.school_code || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
        </div>
        
        <ImageUpload
            label="School Logo"
            currentUrl={profile?.school_image_url}
            onUrlChange={handleImageUrlChange}
            getUploadPath={getSchoolImagePath}
        />
        
        <div className="md:col-span-2 flex justify-end items-center gap-4 mt-4">
             {profileExists && (
                <button type="button" onClick={handleDelete} disabled={saving} className="px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors">
                    Delete Profile
                </button>
            )}
            <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2 transition-colors">
                 {saving && <Spinner size="5" />}
                 {saving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
