'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiClient as api } from '@/lib/api';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Building {
  id: string;
  name: string;
  code: string;
  building_type: string;
  latitude: number;
  longitude: number;
  description: string;
  floor_count: string;
  capacity: string;
}

interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  visibility: string;
  is_active: boolean;
  building_id: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
    profile_picture: string | null;
  };
  building: Building | null;
}

// Custom marker icon for buildings
const buildingIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    academic: '🏫',
    hostel: '🏠',
    dining: '🍽️',
    sports: '⚽',
    administrative: '🏢',
    recreational: '🎭',
    library: '📚',
    other: '📍',
  };
  
  return L.divIcon({
    html: `<div style="font-size: 24px;">${iconMap[type] || '📍'}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Custom marker icon for users with profile picture
const userIcon = (profilePicture: string | null, fullName: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const imageUrl = profilePicture 
    ? `${apiUrl}${profilePicture}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&size=40`;
  
  return L.divIcon({
    html: `
      <div style="
        width: 40px; 
        height: 40px; 
        border-radius: 50%; 
        border: 3px solid #3b82f6;
        background: white;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <img 
          src="${imageUrl}" 
          alt="${fullName}"
          style="width: 100%; height: 100%; object-fit: cover;"
        />
      </div>
    `,
    className: 'custom-user-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to recenter map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function CampusMap() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.3535, 76.3740]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadMapData();
    // Set up WebSocket for real-time location updates
    setupWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const loadMapData = async () => {
    try {
      setLoading(true);
      
      // Load buildings
      const buildingsResponse = await api.get('/buildings/');
      setBuildings(buildingsResponse.data);
      
      // Load active user locations
      const locationsResponse = await api.get('/locations/nearby?radius=10000&limit=100');
      setUserLocations(locationsResponse.data);
      
      // Center map on first building or default location
      if (buildingsResponse.data.length > 0) {
        const firstBuilding = buildingsResponse.data[0];
        setMapCenter([firstBuilding.latitude, firstBuilding.longitude]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to load map data:', err);
      setError(err.response?.data?.detail || 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // WebSocket setup for real-time location updates
    // This would connect to a location broadcasting WebSocket endpoint
    // For now, we'll poll periodically
    const interval = setInterval(() => {
      loadUserLocations();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  };

  const loadUserLocations = async () => {
    try {
      const locationsResponse = await api.get('/locations/nearby?radius=10000&limit=100');
      setUserLocations(locationsResponse.data);
    } catch (err) {
      console.error('Failed to refresh user locations:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campus map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadMapData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative">
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h2 className="text-lg font-bold mb-2">Campus Map</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">Buildings:</span> {buildings.length}
          </div>
          <div>
            <span className="font-semibold">Active Users:</span> {userLocations.length}
          </div>
          <div className="pt-2 border-t">
            <button
              onClick={loadMapData}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏫</span>
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span>Hostel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span>Dining</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span>Library</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-blue-600 bg-white"></div>
            <span>Students</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={mapCenter} />

        {/* Building Markers */}
        {buildings.map((building) => (
          <Marker
            key={building.id}
            position={[building.latitude, building.longitude]}
            icon={buildingIcon(building.building_type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{building.name}</h3>
                {building.code && (
                  <p className="text-sm text-gray-600">Code: {building.code}</p>
                )}
                <p className="text-sm mt-1">{building.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Type: {building.building_type}</p>
                  {building.floor_count && <p>Floors: {building.floor_count}</p>}
                  {building.capacity && <p>Capacity: {building.capacity}</p>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Location Markers */}
        {userLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={userIcon(location.user.profile_picture, location.user.full_name)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{location.user.full_name}</h3>
                {location.building && (
                  <p className="text-sm text-gray-600">
                    Near: {location.building.name}
                  </p>
                )}
                {location.address && (
                  <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
