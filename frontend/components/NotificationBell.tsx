'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { FaBell } from 'react-icons/fa';
import Link from 'next/link';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [showBadge, setShowBadge] = useState(true);

  return (
    <Link href="/notifications" className="relative">
      <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition relative">
        <FaBell className="text-xl" />
        {unreadCount > 0 && showBadge && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[1.25rem] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </Link>
  );
}
