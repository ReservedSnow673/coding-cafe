'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { FiMapPin, FiMessageCircle, FiMic, FiAlertCircle, FiUsers, FiStar, FiTarget, FiLogOut } from 'react-icons/fi';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const features = [
    { icon: FiMapPin, title: 'Location', description: 'Share your location', color: 'from-blue-500 to-cyan-500', route: '/location' },
    { icon: FiMessageCircle, title: 'Chat', description: 'Group conversations', color: 'from-green-500 to-emerald-500', route: '/chat' },
    { icon: FiMic, title: 'Announcements', description: 'Campus updates', color: 'from-purple-500 to-pink-500', route: '/announcements' },
    { icon: FiAlertCircle, title: 'Issues', description: 'Report problems', color: 'from-orange-500 to-red-500', route: '/issues' },
    { icon: FiUsers, title: 'Teams', description: 'Join or create teams', color: 'from-indigo-500 to-blue-500', route: '/teams' },
    { icon: FiStar, title: 'Mess Reviews', description: 'Rate meals', color: 'from-yellow-500 to-orange-500', route: null },
    { icon: FiTarget, title: 'Challenges', description: 'Campus activities', color: 'from-pink-500 to-rose-500', route: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <header className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PlakshaConnect
            </h1>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm"
            >
              <FiLogOut className="text-gray-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {user.full_name}
          </h2>
          <p className="text-gray-400">
            {user.year && user.branch ? `${user.year}${getOrdinalSuffix(user.year)} Year, ${user.branch}` : user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => feature.route && router.push(feature.route)}
                disabled={!feature.route}
                className={`glass glass-hover rounded-2xl p-6 text-left transition-all duration-200 ${
                  feature.route ? 'hover:scale-105 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-sm text-gray-400">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0</div>
              <div className="text-sm text-gray-400">Teams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-400">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">0</div>
              <div className="text-sm text-gray-400">Challenges</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}
