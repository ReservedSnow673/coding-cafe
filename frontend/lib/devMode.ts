// Development Mode Configuration
// Set this to true to use mock data instead of real API calls

export const DEV_MODE = {
  // Toggle this to enable/disable mock mode
  useMockData: false,
  
  // Mock user data
  mockUser: {
    id: "mock-user-123",
    email: "dev@plaksha.edu.in",
    full_name: "Dev User",
    role: "student",
    year: 2,
    branch: "CSE",
    hostel: "A",
    bio: "Development mode user",
    phone_number: "+91-1234567890",
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Mock token
  mockToken: "mock-jwt-token-for-development",

  // Mock location data
  mockLocation: {
    id: "mock-location-123",
    user_id: "mock-user-123",
    latitude: 30.7333,
    longitude: 76.7794,
    address: "Plaksha University, Mohali, Punjab",
    visibility: "friends",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Mock nearby users
  mockNearbyUsers: [
    {
      user_id: "user-1",
      full_name: "Alice Johnson",
      year: 2,
      branch: "CSE",
      latitude: 30.7335,
      longitude: 76.7796,
      address: "Near Library",
      distance_km: 0.3,
      updated_at: new Date().toISOString(),
    },
    {
      user_id: "user-2",
      full_name: "Bob Smith",
      year: 3,
      branch: "ECE",
      latitude: 30.7340,
      longitude: 76.7800,
      address: "Hostel B",
      distance_km: 0.8,
      updated_at: new Date().toISOString(),
    },
    {
      user_id: "user-3",
      full_name: "Charlie Brown",
      year: 1,
      branch: "ME",
      latitude: 30.7345,
      longitude: 76.7805,
      address: "Campus Center",
      distance_km: 1.2,
      updated_at: new Date().toISOString(),
    },
  ],

  // API delays (in ms) to simulate network latency
  apiDelay: 500,
};

// Helper to simulate API delay
export const mockDelay = (ms: number = DEV_MODE.apiDelay) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock OTP for development
export const MOCK_OTP = "123456";

