'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DEV_MODE, mockDelay } from '@/lib/devMode';

interface Location {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  visibility: 'public' | 'friends' | 'private';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NearbyUser {
  user_id: string;
  full_name: string;
  year: number | null;
  branch: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  distance_km: number;
  updated_at: string;
}

interface LocationContextType {
  myLocation: Location | null;
  nearbyUsers: NearbyUser[];
  isSharing: boolean;
  loading: boolean;
  error: string | null;
  shareLocation: (latitude: number, longitude: number, address?: string, visibility?: string) => Promise<void>;
  updateLocation: (data: Partial<Location>) => Promise<void>;
  stopSharing: () => Promise<void>;
  fetchMyLocation: () => Promise<void>;
  fetchNearbyUsers: (maxDistance?: number) => Promise<void>;
  toggleSharing: (isActive: boolean) => Promise<void>;
  getCurrentPosition: () => Promise<{ latitude: number; longitude: number }>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const getCurrentPosition = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const fetchMyLocation = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Dev Mode: Use mock location
      if (DEV_MODE.useMockData) {
        await mockDelay();
        const mockLoc = localStorage.getItem('mock_location');
        if (mockLoc) {
          const data = JSON.parse(mockLoc);
          setMyLocation(data);
          setIsSharing(data.is_active);
        } else {
          setMyLocation(null);
          setIsSharing(false);
        }
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/locations/me`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setMyLocation(data);
        setIsSharing(data.is_active);
      } else if (response.status === 404) {
        setMyLocation(null);
        setIsSharing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch location');
      }
    } catch (err) {
      setError('Failed to fetch location');
      console.error('Error fetching location:', err);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  const shareLocation = useCallback(async (
    latitude: number,
    longitude: number,
    address?: string,
    visibility: string = 'friends'
  ) => {
    if (!user) {
      setError('You must be logged in to share location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dev Mode: Mock share location
      if (DEV_MODE.useMockData) {
        await mockDelay();
        const mockLoc = {
          ...DEV_MODE.mockLocation,
          latitude,
          longitude,
          address: address || null,
          visibility: visibility as 'public' | 'friends' | 'private',
          is_active: true,
        };
        localStorage.setItem('mock_location', JSON.stringify(mockLoc));
        setMyLocation(mockLoc);
        setIsSharing(true);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/locations/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          latitude,
          longitude,
          address: address || null,
          visibility,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMyLocation(data);
        setIsSharing(data.is_active);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to share location');
        throw new Error(errorData.detail || 'Failed to share location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to share location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  const updateLocation = useCallback(async (data: Partial<Location>) => {
    if (!user || !myLocation) {
      setError('No location to update');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/locations/${myLocation.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setMyLocation(updatedData);
        setIsSharing(updatedData.is_active);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update location');
        throw new Error(errorData.detail || 'Failed to update location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update location');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, myLocation, API_URL]);

  const stopSharing = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Dev Mode: Mock stop sharing
      if (DEV_MODE.useMockData) {
        await mockDelay();
        localStorage.removeItem('mock_location');
        setMyLocation(null);
        setIsSharing(false);
        setNearbyUsers([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/locations/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok || response.status === 204) {
        setMyLocation(null);
        setIsSharing(false);
        setNearbyUsers([]);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to stop sharing');
      }
    } catch (err) {
      setError('Failed to stop sharing');
      console.error('Error stopping sharing:', err);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  const toggleSharing = useCallback(async (isActive: boolean) => {
    if (!user || !myLocation) {
      setError('No location to toggle');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dev Mode: Mock toggle
      if (DEV_MODE.useMockData) {
        await mockDelay();
        const updatedLoc = { ...myLocation, is_active: isActive };
        localStorage.setItem('mock_location', JSON.stringify(updatedLoc));
        setMyLocation(updatedLoc);
        setIsSharing(isActive);
        if (!isActive) {
          setNearbyUsers([]);
        }
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/locations/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        setMyLocation(data);
        setIsSharing(data.is_active);
        if (!data.is_active) {
          setNearbyUsers([]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to toggle sharing');
      }
    } catch (err) {
      setError('Failed to toggle sharing');
      console.error('Error toggling sharing:', err);
    } finally {
      setLoading(false);
    }
  }, [user, myLocation, API_URL]);

  const fetchNearbyUsers = useCallback(async (maxDistance: number = 5.0) => {
    if (!user || !isSharing) return;

    setLoading(true);
    setError(null);

    try {
      // Dev Mode: Use mock nearby users
      if (DEV_MODE.useMockData) {
        await mockDelay();
        setNearbyUsers(DEV_MODE.mockNearbyUsers);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/locations/nearby?max_distance=${maxDistance}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNearbyUsers(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch nearby users');
      }
    } catch (err) {
      setError('Failed to fetch nearby users');
      console.error('Error fetching nearby users:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isSharing, API_URL]);

  // Auto-fetch location on mount if user is logged in
  useEffect(() => {
    if (user) {
      fetchMyLocation();
    }
  }, [user, fetchMyLocation]);

  const value: LocationContextType = {
    myLocation,
    nearbyUsers,
    isSharing,
    loading,
    error,
    shareLocation,
    updateLocation,
    stopSharing,
    fetchMyLocation,
    fetchNearbyUsers,
    toggleSharing,
    getCurrentPosition,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
