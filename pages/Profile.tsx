
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { OwnerProfile, HostelBuilding } from '../types';
import Spinner from '../components/Spinner';
import ImageUpload from '../components/ImageUpload';
import { sanitizeForPath } from '../utils/textUtils';
import DeleteIcon from '../components/icons/DeleteIcon';
import PlusIcon from '../components/icons/PlusIcon';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [hostelData, setHostelData] = useState<HostelBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Temporary inputs state
  const [newFloorInputs, setNewFloorInputs] = useState<{[buildingId: string]: string}>({});
  const [newRoomInputs, setNewRoomInputs] = useState<{[floorId: string]: string}>({});

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('owner')
      .select('*')
      .eq('uid', user.id)
      .single();

    if (data) {
      setProfile(data);
      // Load hostel management data directly from the JSON column
      if (data.hostel_managment) {
          // Ensure it's treated as an array of HostelBuilding
          setHostelData(data.hostel_managment as HostelBuilding[]);
      } else {
          setHostelData([]);
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

  // --- Hostel Management Logic ---

  const handleAddBuilding = () => {
      const newBuilding: HostelBuilding = {
          id: crypto.randomUUID(),
          name: '',
          floors: []
      };
      setHostelData([...hostelData, newBuilding]);
  };

  const handleRemoveBuilding = (buildingId: string) => {
      if(window.confirm('Delete this building and all its floors/rooms?')) {
          setHostelData(hostelData.filter(b => b.id !== buildingId));
      }
  };

  const handleBuildingNameChange = (buildingId: string, name: string) => {
      setHostelData(hostelData.map(b => b.id === buildingId ? { ...b, name } : b));
  };

  const handleAddFloor = (buildingId: string) => {
      const floorName = newFloorInputs[buildingId];
      if (!floorName || !floorName.trim()) return;

      setHostelData(hostelData.map(b => {
          if (b.id === buildingId) {
              return {
                  ...b,
                  floors: [...b.floors, { id: crypto.randomUUID(), name: floorName.trim(), rooms: [] }]
              };
          }
          return b;
      }));
      setNewFloorInputs({ ...newFloorInputs, [buildingId]: '' });
  };

  const handleRemoveFloor = (buildingId: string, floorId: string) => {
      setHostelData(hostelData.map(b => {
          if (b.id === buildingId) {
              return { ...b, floors: b.floors.filter(f => f.id !== floorId) };
          }
          return b;
      }));
  };

  const handleAddRoom = (buildingId: string, floorId: string) => {
      const roomNum = newRoomInputs[floorId];
      if (!roomNum || !roomNum.trim()) return;

      setHostelData(hostelData.map(b => {
          if (b.id === buildingId) {
              const updatedFloors = b.floors.map(f => {
                  if (f.id === floorId) {
                      return { ...f, rooms: [...f.rooms, roomNum.trim()] };
                  }
                  return f;
              });
              return { ...b, floors: updatedFloors };
          }
          return b;
      }));
      setNewRoomInputs({ ...newRoomInputs, [floorId]: '' });
  };

  const handleRemoveRoom = (buildingId: string, floorId: string, roomIndex: number) => {
      setHostelData(hostelData.map(b => {
          if (b.id === buildingId) {
              const updatedFloors = b.floors.map(f => {
                  if (f.id === floorId) {
                      const newRooms = [...f.rooms];
                      newRooms.splice(roomIndex, 1);
                      return { ...f, rooms: newRooms };
                  }
                  return f;
              });
              return { ...b, floors: updatedFloors };
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

    // Save profile data along with the structured hostel_managment JSON
    const dataToSave = {
        ...profile,
        hostel_managment: hostelData
    };

    const { error } = await supabase.from('owner').upsert(dataToSave);

    if (error) {
      setMessage({ type: 'error', text: `Error saving profile: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'Profile and Hostel Infrastructure saved successfully!' });
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
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{profileExists ? 'Edit Your School Profile' : 'Create Your School Profile'}</h1>
      {message && (
        <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
            <label htmlFor="school_name" className="block text-sm font-medium text-gray-700">School Name</label>
            <input type="text" name="school_name" id="school_name" value={profile?.school_name || ''} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm input-field"/>
        </div>
        <div>
            <label htmlFor="principal_name" className="block text-sm font-medium text-gray-700">Principal Name</label>
            <input type="text" name="principal_name" id="principal_name" value={profile?.principal_name || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm input-field"/>
        </div>
        <div>
            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input type="tel" name="mobile_number" id="mobile_number" value={profile?.mobile_number || ''} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm input-field"/>
        </div>
        <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea name="address" id="address" rows={3} value={profile?.address || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm input-field"/>
        </div>
        <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website URL</label>
            <input type="url" name="website" id="website" value={profile?.website || ''} onChange={handleInputChange} placeholder="https://example.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm input-field"/>
        </div>
         <div>
            <label htmlFor="school_code" className="block text-sm font-medium text-gray-700">School Code</label>
            <input type="text" name="school_code" id="school_code" value={profile?.school_code || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm input-field"/>
        </div>
        
        <ImageUpload
            label="School Logo"
            currentUrl={profile?.school_image_url}
            onUrlChange={handleImageUrlChange}
            getUploadPath={getSchoolImagePath}
        />

        {/* Hostel Management Section */}
        <div className="md:col-span-2 border-t border-gray-200 pt-8 mt-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        Hostel Infrastructure
                    </h3>
                    <p className="text-sm text-gray-500">Define buildings, floors, and rooms for student assignment.</p>
                </div>
                <button type="button" onClick={handleAddBuilding} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
                    <PlusIcon className="w-4 h-4 mr-2"/> Add Building
                </button>
            </div>
            
            <div className="space-y-6">
                {hostelData.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <p className="text-gray-500">No infrastructure added yet.</p>
                        <button type="button" onClick={handleAddBuilding} className="mt-2 text-primary hover:underline font-medium">Create your first building</button>
                    </div>
                )}
                
                {hostelData.map((building) => (
                    <div key={building.id} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                        {/* Building Header */}
                        <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Building Name</label>
                                <input 
                                    type="text" 
                                    value={building.name} 
                                    onChange={(e) => handleBuildingNameChange(building.id, e.target.value)}
                                    placeholder="e.g. Boys Hostel A" 
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-bold text-gray-800 bg-white"
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveBuilding(building.id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Building"
                            >
                                <DeleteIcon />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50">
                            {/* Floors List */}
                            <div className="space-y-4">
                                {building.floors.map((floor) => (
                                    <div key={floor.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                            <h4 className="font-semibold text-gray-700 text-sm">{floor.name}</h4>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveFloor(building.id, floor.id)}
                                                className="text-xs text-red-500 hover:text-red-700 hover:underline"
                                            >
                                                Remove Floor
                                            </button>
                                        </div>
                                        
                                        {/* Rooms in Floor */}
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-xs text-gray-500 font-medium mr-1">Rooms:</span>
                                            {floor.rooms.map((room, idx) => (
                                                <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-xs font-medium">
                                                    {room}
                                                    <button type="button" onClick={() => handleRemoveRoom(building.id, floor.id, idx)} className="ml-1.5 text-blue-400 hover:text-blue-600 font-bold focus:outline-none leading-none">
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {/* Add Room Input */}
                                            <div className="flex items-center gap-1 ml-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Room No." 
                                                    value={newRoomInputs[floor.id] || ''}
                                                    onChange={(e) => setNewRoomInputs({...newRoomInputs, [floor.id]: e.target.value})}
                                                    className="w-20 rounded border-gray-300 py-1 px-2 text-xs focus:ring-primary focus:border-primary"
                                                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddRoom(building.id, floor.id); } }}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleAddRoom(building.id, floor.id)}
                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-2 py-1 text-xs font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Floor Section */}
                            <div className="mt-4 flex gap-2 items-center pt-4 border-t border-gray-200">
                                <input 
                                    type="text" 
                                    placeholder="New Floor Name (e.g. 1st Floor)" 
                                    value={newFloorInputs[building.id] || ''}
                                    onChange={(e) => setNewFloorInputs({...newFloorInputs, [building.id]: e.target.value})}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddFloor(building.id); } }}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleAddFloor(building.id)} 
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm"
                                >
                                    Add Floor
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="md:col-span-2 flex justify-end items-center gap-4 mt-4 border-t border-gray-200 pt-6">
             {profileExists && (
                <button type="button" onClick={handleDelete} disabled={saving} className="px-6 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors text-sm font-medium">
                    Delete Profile
                </button>
            )}
            <button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2 transition-colors text-sm font-bold shadow-md">
                 {saving && <Spinner size="5" />}
                 {saving ? 'Saving...' : 'Save All Changes'}
            </button>
        </div>
      </form>
      <style>{`
        .input-field {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default Profile;
