'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { FiMapPin, FiMessageCircle, FiMic, FiAlertCircle, FiUsers, FiStar, FiTarget, FiLogOut, FiSettings } from 'react-icons/fi';

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
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const features = [
    { icon: FiMapPin, title: 'Location', description: 'Share your location', route: '/location' },
    { icon: FiMessageCircle, title: 'Chat', description: 'Group conversations', route: '/chat' },
    { icon: FiMic, title: 'Announcements', description: 'Campus updates', route: '/announcements' },
    { icon: FiAlertCircle, title: 'Issues', description: 'Report problems', route: '/issues' },
    { icon: FiUsers, title: 'Teams', description: 'Join or create teams', route: '/teams' },
    { icon: FiStar, title: 'Mess Reviews', description: 'Rate meals', route: null },
    { icon: FiTarget, title: 'Challenges', description: 'Campus activities', route: null },
  ];

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-dark-secondary bg-dark-secondary/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-lime flex items-center justify-center">
                <span className="text-dark font-bold text-lg">P</span>
              </div>
              <h1 className="text-xl font-semibold">PlakshaConnect</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-dark-secondary/50 transition-colors">
                <FiSettings className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-secondary/50 hover:bg-dark-secondary transition-colors text-sm"
              >
                <FiLogOut className="text-gray-400" />
                <span className="hidden sm:inline text-gray-300">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="accent-lime">{user.full_name.split(' ')[0]}</span>
          </h2>
          <p className="text-gray-400 text-lg">
            {user.year && user.branch ? `${user.year}${getOrdinalSuffix(user.year)} Year • ${user.branch}` : user.email}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = !!feature.route;
            return (
              <button
                key={index}
                onClick={() => feature.route && router.push(feature.route)}
                disabled={!isActive}
                className={`group relative bg-dark-secondary/50 backdrop-blur-xl border border-dark-secondary rounded-2xl p-6 text-left transition-all duration-300 ${
                  isActive 
                    ? 'hover:bg-dark-secondary hover:border-accent-lime/30 cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-dark-secondary flex items-center justify-center mb-4 transition-all duration-300 ${
                  isActive ? 'group-hover:bg-accent-lime/10 group-hover:scale-110' : ''
                }`}>
                  <Icon className={`w-7 h-7 text-gray-400 transition-colors ${isActive ? 'group-hover:text-accent-lime' : ''}`} />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
                {!isActive && (
                  <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-dark-secondary border border-dark-secondary text-gray-500">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
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
