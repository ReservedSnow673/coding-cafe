'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  reference_id: string | null;
}

interface NotificationStats {
  total: number;
  unread: number;
  by_type: { [key: string]: number };
}

interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  fetchStats: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/notifications/?limit=50');
      setNotifications(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/notifications/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch notification stats:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.put(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
      await fetchStats();
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [fetchStats]);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/api/notifications/read-all');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      await fetchStats();
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  }, [fetchStats]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      await fetchStats();
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
    }
  }, [fetchStats]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNotifications();
      fetchStats();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
        fetchStats();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, fetchStats]);

  const unreadCount = stats?.unread || 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        stats,
        loading,
        error,
        fetchNotifications,
        fetchStats,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
