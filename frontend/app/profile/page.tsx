'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiCamera, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiEdit2 } from 'react-icons/fi';
import Navbar from '@/components/Navbar';

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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="animate-pulse text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto scrollbar-custom bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-slide-up">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <FiUser className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-black dark:text-white">My Profile</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information</p>
                </div>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary px-6 py-3 font-semibold flex items-center gap-2"
                >
                  <FiEdit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Profile Picture */}
              <div className="md:col-span-1">
                <div className="card p-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary dark:border-secondary mx-auto">
                        {profilePicturePreview ? (
                          <img
                            src={profilePicturePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                            <FiUser size={64} />
                          </div>
                        )}
                      </div>
                      
                      {editing && (
                        <label className="absolute bottom-2 right-2 bg-primary dark:bg-secondary text-white p-3 rounded-full cursor-pointer hover:opacity-90 transition-opacity shadow-lg">
                          <FiCamera size={18} />
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
                        className="btn-primary w-full mb-4 py-2.5 font-medium disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload Picture'}
                      </button>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Member since</p>
                      <p className="text-black dark:text-white font-medium">{new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Info */}
              <div className="md:col-span-2 space-y-6">
                {editing ? (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Edit Profile</h2>
                    
                    {/* Edit Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="+91-1234567890"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Year
                        </label>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleInputChange}
                          className="input-field"
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Branch
                        </label>
                        <input
                          type="text"
                          name="branch"
                          value={formData.branch}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hostel
                        </label>
                        <input
                          type="text"
                          name="hostel"
                          value={formData.hostel}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="e.g., A Block"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="input-field resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="btn-primary flex-1 py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FiSave size={20} />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="px-6 py-3 rounded-button border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                      >
                        <FiX size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* View Mode */}
                    <div className="card p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <FiUser className="w-5 h-5 text-primary dark:text-secondary mt-1" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                          <p className="text-xl text-black dark:text-white font-semibold">{user?.full_name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <FiMail className="w-5 h-5 text-primary dark:text-secondary mt-1" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
                          <p className="text-black dark:text-white">{user?.email}</p>
                        </div>
                      </div>

                      {user?.phone_number && (
                        <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                          <FiPhone className="w-5 h-5 text-primary dark:text-secondary mt-1" />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                            <p className="text-black dark:text-white">{user.phone_number}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="card p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                          <FiCalendar className="w-5 h-5 text-primary dark:text-secondary mt-1" />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Year</label>
                            <p className="text-black dark:text-white font-medium">
                              {user?.year ? `${user.year}${['st', 'nd', 'rd', 'th'][Math.min(user.year - 1, 3)]} Year` : 'Not specified'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <FiUser className="w-5 h-5 text-primary dark:text-secondary mt-1" />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Branch</label>
                            <p className="text-black dark:text-white font-medium">{user?.branch || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                        <FiMapPin className="w-5 h-5 text-primary dark:text-secondary mt-1" />
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hostel</label>
                          <p className="text-black dark:text-white font-medium">{user?.hostel || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {user?.bio && (
                      <div className="card p-6">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Bio</label>
                        <p className="text-black dark:text-white whitespace-pre-wrap leading-relaxed">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
