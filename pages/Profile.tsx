
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
    floors: string[]; // List of floor names
    rooms: string[];  // List of room names
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [infrastructure, setInfrastructure] = useState<BuildingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Temporary state for inputs
  const [newFloorInputs, setNewFloorInputs] = useState<{[key: string]: string}>({});
  const [newRoomInputs, setNewRoomInputs] = useState<{[key: string]: string}>({});

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
                  const [floorsStr, roomsStr] = rest ? rest.split('@') : ['', ''];
                  
                  return {
                      id: Date.now().toString() + index,
                      name: name || '',
                      floors: floorsStr ? floorsStr.split(',').filter(Boolean) : [],
                      rooms: roomsStr ? roomsStr.split(',').filter(Boolean) : []
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

  // --- Infrastructure Handlers ---

  const handleAddBuilding = () => {
      setInfrastructure([...infrastructure, { id: Date.now().toString(), name: '', floors: [], rooms: [] }]);
  };

  const handleRemoveBuilding = (id: string) => {
      setInfrastructure(infrastructure.filter(b => b.id !== id));
  };

  const handleBuildingNameChange = (id: string, value: string) => {
      setInfrastructure(infrastructure.map(b => b.id === id ? { ...b, name: value } : b));
  };

  // Floors
  const handleAddFloor = (buildingId: string) => {
      const val = newFloorInputs[buildingId];
      if (!val || !val.trim()) return;

      setInfrastructure(infrastructure.map(b => {
          if (b.id === buildingId) {
              return { ...b, floors: [...b.floors, val.trim()] };
          }
          return b;
      }));
      setNewFloorInputs({ ...newFloorInputs, [buildingId]: '' });
  };

  const handleRemoveFloor = (buildingId: string, floorIndex: number) => {
      setInfrastructure(infrastructure.map(b => {
          if (b.id === buildingId) {
              const newFloors = [...b.floors];
              newFloors.splice(floorIndex, 1);
              return { ...b, floors: newFloors };
          }
          return b;
      }));
  };

  // Rooms
  const handleAddRoom = (buildingId: string) => {
      const val = newRoomInputs[buildingId];
      if (!val || !val.trim()) return;

      setInfrastructure(infrastructure.map(b => {
          if (b.id === buildingId) {
              return { ...b, rooms: [...b.rooms, val.trim()] };
          }
          return b;
      }));
      setNewRoomInputs({ ...newRoomInputs, [buildingId]: '' });
  };

  const handleRemoveRoom = (buildingId: string, roomIndex: number) => {
      setInfrastructure(infrastructure.map(b => {
          if (b.id === buildingId) {
              const newRooms = [...b.rooms];
              newRooms.splice(roomIndex, 1);
              return { ...b, rooms: newRooms };
          }
          return b;
      }));
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
    // Floors are joined by commas, Rooms are joined by commas
    const complexString = infrastructure
        .filter(b => b.name.trim() !== '')
        .map(b => {
            const floorsStr = b.floors.join(',');
            const roomsStr = b.rooms.join(',');
            return `${b.name}=${floorsStr}@${roomsStr}`;
        })
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
        <div className="md:col-span-2 border-t pt-6 mt-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">School Infrastructure</h3>
                    <p className="text-sm text-gray-500">Manage your buildings, floors, and rooms.</p>
                </div>
                <button type="button" onClick={handleAddBuilding} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2"/> Add Building
                </button>
            </div>
            
            <div className="space-y-6">
                {infrastructure.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <p className="text-gray-500">No buildings added yet.</p>
                        <button type="button" onClick={handleAddBuilding} className="mt-2 text-primary hover:underline font-medium">Add your first building</button>
                    </div>
                )}
                
                {infrastructure.map((building) => (
                    <div key={building.id} className="border border-gray-300 rounded-xl p-5 bg-white shadow-sm relative">
                        <button 
                            type="button" 
                            onClick={() => handleRemoveBuilding(building.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 border border-transparent hover:border-red-100"
                            title="Remove Building"
                        >
                            <DeleteIcon />
                        </button>
                        
                        {/* Building Name */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Building Name / Number</label>
                            <input 
                                type="text" 
                                value={building.name} 
                                onChange={(e) => handleBuildingNameChange(building.id, e.target.value)}
                                placeholder="e.g. Main Block, Hostel A, 2563" 
                                className="block w-full max-w-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-semibold"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Floors Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Floors</label>
                                <div className="space-y-2 mb-3">
                                    {building.floors.map((floor, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200 shadow-sm">
                                            <span className="text-sm text-gray-800">{floor}</span>
                                            <button type="button" onClick={() => handleRemoveFloor(building.id, idx)} className="text-red-400 hover:text-red-600">
                                                <span className="text-xs font-bold">✕</span>
                                            </button>
                                        </div>
                                    ))}
                                    {building.floors.length === 0 && <p className="text-xs text-gray-400 italic">No floors added.</p>}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Floor Name (e.g. 1st)" 
                                        value={newFloorInputs[building.id] || ''}
                                        onChange={(e) => setNewFloorInputs({...newFloorInputs, [building.id]: e.target.value})}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddFloor(building.id); } }}
                                    />
                                    <button type="button" onClick={() => handleAddFloor(building.id)} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-100">Add</button>
                                </div>
                            </div>

                            {/* Rooms Section */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Rooms</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {building.rooms.map((room, idx) => (
                                        <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                            <span className="text-xs font-medium mr-2">{room}</span>
                                            <button type="button" onClick={() => handleRemoveRoom(building.id, idx)} className="text-blue-400 hover:text-blue-600 leading-none">
                                                <span className="text-xs">✕</span>
                                            </button>
                                        </div>
                                    ))}
                                    {building.rooms.length === 0 && <p className="text-xs text-gray-400 italic w-full">No rooms added.</p>}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Room No (e.g. 101)" 
                                        value={newRoomInputs[building.id] || ''}
                                        onChange={(e) => setNewRoomInputs({...newRoomInputs, [building.id]: e.target.value})}
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-xs py-1.5"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddRoom(building.id); } }}
                                    />
                                    <button type="button" onClick={() => handleAddRoom(building.id)} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-100">Add</button>
                                </div>
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
