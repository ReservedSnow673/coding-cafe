'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useLocation } from '@/contexts';
import { 
  FiMapPin, 
  FiUsers, 
  FiEye, 
  FiEyeOff, 
  FiRefreshCw, 
  FiSettings,
  FiNavigation,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import Navbar from '@/components/Navbar';

export default function LocationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    myLocation,
    nearbyUsers,
    isSharing,
    loading,
    error,
    shareLocation,
    updateLocation,
    stopSharing,
    fetchNearbyUsers,
    toggleSharing,
    getCurrentPosition,
  } = useLocation();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<string>('friends');
  const [maxDistance, setMaxDistance] = useState(5);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (myLocation) {
      setSelectedVisibility(myLocation.visibility);
    }
  }, [myLocation]);

  useEffect(() => {
    if (isSharing) {
      fetchNearbyUsers(maxDistance);
    }
  }, [isSharing, maxDistance, fetchNearbyUsers]);

  const handleStartSharing = async () => {
    setLocationError(null);
    setSuccessMessage(null);

    try {
      const position = await getCurrentPosition();
      await shareLocation(
        position.latitude,
        position.longitude,
        undefined,
        selectedVisibility
      );
      setSuccessMessage('Location sharing started!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setLocationError(err.message || 'Failed to get your location');
    }
  };

  const handleStopSharing = async () => {
    try {
      await stopSharing();
      setSuccessMessage('Location sharing stopped');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setLocationError('Failed to stop sharing');
    }
  };

  const handleToggleSharing = async () => {
    try {
      await toggleSharing(!isSharing);
      setSuccessMessage(isSharing ? 'Location sharing paused' : 'Location sharing resumed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setLocationError('Failed to toggle sharing');
    }
  };

  const handleUpdateVisibility = async (visibility: string) => {
    if (!myLocation) return;

    try {
      await updateLocation({ visibility: visibility as any });
      setSelectedVisibility(visibility);
      setSuccessMessage('Privacy settings updated');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setLocationError('Failed to update privacy settings');
    }
  };

  const handleRefreshLocation = async () => {
    if (!myLocation) return;

    setLocationError(null);
    try {
      const position = await getCurrentPosition();
      await updateLocation({
        latitude: position.latitude,
        longitude: position.longitude,
      });
      setSuccessMessage('Location updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchNearbyUsers(maxDistance);
    } catch (err: any) {
      setLocationError(err.message || 'Failed to update location');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-black">
      <Navbar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-light-card dark:bg-dark-card/30 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <FiMapPin className="text-lg text-white" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-black dark:text-white">
                  Location Sharing
                </h1>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-primary/20 dark:bg-secondary/20 text-primary dark:text-secondary' : 'hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-gray-400'
              }`}
            >
              <FiSettings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 card p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <FiCheck className="w-5 h-5" />
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {(error || locationError) && (
          <div className="mb-4 card p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <FiAlertCircle className="w-5 h-5" />
              <p>{error || locationError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Status Card */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Your Location</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isSharing ? 'Currently sharing your location' : 'Location sharing is off'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${isSharing ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <FiMapPin className={`w-6 h-6 ${isSharing ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`} />
                </div>
              </div>

              {myLocation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-dark-card rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latitude</p>
                      <p className="font-mono text-black dark:text-white">{myLocation.latitude.toFixed(6)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-card rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longitude</p>
                      <p className="font-mono text-black dark:text-white">{myLocation.longitude.toFixed(6)}</p>
                    </div>
                  </div>

                  {myLocation.address && (
                    <div className="bg-gray-50 dark:bg-dark-card rounded-xl p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                      <p className="text-black dark:text-white">{myLocation.address}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleToggleSharing}
                      disabled={loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isSharing
                          ? 'bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400'
                      } disabled:opacity-50`}
                    >
                      {isSharing ? <FiEyeOff /> : <FiEye />}
                      {isSharing ? 'Pause Sharing' : 'Resume Sharing'}
                    </button>

                    <button
                      onClick={handleRefreshLocation}
                      disabled={loading || !isSharing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors disabled:opacity-50"
                    >
                      <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                      Update Location
                    </button>

                    <button
                      onClick={handleStopSharing}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                    >
                      Stop Sharing
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiNavigation className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Start sharing your location to see nearby users</p>
                  <button
                    onClick={handleStartSharing}
                    disabled={loading}
                    className="btn-primary px-6 py-3 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Starting...' : 'Start Sharing Location'}
                  </button>
                </div>
              )}
            </div>

            {/* Nearby Users Card */}
            {isSharing && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                      <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-black dark:text-white">Nearby Users</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{nearbyUsers.length} users within {maxDistance} km</p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchNearbyUsers(maxDistance)}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <FiRefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {nearbyUsers.length > 0 ? (
                  <div className="space-y-3">
                    {nearbyUsers.map((user) => (
                      <div key={user.user_id} className="bg-gray-50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-hover rounded-xl p-4 transition-colors border border-gray-200 dark:border-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 text-black dark:text-white">{user.full_name}</h3>
                            {(user.year || user.branch) && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {user.year && `Year ${user.year}`}
                                {user.year && user.branch && ' • '}
                                {user.branch}
                              </p>
                            )}
                            {user.address && (
                              <p className="text-sm text-gray-500 dark:text-gray-500">{user.address}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
                              {user.distance_km.toFixed(2)} km
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                    <p>No users nearby</p>
                    <p className="text-sm mt-1">Try increasing the search radius</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className={`space-y-6 ${showSettings ? 'block' : 'hidden lg:block'}`}>
            {/* Privacy Settings */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Privacy Settings</h3>
              <div className="space-y-3">
                {[
                  { value: 'public', label: 'Public', desc: 'Everyone can see your location' },
                  { value: 'friends', label: 'Friends', desc: 'Only friends can see' },
                  { value: 'private', label: 'Private', desc: 'Only you can see' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleUpdateVisibility(option.value)}
                    disabled={!myLocation || loading}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedVisibility === option.value
                        ? 'bg-blue-100 dark:bg-blue-900/20 border border-blue-500 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-hover border border-transparent'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-black dark:text-white">{option.label}</span>
                      {selectedVisibility === option.value && (
                        <FiCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Radius */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Search Radius</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Distance</span>
                    <span className="font-medium text-black dark:text-white">{maxDistance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(47, 87, 85) 0%, rgb(47, 87, 85) ${(maxDistance / 20) * 100}%, rgb(229, 231, 235) ${(maxDistance / 20) * 100}%, rgb(229, 231, 235) 100%)`
                    }}
                  />
                </div>
                <button
                  onClick={() => fetchNearbyUsers(maxDistance)}
                  disabled={!isSharing || loading}
                  className="btn-primary w-full px-4 py-2 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="card p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Location Privacy</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your exact location is only shared with users based on your privacy settings. 
                    You can pause or stop sharing at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
