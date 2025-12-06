'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  FiHome, FiMessageCircle, FiMic, FiAlertCircle, FiUsers, FiStar,
  FiTarget, FiLogOut, FiSettings, FiBell, FiMapPin, FiCheck, FiTrash
} from 'react-icons/fi';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function NotificationCenter() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const {
    notifications,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'message':
        return '💬';
      case 'issue':
        return '🐛';
      case 'team':
        return '👥';
      case 'challenge':
        return '🏆';
      case 'mess_review':
        return '🍽️';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-black">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">PlakshaConnect</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Campus Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-custom">
          <Link href="/" className="sidebar-link">
            <FiHome className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/announcements" className="sidebar-link">
            <FiMic className="w-5 h-5" />
            <span>Announcements</span>
          </Link>
          <Link href="/challenges" className="sidebar-link">
            <FiTarget className="w-5 h-5" />
            <span>Challenges</span>
          </Link>
          <Link href="/chat" className="sidebar-link">
            <FiMessageCircle className="w-5 h-5" />
            <span>Chat</span>
          </Link>
          <Link href="/issues" className="sidebar-link">
            <FiAlertCircle className="w-5 h-5" />
            <span>Issues</span>
          </Link>
          <Link href="/teams" className="sidebar-link">
            <FiUsers className="w-5 h-5" />
            <span>Teams</span>
          </Link>
          <Link href="/mess-reviews" className="sidebar-link">
            <FiStar className="w-5 h-5" />
            <span>Mess Reviews</span>
          </Link>
          <Link href="/location" className="sidebar-link">
            <FiMapPin className="w-5 h-5" />
            <span>Location</span>
          </Link>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <Link href="/settings" className="sidebar-link">
            <FiSettings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button onClick={logout} className="sidebar-link w-full text-red-600 dark:text-red-400">
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-black">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FiBell className="w-6 h-6 text-primary dark:text-secondary" />
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                {/* Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-light-hover dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-card'
                    }`}
                  >
                    All ({stats?.total || 0})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === 'unread'
                        ? 'bg-primary text-white'
                        : 'bg-light-hover dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-dark-card'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading && notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <FiBell className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No notifications
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {filter === 'unread'
                        ? "You're all caught up!"
                        : "You don't have any notifications yet"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-light-hover dark:hover:bg-dark-hover transition cursor-pointer ${
                        !notification.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.is_read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                                  title="Mark as read"
                                >
                                  <FiCheck />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                                title="Delete"
                              >
                                <FiTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
