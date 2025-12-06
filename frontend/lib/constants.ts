/**
 * Application-wide constants
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const TOKEN_EXPIRY_KEY = 'token_expiry';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Notification Refresh Interval
export const NOTIFICATION_REFRESH_INTERVAL = 30000; // 30 seconds

// WebSocket Reconnect
export const WS_RECONNECT_DELAY = 3000; // 3 seconds
export const WS_MAX_RECONNECT_ATTEMPTS = 5;

// Theme
export const THEME_STORAGE_KEY = 'theme';
export const THEMES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student' as const,
  ADMIN: 'admin' as const,
  MODERATOR: 'moderator' as const,
};

// Announcement Categories
export const ANNOUNCEMENT_CATEGORIES = {
  GENERAL: 'general',
  ACADEMIC: 'academic',
  EVENT: 'event',
  EMERGENCY: 'emergency',
  HOSTEL: 'hostel',
  PLACEMENT: 'placement',
  CLUB: 'club',
} as const;

// Announcement Priorities
export const ANNOUNCEMENT_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Issue Status
export const ISSUE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

// Issue Categories
export const ISSUE_CATEGORIES = {
  INFRASTRUCTURE: 'infrastructure',
  FOOD: 'food',
  ACADEMICS: 'academics',
  HOSTEL: 'hostel',
  TRANSPORT: 'transport',
  WIFI: 'wifi',
  SPORTS: 'sports',
  OTHER: 'other',
} as const;

// Team Categories
export const TEAM_CATEGORIES = {
  PROJECT: 'project',
  COMPETITION: 'competition',
  STUDY: 'study',
  SPORTS: 'sports',
  CLUB: 'club',
  HACKATHON: 'hackathon',
  OTHER: 'other',
} as const;

// Team Status
export const TEAM_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// Meal Types
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACKS: 'snacks',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ANNOUNCEMENT: 'announcement',
  MESSAGE: 'message',
  ISSUE: 'issue',
  TEAM: 'team',
  CHALLENGE: 'challenge',
  MESS_REVIEW: 'mess_review',
  SYSTEM: 'system',
} as const;

// Location Visibility
export const LOCATION_VISIBILITY = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  HOSTEL: 'hostel',
  PRIVATE: 'private',
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [30.3165, 78.0322] as [number, number], // Plaksha campus coordinates
  DEFAULT_ZOOM: 16,
  MAX_ZOOM: 19,
  MIN_ZOOM: 14,
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  TIME_ONLY: 'h:mm a',
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Saved successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  CREATED: 'Created successfully',
} as const;
