export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'club_admin' | 'sc_admin'
  profile_picture?: string
  hostel?: string
  course?: string
  year?: number
  created_at: string
  updated_at?: string
}

export interface AuthResponse {
  token: string
  token_type: string
  expires_in: number
  user: User
}
