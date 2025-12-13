
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { OwnerProfile } from '../types';
import Spinner from '../components/Spinner';
import ImageUpload from '../components/ImageUpload';
import { sanitizeForPath } from '../utils/textUtils';
import DeleteIcon from '../components/icons/DeleteIcon';
import PlusIcon from '../components/icons/PlusIcon';

interface ProfileProps {
  user: User;
}

// Interface for local state management of infrastructure
interface BuildingData {
    id: string; // unique ID for React rendering
    name: string;
    floors: string;
    rooms: string;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [infrastructure, setInfrastructure] = useState<BuildingData[]>([]);
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
      
      // Parse the complex infrastructure string
      // Format: BuildingName=Floor1,Floor2@Room1,Room2+NextBuilding=...
      if (data.floor_numbers && typeof data.floor_numbers === 'string') {
          try {
              const buildings = data.floor_numbers.split('+').map((part: string, index: number) => {
                  if (!part.includes('=')) return null;
                  const [name, rest] = part.split('=');
                  const [floors, rooms] = rest ? rest.split('@') : ['', ''];
                  return {
                      id: Date.now().toString() + index,
                      name: name || '',
                      floors: floors || '',
                      rooms: rooms || ''
                  };
              }).filter(Boolean) as BuildingData[];
              setInfrastructure(buildings);
          } catch (e) {
              console.error("Error parsing infrastructure string", e);
              setInfrastructure([]);
          }
      }
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

  // Infrastructure Handlers
  const handleAddBuilding = () => {
      setInfrastructure([...infrastructure, { id: Date.now().toString(), name: '', floors: '', rooms: '' }]);
  };

  const handleRemoveBuilding = (id: string) => {
      setInfrastructure(infrastructure.filter(b => b.id !== id));
  };

  const handleBuildingChange = (id: string, field: keyof BuildingData, value: string) => {
      setInfrastructure(infrastructure.map(b => b.id === id ? { ...b, [field]: value } : b));
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

    // Serialize Infrastructure Data
    // 1. building_number column gets comma separated building names
    const buildingNames = infrastructure.map(b => b.name).filter(n => n.trim() !== '').join(',');
    
    // 2. floor_numbers column gets the complex format: Name=Floors@Rooms+...
    const complexString = infrastructure
        .filter(b => b.name.trim() !== '')
        .map(b => `${b.name}=${b.floors}@${b.rooms}`)
        .join('+');

    const dataToSave = {
        ...profile,
        building_number: buildingNames,
        floor_numbers: complexString
    };

    const { error } = await supabase.from('owner').upsert(dataToSave);

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

        {/* Infrastructure Section */}
        <div className="md:col-span-2 border-t pt-6 mt-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">School Infrastructure</h3>
                <button type="button" onClick={handleAddBuilding} className="flex items-center text-sm text-primary hover:text-primary-dark">
                    <PlusIcon className="w-4 h-4 mr-1"/> Add Building
                </button>
            </div>
            
            <div className="space-y-4">
                {infrastructure.length === 0 && <p className="text-gray-500 text-sm italic">No infrastructure details added. Click 'Add Building' to start.</p>}
                {infrastructure.map((building, index) => (
                    <div key={building.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative group">
                        <button 
                            type="button" 
                            onClick={() => handleRemoveBuilding(building.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Building"
                        >
                            <DeleteIcon />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Building Name/No.</label>
                                <input 
                                    type="text" 
                                    value={building.name} 
                                    onChange={(e) => handleBuildingChange(building.id, 'name', e.target.value)}
                                    placeholder="e.g. Block A" 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Floors</label>
                                <input 
                                    type="text" 
                                    value={building.floors} 
                                    onChange={(e) => handleBuildingChange(building.id, 'floors', e.target.value)}
                                    placeholder="e.g. Ground, 1st, 2nd" 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                                <span className="text-[10px] text-gray-400">Comma separated</span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Rooms</label>
                                <input 
                                    type="text" 
                                    value={building.rooms} 
                                    onChange={(e) => handleBuildingChange(building.id, 'rooms', e.target.value)}
                                    placeholder="e.g. 101, 102, Lab 1" 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                                <span className="text-[10px] text-gray-400">Comma separated</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="md:col-span-2 flex justify-end items-center gap-4 mt-4 border-t pt-6">
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
