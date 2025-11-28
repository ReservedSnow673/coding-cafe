'use client';

import React from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          It looks like you've lost your internet connection. Some features may not be available until you're back online.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
