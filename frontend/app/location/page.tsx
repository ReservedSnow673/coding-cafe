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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Location Sharing
              </h1>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${
                showSettings ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5'
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
          <div className="mb-4 glass rounded-xl p-4 border border-green-500/20 bg-green-500/10">
            <div className="flex items-center gap-2 text-green-400">
              <FiCheck className="w-5 h-5" />
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {(error || locationError) && (
          <div className="mb-4 glass rounded-xl p-4 border border-red-500/20 bg-red-500/10">
            <div className="flex items-center gap-2 text-red-400">
              <FiAlertCircle className="w-5 h-5" />
              <p>{error || locationError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Status Card */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Location</h2>
                  <p className="text-gray-400">
                    {isSharing ? 'Currently sharing your location' : 'Location sharing is off'}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${isSharing ? 'bg-green-500/20' : 'bg-gray-700/20'}`}>
                  <FiMapPin className={`w-6 h-6 ${isSharing ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
              </div>

              {myLocation ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Latitude</p>
                      <p className="font-mono">{myLocation.latitude.toFixed(6)}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Longitude</p>
                      <p className="font-mono">{myLocation.longitude.toFixed(6)}</p>
                    </div>
                  </div>

                  {myLocation.address && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">Address</p>
                      <p>{myLocation.address}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleToggleSharing}
                      disabled={loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isSharing
                          ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      } disabled:opacity-50`}
                    >
                      {isSharing ? <FiEyeOff /> : <FiEye />}
                      {isSharing ? 'Pause Sharing' : 'Resume Sharing'}
                    </button>

                    <button
                      onClick={handleRefreshLocation}
                      disabled={loading || !isSharing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors disabled:opacity-50"
                    >
                      <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                      Update Location
                    </button>

                    <button
                      onClick={handleStopSharing}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                    >
                      Stop Sharing
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiNavigation className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">Start sharing your location to see nearby users</p>
                  <button
                    onClick={handleStartSharing}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Starting...' : 'Start Sharing Location'}
                  </button>
                </div>
              )}
            </div>

            {/* Nearby Users Card */}
            {isSharing && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                      <FiUsers className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Nearby Users</h2>
                      <p className="text-sm text-gray-400">{nearbyUsers.length} users within {maxDistance} km</p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchNearbyUsers(maxDistance)}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {nearbyUsers.length > 0 ? (
                  <div className="space-y-3">
                    {nearbyUsers.map((user) => (
                      <div key={user.user_id} className="glass glass-hover rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{user.full_name}</h3>
                            {(user.year || user.branch) && (
                              <p className="text-sm text-gray-400 mb-2">
                                {user.year && `Year ${user.year}`}
                                {user.year && user.branch && ' • '}
                                {user.branch}
                              </p>
                            )}
                            {user.address && (
                              <p className="text-sm text-gray-500">{user.address}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">
                              {user.distance_km.toFixed(2)} km
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FiUsers className="w-12 h-12 mx-auto mb-3 text-gray-600" />
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
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
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
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'glass hover:bg-white/5 border border-transparent'
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{option.label}</span>
                      {selectedVisibility === option.value && (
                        <FiCheck className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Radius */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Search Radius</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Distance</span>
                    <span className="font-medium">{maxDistance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${(maxDistance / 20) * 100}%, rgb(55, 65, 81) ${(maxDistance / 20) * 100}%, rgb(55, 65, 81) 100%)`
                    }}
                  />
                </div>
                <button
                  onClick={() => fetchNearbyUsers(maxDistance)}
                  disabled={!isSharing || loading}
                  className="w-full px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="glass rounded-2xl p-6 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Location Privacy</h4>
                  <p className="text-sm text-gray-400">
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
  );
}
