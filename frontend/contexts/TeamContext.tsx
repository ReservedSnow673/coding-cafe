'use client';

import React, { createContext, useContext, useState } from 'react';
import { DEV_MODE, mockDelay } from '@/lib/devMode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export type TeamCategory = 'project' | 'competition' | 'study' | 'sports' | 'club' | 'hackathon' | 'other';
export type TeamStatus = 'active' | 'completed' | 'archived';
export type MemberRole = 'leader' | 'member';

export interface TeamMember {
  user_id: string;
  full_name: string;
  email: string;
  role: MemberRole;
  joined_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  category: TeamCategory;
  status: TeamStatus;
  max_members: number;
  current_members: number;
  is_public: boolean;
  tags?: string[];
  leader_id: string;
  leader_name: string;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

export interface TeamCreateData {
  name: string;
  description: string;
  category: TeamCategory;
  max_members: number;
  is_public: boolean;
  tags?: string[];
}

export interface TeamUpdateData {
  name?: string;
  description?: string;
  category?: TeamCategory;
  max_members?: number;
  is_public?: boolean;
  status?: TeamStatus;
  tags?: string[];
}

export interface JoinRequest {
  id: string;
  team_id: string;
  team_name: string;
  user_id: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
}

interface TeamContextType {
  teams: Team[];
  myTeams: Team[];
  loading: boolean;
  error: string | null;
  fetchTeams: (filters?: {
    category?: TeamCategory;
    status?: TeamStatus;
    search?: string;
  }) => Promise<void>;
  fetchMyTeams: () => Promise<void>;
  getTeamById: (id: string) => Promise<Team | null>;
  createTeam: (data: TeamCreateData) => Promise<Team>;
  updateTeam: (id: string, data: TeamUpdateData) => Promise<Team>;
  deleteTeam: (id: string) => Promise<void>;
  requestToJoin: (teamId: string, message?: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  getJoinRequests: (teamId: string) => Promise<JoinRequest[]>;
  handleJoinRequest: (requestId: string, approve: boolean) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Sample teams for dev mode
const DEV_TEAMS: Team[] = [
  {
    id: '1',
    name: 'AI Research Group',
    description: 'Working on machine learning projects and research papers. Focus on NLP and computer vision applications.',
    category: 'project',
    status: 'active',
    max_members: 8,
    current_members: 5,
    is_public: true,
    tags: ['machine-learning', 'research', 'python', 'ai'],
    leader_id: '1',
    leader_name: 'Alice Johnson',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Web Dev Warriors',
    description: 'Building full-stack web applications using React, Node.js, and modern frameworks.',
    category: 'project',
    status: 'active',
    max_members: 6,
    current_members: 4,
    is_public: true,
    tags: ['web-development', 'react', 'nodejs', 'full-stack'],
    leader_id: '2',
    leader_name: 'Bob Smith',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Hackathon Champions',
    description: 'Team for upcoming inter-college hackathon. Looking for designers and developers.',
    category: 'hackathon',
    status: 'active',
    max_members: 5,
    current_members: 3,
    is_public: true,
    tags: ['hackathon', 'competition', 'coding'],
    leader_id: '3',
    leader_name: 'Carol White',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    name: 'Data Structures Study Group',
    description: 'Weekly study sessions for DSA preparation. Solving problems together and discussing solutions.',
    category: 'study',
    status: 'active',
    max_members: 10,
    current_members: 7,
    is_public: true,
    tags: ['dsa', 'algorithms', 'leetcode', 'study'],
    leader_id: '1',
    leader_name: 'Alice Johnson',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Campus Football Team',
    description: 'Training for inter-university football tournament. Practice sessions every evening.',
    category: 'sports',
    status: 'active',
    max_members: 15,
    current_members: 12,
    is_public: true,
    tags: ['football', 'sports', 'tournament'],
    leader_id: '2',
    leader_name: 'Bob Smith',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async (filters?: {
    category?: TeamCategory;
    status?: TeamStatus;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_teams');
        let allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;

        // Apply filters
        if (filters?.category) {
          allTeams = allTeams.filter((team: Team) => team.category === filters.category);
        }
        if (filters?.status) {
          allTeams = allTeams.filter((team: Team) => team.status === filters.status);
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          allTeams = allTeams.filter((team: Team) =>
            team.name.toLowerCase().includes(searchLower) ||
            team.description.toLowerCase().includes(searchLower)
          );
        }

        setTeams(allTeams);
      } else {
        const token = localStorage.getItem('access_token');
        const queryParams = new URLSearchParams();
        if (filters?.category) queryParams.append('category', filters.category);
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.search) queryParams.append('search', filters.search);

        const response = await fetch(
          `${API_URL}/teams?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }

        const data = await response.json();
        setTeams(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeams = async () => {
    setLoading(true);
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_teams');
        const allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;
        const currentUserId = localStorage.getItem('mock_user_id') || '1';

        // Filter teams where user is leader or member
        const userTeams = allTeams.filter((team: Team) => team.leader_id === currentUserId);

        setMyTeams(userTeams);
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/teams/my-teams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch my teams');
        }

        const data = await response.json();
        setMyTeams(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching my teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTeamById = async (id: string): Promise<Team | null> => {
    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();
        const stored = localStorage.getItem('mock_teams');
        const allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;
        const team = allTeams.find((team: Team) => team.id === id);
        
        if (team) {
          // Add mock members
          team.members = [
            {
              user_id: team.leader_id,
              full_name: team.leader_name,
              email: 'leader@example.com',
              role: 'leader' as MemberRole,
              joined_at: team.created_at,
            },
            ...Array.from({ length: team.current_members - 1 }, (_, i) => ({
              user_id: `member-${i + 1}`,
              full_name: `Team Member ${i + 1}`,
              email: `member${i + 1}@example.com`,
              role: 'member' as MemberRole,
              joined_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
            })),
          ];
        }
        
        return team || null;
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/teams/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch team');
        }

        return await response.json();
      }
    } catch (err) {
      console.error('Error fetching team:', err);
      return null;
    }
  };

  const createTeam = async (data: TeamCreateData): Promise<Team> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_teams');
        const allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;
        const currentUserId = localStorage.getItem('mock_user_id') || '1';
        const currentUserName = DEV_MODE.mockUser.full_name;

        const newTeam: Team = {
          id: Date.now().toString(),
          ...data,
          status: 'active',
          current_members: 1,
          leader_id: currentUserId,
          leader_name: currentUserName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedTeams = [newTeam, ...allTeams];
        localStorage.setItem('mock_teams', JSON.stringify(updatedTeams));
        setTeams(updatedTeams);

        return newTeam;
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/teams/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create team');
        }

        const newTeam = await response.json();
        setTeams((prev) => [newTeam, ...prev]);
        return newTeam;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTeam = async (id: string, data: TeamUpdateData): Promise<Team> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_teams');
        const allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;

        const updatedTeams = allTeams.map((team: Team) =>
          team.id === id
            ? {
                ...team,
                ...data,
                updated_at: new Date().toISOString(),
              }
            : team
        );

        localStorage.setItem('mock_teams', JSON.stringify(updatedTeams));
        setTeams(updatedTeams);

        return updatedTeams.find((team: Team) => team.id === id);
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/teams/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update team');
        }

        const updatedTeam = await response.json();
        setTeams((prev) => prev.map((team) => (team.id === id ? updatedTeam : team)));
        return updatedTeam;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTeam = async (id: string): Promise<void> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_teams');
        const allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;

        const updatedTeams = allTeams.filter((team: Team) => team.id !== id);
        localStorage.setItem('mock_teams', JSON.stringify(updatedTeams));
        setTeams(updatedTeams);
        setMyTeams((prev) => prev.filter((team) => team.id !== id));
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/teams/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete team');
        }

        setTeams((prev) => prev.filter((team) => team.id !== id));
        setMyTeams((prev) => prev.filter((team) => team.id !== id));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const requestToJoin = async (teamId: string, message?: string): Promise<void> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();
        // In dev mode, auto-approve and add to team
        const stored = localStorage.getItem('mock_teams');
        const allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;

        const updatedTeams = allTeams.map((team: Team) =>
          team.id === teamId
            ? { ...team, current_members: team.current_members + 1 }
            : team
        );

        localStorage.setItem('mock_teams', JSON.stringify(updatedTeams));
        setTeams(updatedTeams);
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/teams/${teamId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to request to join team');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const leaveTeam = async (teamId: string): Promise<void> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_teams');
        const allTeams = stored ? JSON.parse(stored) : DEV_TEAMS;

        const updatedTeams = allTeams.map((team: Team) =>
          team.id === teamId
            ? { ...team, current_members: Math.max(1, team.current_members - 1) }
            : team
        );

        localStorage.setItem('mock_teams', JSON.stringify(updatedTeams));
        setTeams(updatedTeams);
        setMyTeams((prev) => prev.filter((team) => team.id !== teamId));
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/teams/${teamId}/leave`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to leave team');
        }

        setMyTeams((prev) => prev.filter((team) => team.id !== teamId));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getJoinRequests = async (teamId: string): Promise<JoinRequest[]> => {
    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();
        // Return empty array in dev mode
        return [];
      } else {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `${API_URL}/teams/${teamId}/requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch join requests');
        }

        return await response.json();
      }
    } catch (err) {
      console.error('Error fetching join requests:', err);
      return [];
    }
  };

  const handleJoinRequest = async (
    requestId: string,
    approve: boolean
  ): Promise<void> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();
        // Nothing to do in dev mode
      } else {
        const token = localStorage.getItem('access_token');
        const endpoint = approve ? 'approve' : 'reject';
        const response = await fetch(
          `${API_URL}/teams/requests/${requestId}/${endpoint}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to ${approve ? 'approve' : 'reject'} join request`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        myTeams,
        loading,
        error,
        fetchTeams,
        fetchMyTeams,
        getTeamById,
        createTeam,
        updateTeam,
        deleteTeam,
        requestToJoin,
        leaveTeam,
        getJoinRequests,
        handleJoinRequest,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamProvider');
  }
  return context;
}
