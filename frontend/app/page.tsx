'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { useChallenges } from '@/contexts/ChallengesContext';
import { useChat } from '@/contexts/ChatContext';
import { useAnnouncements } from '@/contexts/AnnouncementContext';
import { useIssues } from '@/contexts/IssueContext';
import { useTeams } from '@/contexts/TeamContext';
import { useMessReview } from '@/contexts/MessReviewContext';
import { FiMapPin, FiMessageCircle, FiMic, FiAlertCircle, FiUsers, FiStar, FiTarget, FiLogOut, FiSettings, FiSearch, FiBell, FiChevronRight, FiTrendingUp, FiActivity } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('Work');
  const [searchQuery, setSearchQuery] = useState('');

  const { challenges } = useChallenges();
  const { groups } = useChat();
  const { announcements } = useAnnouncements();
  const { issues } = useIssues();
  const { teams } = useTeams();
  const { reviews } = useMessReview();

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

  const navItems = [
    { id: 'Work', label: 'Work', icon: FiActivity },
    { id: 'ICG', label: 'ICG chat', icon: FiMessageCircle, route: '/chat' },
    { id: 'SP', label: 'SP', icon: FiUsers, route: '/teams' },
    { id: 'BFF', label: 'BFF', icon: FiMessageCircle, route: '/chat' },
    { id: 'MJ', label: 'MJ', icon: FiUsers, route: '/teams' },
    { id: 'GI', label: 'GI', icon: FiUsers, route: '/teams' },
  ];

  const activeChallenges = challenges.filter((c: any) => c.is_active).slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 3);
  const openIssues = issues.filter((i: any) => i.status === 'open').slice(0, 3);
  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="min-h-screen bg-dark text-white flex">
      {/* Side Navigation */}
      <aside className="w-20 bg-dark-secondary border-r border-dark-secondary flex flex-col items-center py-6 space-y-6">
        {/* Logo */}
        <div className="w-12 h-12 rounded-2xl bg-accent-lime flex items-center justify-center mb-4">
          <span className="text-dark font-bold text-xl">P</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeNav;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    if (item.route) {
                      router.push(item.route);
                    } else {
                      setActiveNav(item.id);
                    }
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-dark text-accent-lime'
                      : 'bg-dark-secondary text-gray-400 hover:bg-dark hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-dark-secondary border border-dark-secondary rounded-lg text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-dark-secondary"></div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="relative group">
          <button className="w-12 h-12 rounded-2xl bg-dark-secondary hover:bg-dark flex items-center justify-center transition-all">
            <FiSettings className="w-5 h-5 text-gray-400" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-dark-secondary border border-dark-secondary rounded-lg text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
            Settings
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-dark-secondary"></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-dark border-b border-dark-secondary px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-dark-secondary flex items-center justify-center">
                <span className="text-gray-400 font-semibold">{user.full_name.charAt(0)}</span>
              </div>
              <div>
                <div className="text-sm text-gray-400">I will take you to our team, we...</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-dark-secondary border border-dark-secondary rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent-lime/30 w-64"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-dark-secondary transition-colors">
                <FiSettings className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-lg hover:bg-dark-secondary transition-colors">
                <FiBell className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-dark-secondary transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5 text-gray-400" />
              </button>
              <div className="w-10 h-10 rounded-full bg-accent-lime flex items-center justify-center">
                <span className="text-dark font-bold">{user.full_name.charAt(0)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, <span className="text-accent-lime">{user.full_name.split(' ')[0]}</span>
              </h1>
              <p className="text-gray-400 text-lg">
                {user.year && user.branch ? `${user.year}${getOrdinalSuffix(user.year)} Year • ${user.branch}` : user.email}
              </p>
            </div>

            {/* Feature Sections - Varied Layout */}
            <div className="space-y-6">
              {/* Row 1: Group Chat (Large Featured) + Challenges */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Group Chat - Large Featured Section with Image */}
                <Link
                  href="/chat"
                  className="lg:col-span-2 bg-dark-secondary rounded-2xl border border-dark-secondary overflow-hidden hover:border-accent-lime/30 transition-all group cursor-pointer"
                >
                  <div className="relative h-64 bg-gradient-to-br from-dark via-dark-secondary to-dark overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(244,255,12,0.2),transparent_50%)]"></div>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(244,255,12,0.1),transparent_50%)]"></div>
                    </div>
                    
                    {/* Content Overlay */}
                    <div className="relative h-full p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-accent-lime/10 border border-accent-lime/20 flex items-center justify-center">
                            <FiMessageCircle className="w-6 h-6 text-accent-lime" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">ICG Chat</h3>
                            <p className="text-sm text-gray-400">Jaden isn't a discuss this tom...</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Mini Chat Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-dark/50 backdrop-blur-sm rounded-lg p-3 border border-dark-secondary/50">
                          <div className="w-8 h-8 rounded-full bg-accent-lime/20 flex items-center justify-center text-xs font-bold">IC</div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-400">{groups[0]?.name || 'ICG Group'}</div>
                            <div className="text-sm">{groups[0]?.description || 'Latest discussion...'}</div>
                          </div>
                          <div className="text-xs text-gray-500">Now</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* View More Indicator */}
                    <div className="absolute bottom-6 right-6 flex items-center gap-2 text-accent-lime font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>Open Chat</span>
                      <FiChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>

                {/* Challenges - Compact Card */}
                <div className="bg-dark-secondary rounded-2xl border border-dark-secondary p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
                      <FiTarget className="w-5 h-5 text-accent-lime" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">Challenges</h3>
                      <p className="text-xs text-gray-400">{activeChallenges.length} active</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2 mb-4">
                    {activeChallenges.slice(0, 2).map((challenge: any) => (
                      <div key={challenge.id} className="bg-dark rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-xs line-clamp-1">{challenge.title}</h4>
                          <span className="text-accent-lime font-bold text-xs whitespace-nowrap">{challenge.points}pts</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{challenge.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href="/challenges"
                    className="flex items-center justify-center gap-2 text-accent-lime hover:text-accent-lime/80 text-sm font-semibold py-2 border-t border-dark-secondary pt-4"
                  >
                    View All Challenges
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Row 2: Announcements + Teams + Mess Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Announcements */}
                <div className="bg-dark-secondary rounded-2xl border border-dark-secondary p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
                      <FiMic className="w-5 h-5 text-accent-lime" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">Announcements</h3>
                      <p className="text-xs text-gray-400">{recentAnnouncements.length} new</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {recentAnnouncements.slice(0, 2).map((announcement: any) => (
                      <div key={announcement.id} className="bg-dark rounded-lg p-3">
                        <h4 className="font-semibold text-xs mb-1 line-clamp-1">{announcement.title}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2">{announcement.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href="/announcements"
                    className="flex items-center justify-center gap-2 text-accent-lime hover:text-accent-lime/80 text-sm font-semibold py-2 border-t border-dark-secondary pt-4"
                  >
                    See All
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Teams */}
                <div className="bg-dark-secondary rounded-2xl border border-dark-secondary p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
                      <FiUsers className="w-5 h-5 text-accent-lime" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">Teams</h3>
                      <p className="text-xs text-gray-400">{teams.length} joined</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {teams.slice(0, 2).map((team: any) => (
                      <div key={team.id} className="bg-dark rounded-lg p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-lime/10 flex items-center justify-center">
                          <FiUsers className="w-5 h-5 text-accent-lime" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs line-clamp-1">{team.name}</h4>
                          <p className="text-xs text-gray-400">{team.members?.length || 0} members</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href="/teams"
                    className="flex items-center justify-center gap-2 text-accent-lime hover:text-accent-lime/80 text-sm font-semibold py-2 border-t border-dark-secondary pt-4"
                  >
                    Browse Teams
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Mess Reviews */}
                <div className="bg-dark-secondary rounded-2xl border border-dark-secondary p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
                      <FiStar className="w-5 h-5 text-accent-lime" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">Mess Reviews</h3>
                      <p className="text-xs text-gray-400">{recentReviews.length} today</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {recentReviews.slice(0, 2).map((review: any) => (
                      <div key={review.id} className="bg-dark rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-xs capitalize">{review.meal_type}</h4>
                          <div className="flex items-center gap-1">
                            <FiStar className="w-3 h-3 text-accent-lime fill-accent-lime" />
                            <span className="text-xs font-bold">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href="/mess-reviews"
                    className="flex items-center justify-center gap-2 text-accent-lime hover:text-accent-lime/80 text-sm font-semibold py-2 border-t border-dark-secondary pt-4"
                  >
                    All Reviews
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Row 3: Issues (Wide) + Location */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Issues - Wide Card */}
                <div className="lg:col-span-2 bg-dark-secondary rounded-2xl border border-dark-secondary p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center">
                        <FiAlertCircle className="w-5 h-5 text-accent-lime" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Open Issues</h3>
                        <p className="text-sm text-gray-400">{openIssues.length} need attention</p>
                      </div>
                    </div>
                    <Link
                      href="/issues"
                      className="flex items-center gap-1 text-accent-lime hover:text-accent-lime/80 text-sm font-semibold"
                    >
                      View All
                      <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {openIssues.slice(0, 2).map((issue: any) => (
                      <Link
                        key={issue.id}
                        href="/issues"
                        className="bg-dark rounded-lg p-4 hover:border-accent-lime/30 border border-transparent transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm line-clamp-1 flex-1">{issue.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap ${
                            issue.priority === 'high' ? 'bg-red-400/10 text-red-400' :
                            issue.priority === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-green-400/10 text-green-400'
                          }`}>
                            {issue.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="capitalize">{issue.category}</span>
                          <span>•</span>
                          <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Location - Vertical Card */}
                <Link
                  href="/location"
                  className="bg-dark-secondary rounded-2xl border border-dark-secondary p-6 hover:border-accent-lime/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-dark flex items-center justify-center group-hover:bg-accent-lime/10 transition-all">
                      <FiMapPin className="w-5 h-5 text-accent-lime" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Location</h3>
                      <p className="text-xs text-gray-400">Share & find</p>
                    </div>
                  </div>
                  
                  <div className="bg-dark rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                    <div className="text-center">
                      <FiMapPin className="w-12 h-12 mx-auto mb-2 text-accent-lime/50" />
                      <p className="text-sm text-gray-400">View campus locations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-accent-lime text-sm font-semibold">
                    Open Map
                    <FiChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}
