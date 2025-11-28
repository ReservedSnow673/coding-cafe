'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiCamera, FiSave, FiX, FiUser } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    year: '',
    branch: '',
    hostel: '',
    bio: ''
  });
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        year: user.year?.toString() || '',
        branch: user.branch || '',
        hostel: user.hostel || '',
        bio: user.bio || ''
      });
      
      if (user.profile_picture) {
        setProfilePicturePreview(`${process.env.NEXT_PUBLIC_API_URL}/${user.profile_picture}`);
      }
    }
  }, [user, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPicture = async () => {
    if (!profilePicture) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', profilePicture);
      
      const response = await api.post('/users/me/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfilePicturePreview(`${process.env.NEXT_PUBLIC_API_URL}/${response.data.profile_picture}`);
      setProfilePicture(null);
      alert('Profile picture updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/users/me', {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null
      });
      
      setEditing(false);
      alert('Profile updated successfully!');
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-dark-secondary rounded-2xl border border-dark-secondary p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-accent-lime text-dark rounded-lg font-semibold hover:opacity-90"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Profile Picture */}
            <div className="md:col-span-1">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-48 h-48 rounded-full overflow-hidden bg-dark-secondary border-4 border-accent-lime mx-auto">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <FiUser size={64} />
                      </div>
                    )}
                  </div>
                  
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-accent-lime text-dark p-3 rounded-full cursor-pointer hover:opacity-90">
                      <FiCamera size={20} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                {profilePicture && (
                  <button
                    onClick={handleUploadPicture}
                    disabled={uploading}
                    className="mt-4 px-4 py-2 bg-accent-lime text-dark rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Picture'}
                  </button>
                )}
                
                <div className="mt-6">
                  <p className="text-gray-400 text-sm">Member since</p>
                  <p className="text-white">{new Date(user?.created_at || '').toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Info */}
            <div className="md:col-span-2 space-y-6">
              {editing ? (
                <>
                  {/* Edit Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-dark border border-dark-secondary text-white focus:border-accent-lime focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark border border-dark-secondary text-white focus:border-accent-lime focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Year
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark border border-dark-secondary text-white focus:border-accent-lime focus:outline-none"
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Branch
                      </label>
                      <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark border border-dark-secondary text-white focus:border-accent-lime focus:outline-none"
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hostel
                      </label>
                      <input
                        type="text"
                        name="hostel"
                        value={formData.hostel}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-dark border border-dark-secondary text-white focus:border-accent-lime focus:outline-none"
                        placeholder="e.g., A Block"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-dark border border-dark-secondary text-white focus:border-accent-lime focus:outline-none resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent-lime text-dark rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      <FiSave size={20} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 bg-dark-secondary border border-gray-600 text-white rounded-lg hover:bg-dark"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <p className="text-xl text-white font-semibold">{user?.full_name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white">{user?.email}</p>
                  </div>

                  {user?.phone_number && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                      <p className="text-white">{user.phone_number}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                      <p className="text-white">{user?.year ? `${user.year}${['st', 'nd', 'rd', 'th'][Math.min(user.year - 1, 3)]} Year` : 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Branch</label>
                      <p className="text-white">{user?.branch || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Hostel</label>
                    <p className="text-white">{user?.hostel || 'Not specified'}</p>
                  </div>

                  {user?.bio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                      <p className="text-white whitespace-pre-wrap">{user.bio}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
