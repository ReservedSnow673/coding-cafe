'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEV_MODE, mockDelay } from '@/lib/devMode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export type IssueCategory = 'infrastructure' | 'academics' | 'hostel' | 'mess' | 'internet' | 'security' | 'sports' | 'other';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  location?: string;
  reporter_id: string;
  reporter_name: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface IssueCreateData {
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  location?: string;
}

export interface IssueUpdateData {
  title?: string;
  description?: string;
  category?: IssueCategory;
  priority?: IssuePriority;
  status?: IssueStatus;
  location?: string;
}

interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  fetchIssues: (filters?: {
    category?: IssueCategory;
    status?: IssueStatus;
    priority?: IssuePriority;
    myIssues?: boolean;
  }) => Promise<void>;
  getIssueById: (id: string) => Promise<Issue | null>;
  createIssue: (data: IssueCreateData) => Promise<Issue>;
  updateIssue: (id: string, data: IssueUpdateData) => Promise<Issue>;
  updateIssueStatus: (id: string, status: IssueStatus) => Promise<Issue>;
  assignIssue: (issueId: string, userId: string) => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

// Sample issues for dev mode
const DEV_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Broken AC in Library',
    description: 'The air conditioning unit in the library study room 2 has stopped working. It\'s getting very hot and uncomfortable to study.',
    category: 'infrastructure',
    priority: 'high',
    status: 'open',
    location: 'Library - Study Room 2',
    reporter_id: '1',
    reporter_name: 'Alice Johnson',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Slow Internet in Hostel Block A',
    description: 'Internet speed has been extremely slow for the past 3 days in Hostel Block A. Unable to attend online classes properly.',
    category: 'internet',
    priority: 'critical',
    status: 'in_progress',
    location: 'Hostel Block A',
    reporter_id: '2',
    reporter_name: 'Bob Smith',
    assigned_to: 'admin-1',
    assigned_to_name: 'IT Admin',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Messy Dining Hall',
    description: 'Tables are not being cleaned properly after meals. Food debris left on tables.',
    category: 'mess',
    priority: 'medium',
    status: 'resolved',
    location: 'Dining Hall',
    reporter_id: '3',
    reporter_name: 'Carol White',
    assigned_to: 'admin-2',
    assigned_to_name: 'Mess Manager',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Gym Equipment Maintenance',
    description: 'Some treadmills are not working properly. One of them makes a strange noise.',
    category: 'sports',
    priority: 'low',
    status: 'open',
    location: 'Sports Complex - Gym',
    reporter_id: '1',
    reporter_name: 'Alice Johnson',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Street Light Not Working',
    description: 'The street light near Block C gate is not working since last week. It\'s dark and unsafe at night.',
    category: 'security',
    priority: 'high',
    status: 'open',
    location: 'Near Block C Gate',
    reporter_id: '2',
    reporter_name: 'Bob Smith',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function IssueProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async (filters?: {
    category?: IssueCategory;
    status?: IssueStatus;
    priority?: IssuePriority;
    myIssues?: boolean;
  }) => {
    setLoading(true);
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        // Simulate API delay
        await mockDelay();

        // Load from localStorage or use defaults
        const stored = localStorage.getItem('mock_issues');
        let allIssues = stored ? JSON.parse(stored) : DEV_ISSUES;

        // Apply filters
        if (filters?.category) {
          allIssues = allIssues.filter((issue: Issue) => issue.category === filters.category);
        }
        if (filters?.status) {
          allIssues = allIssues.filter((issue: Issue) => issue.status === filters.status);
        }
        if (filters?.priority) {
          allIssues = allIssues.filter((issue: Issue) => issue.priority === filters.priority);
        }
        if (filters?.myIssues) {
          const currentUserId = localStorage.getItem('mock_user_id') || '1';
          allIssues = allIssues.filter((issue: Issue) => issue.reporter_id === currentUserId);
        }

        setIssues(allIssues);
      } else {
        const token = localStorage.getItem("access_token");
        const queryParams = new URLSearchParams();
        if (filters?.category) queryParams.append('category', filters.category);
        if (filters?.status) queryParams.append('status', filters.status);
        if (filters?.priority) queryParams.append('priority', filters.priority);
        if (filters?.myIssues) queryParams.append('my_issues', 'true');

        const response = await fetch(
          `${API_URL}/issues?${queryParams.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }

        const data = await response.json();
        setIssues(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIssueById = async (id: string): Promise<Issue | null> => {
    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();
        const stored = localStorage.getItem('mock_issues');
        const allIssues = stored ? JSON.parse(stored) : DEV_ISSUES;
        return allIssues.find((issue: Issue) => issue.id === id) || null;
      } else {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/issues/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch issue');
        }

        return await response.json();
      }
    } catch (err) {
      console.error('Error fetching issue:', err);
      return null;
    }
  };

  const createIssue = async (data: IssueCreateData): Promise<Issue> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_issues');
        const allIssues = stored ? JSON.parse(stored) : DEV_ISSUES;
        const currentUserId = localStorage.getItem('mock_user_id') || '1';
        const currentUserName = localStorage.getItem('mock_user_name') || 'Current User';

        const newIssue: Issue = {
          id: Date.now().toString(),
          ...data,
          status: 'open',
          reporter_id: currentUserId,
          reporter_name: currentUserName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedIssues = [newIssue, ...allIssues];
        localStorage.setItem('mock_issues', JSON.stringify(updatedIssues));
        setIssues(updatedIssues);

        return newIssue;
      } else {
        const token = localStorage.getItem("access_token");
        const response = await fetch('${API_URL}/issues/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create issue');
        }

        const newIssue = await response.json();
        setIssues(prev => [newIssue, ...prev]);
        return newIssue;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateIssue = async (id: string, data: IssueUpdateData): Promise<Issue> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_issues');
        const allIssues = stored ? JSON.parse(stored) : DEV_ISSUES;

        const updatedIssues = allIssues.map((issue: Issue) =>
          issue.id === id
            ? {
                ...issue,
                ...data,
                updated_at: new Date().toISOString(),
                ...(data.status === 'resolved' && !issue.resolved_at
                  ? { resolved_at: new Date().toISOString() }
                  : {}),
              }
            : issue
        );

        localStorage.setItem('mock_issues', JSON.stringify(updatedIssues));
        setIssues(updatedIssues);

        return updatedIssues.find((issue: Issue) => issue.id === id);
      } else {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/issues/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update issue');
        }

        const updatedIssue = await response.json();
        setIssues(prev => prev.map(issue => issue.id === id ? updatedIssue : issue));
        return updatedIssue;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateIssueStatus = async (id: string, status: IssueStatus): Promise<Issue> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();

        const stored = localStorage.getItem('mock_issues');
        const allIssues = stored ? JSON.parse(stored) : DEV_ISSUES;

        const updatedIssues = allIssues.map((issue: Issue) =>
          issue.id === id
            ? {
                ...issue,
                status,
                updated_at: new Date().toISOString(),
                ...(status === 'resolved' && !issue.resolved_at
                  ? { resolved_at: new Date().toISOString() }
                  : {}),
              }
            : issue
        );

        localStorage.setItem('mock_issues', JSON.stringify(updatedIssues));
        setIssues(updatedIssues);

        return updatedIssues.find((issue: Issue) => issue.id === id);
      } else {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/issues/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error('Failed to update issue status');
        }

        const updatedIssue = await response.json();
        setIssues(prev => prev.map(issue => issue.id === id ? updatedIssue : issue));
        return updatedIssue;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const assignIssue = async (issueId: string, userId: string): Promise<void> => {
    setError(null);

    try {
      if (DEV_MODE.useMockData) {
        await mockDelay();
        // In dev mode, just update the issue with a mock assigned_to_name
        const stored = localStorage.getItem('mock_issues');
        const allIssues = stored ? JSON.parse(stored) : DEV_ISSUES;

        const updatedIssues = allIssues.map((issue: Issue) =>
          issue.id === issueId
            ? {
                ...issue,
                assigned_to: userId,
                assigned_to_name: 'Staff Member',
                updated_at: new Date().toISOString(),
              }
            : issue
        );

        localStorage.setItem('mock_issues', JSON.stringify(updatedIssues));
        setIssues(updatedIssues);
      } else {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `${API_URL}/issues/${issueId}/assign/${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to assign issue');
        }

        // Refresh issues after assignment
        await fetchIssues();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        loading,
        error,
        fetchIssues,
        getIssueById,
        createIssue,
        updateIssue,
        updateIssueStatus,
        assignIssue,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
}
