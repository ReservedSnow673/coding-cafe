/**
 * Shared TypeScript type definitions for the application
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: 'student' | 'admin' | 'moderator';
  year?: number;
  branch?: string;
  hostel?: string;
  profile_picture?: string;
  bio?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  visibility: 'public' | 'friends' | 'hostel' | 'private';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NearbyUser {
  user_id: string;
  user_name: string;
  profile_picture?: string;
  distance: number;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'event' | 'emergency' | 'hostel' | 'placement' | 'club';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  author_id: string;
  author_name: string;
  target_year?: number;
  target_branch?: string;
  is_pinned?: boolean;
  scheduled_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'food' | 'academics' | 'hostel' | 'transport' | 'wifi' | 'sports' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reported_by: string;
  reporter_name: string;
  assigned_to?: string;
  location?: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'competition' | 'study' | 'sports' | 'club' | 'hackathon' | 'other';
  leader_id: string;
  leader_name: string;
  max_members: number;
  current_members: number;
  status: 'active' | 'completed' | 'archived';
  is_public: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  user_name: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface MessReview {
  id: string;
  user_id: string;
  user_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  meal_date: string;
  rating: number;
  review?: string;
  dishes?: string;
  created_at: string;
  updated_at?: string;
}

export interface DailyAverage {
  date: string;
  meal_type: string;
  average_rating: number;
  review_count: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  created_by: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  completions?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'announcement' | 'message' | 'issue' | 'team' | 'challenge' | 'mess_review' | 'system';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  reference_id?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  description?: string;
  latitude: number;
  longitude: number;
  building_type: string;
  facilities?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FilterOptions {
  category?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}
