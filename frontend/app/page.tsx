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
import { 
  FiHome, FiMessageCircle, FiMic, FiAlertCircle, FiUsers, FiStar, 
  FiTarget, FiLogOut, FiSettings, FiSearch, FiBell, FiMapPin,
  FiTrendingUp, FiActivity, FiChevronRight, FiPlus
} from 'react-icons/fi';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeChallenges = challenges.filter((c: any) => c.is_active).slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 4);
  const openIssues = issues.filter((i: any) => i.status === 'open').slice(0, 4);
  const recentReviews = reviews.slice(0, 3);

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
          <Link href="/" className="sidebar-link sidebar-link-active">
            <FiHome className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/announcements" className="sidebar-link">
            <FiMic className="w-5 h-5" />
            <span>Announcements</span>
            {recentAnnouncements.length > 0 && (
              <span className="ml-auto text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                {recentAnnouncements.length}
              </span>
            )}
          </Link>
          <Link href="/challenges" className="sidebar-link">
            <FiTarget className="w-5 h-5" />
            <span>Challenges</span>
            {activeChallenges.length > 0 && (
              <span className="ml-auto text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                {activeChallenges.length}
              </span>
            )}
          </Link>
          <Link href="/chat" className="sidebar-link">
            <FiMessageCircle className="w-5 h-5" />
            <span>Chat</span>
          </Link>
          <Link href="/issues" className="sidebar-link">
            <FiAlertCircle className="w-5 h-5" />
            <span>Issues</span>
            {openIssues.length > 0 && (
              <span className="ml-auto text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">
                {openIssues.length}
              </span>
            )}
          </Link>
          <Link href="/location" className="sidebar-link">
            <FiMapPin className="w-5 h-5" />
            <span>Location</span>
          </Link>
          <Link href="/mess-reviews" className="sidebar-link">
            <FiStar className="w-5 h-5" />
            <span>Mess Reviews</span>
          </Link>
          <Link href="/teams" className="sidebar-link">
            <FiUsers className="w-5 h-5" />
            <span>Teams</span>
          </Link>
          <Link href="/notifications" className="sidebar-link">
            <FiBell className="w-5 h-5" />
            <span>Notifications</span>
          </Link>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <ThemeToggle inline />
          <Link href="/profile" className="sidebar-link">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.full_name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">View profile</div>
            </div>
          </Link>
          <button onClick={logout} className="sidebar-link text-red-600 dark:text-red-400 w-full">
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search PlakshaConnect..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/announcements"
                className="p-2.5 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-all relative"
              >
                <FiBell className="w-5 h-5" />
                {recentAnnouncements.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full"></span>
                )}
              </Link>
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold hover:scale-105 transition-transform cursor-pointer">
                  {user.full_name.charAt(0)}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Feed Content */}
        <main className="flex-1 overflow-y-auto scrollbar-custom bg-light-card dark:bg-black">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Welcome Section */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, <span className="text-primary dark:text-secondary">{user.full_name.split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {user.year && user.branch 
                  ? `${user.year}${getOrdinalSuffix(user.year)} Year • ${user.branch}`
                  : user.email
                }
              </p>
            </div>

            {/* Feed Cards */}
            <div className="space-y-6">
              {/* Active Challenges Card */}
              {activeChallenges.length > 0 && (
                <div className="card card-glow animate-glow-border animate-slide-up">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                          <FiTarget className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Active Challenges</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activeChallenges.length} challenges waiting
                          </p>
                        </div>
                      </div>
                      <Link href="/challenges" className="btn-secondary text-sm px-4 py-2">
                        View All
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeChallenges.map((challenge: any) => (
                        <Link
                          key={challenge.id}
                          href={`/challenges/${challenge.id}`}
                          className="p-4 rounded-lg bg-light-hover dark:bg-dark-hover hover:bg-gray-100 dark:hover:bg-dark-card transition-all border border-transparent hover:border-secondary/30"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm flex-1 line-clamp-1">{challenge.title}</h3>
                            <span className="text-secondary font-bold text-lg ml-2">{challenge.points}pts</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              challenge.difficulty === 'hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                              challenge.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                              'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                              {challenge.difficulty}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-primary capitalize">
                              {challenge.category}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Announcements Card */}
              {recentAnnouncements.length > 0 && (
                <div className="card animate-slide-up">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                          <FiMic className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Latest Announcements</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Stay updated with campus news
                          </p>
                        </div>
                      </div>
                      <Link href="/announcements" className="text-primary hover:text-primary-light font-medium text-sm">
                        See All <FiChevronRight className="inline w-4 h-4" />
                      </Link>
                    </div>
                    
                    <div className="space-y-3">
                      {recentAnnouncements.map((announcement: any) => (
                        <Link
                          key={announcement.id}
                          href={`/announcements/${announcement.id}`}
                          className="block p-4 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              announcement.priority === 'high' ? 'bg-red-500' :
                              announcement.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{announcement.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {announcement.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                <span>{announcement.created_by}</span>
                                <span>•</span>
                                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Open Issues Card */}
              {openIssues.length > 0 && (
                <div className="card animate-slide-up">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Open Issues</h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {openIssues.length} issues need attention
                          </p>
                        </div>
                      </div>
                      <Link href="/issues" className="text-primary hover:text-primary-light font-medium text-sm">
                        View All <FiChevronRight className="inline w-4 h-4" />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {openIssues.map((issue: any) => (
                        <Link
                          key={issue.id}
                          href={`/issues/${issue.id}`}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm flex-1 line-clamp-1">{issue.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                              issue.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                              issue.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                              'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                              {issue.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <span className="capitalize">{issue.category}</span>
                            <span>•</span>
                            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions Card */}
              <div className="card animate-slide-up">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/chat" className="p-4 rounded-lg bg-light-hover dark:bg-dark-hover hover:bg-primary/10 dark:hover:bg-primary/20 transition-all text-center group">
                      <FiMessageCircle className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium">Chats</p>
                    </Link>
                    <Link href="/teams" className="p-4 rounded-lg bg-light-hover dark:bg-dark-hover hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-all text-center group">
                      <FiUsers className="w-8 h-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium">Teams</p>
                    </Link>
                    <Link href="/location" className="p-4 rounded-lg bg-light-hover dark:bg-dark-hover hover:bg-primary/10 dark:hover:bg-primary/20 transition-all text-center group">
                      <FiMapPin className="w-8 h-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium">Location</p>
                    </Link>
                    <Link href="/mess-reviews" className="p-4 rounded-lg bg-light-hover dark:bg-dark-hover hover:bg-secondary/10 dark:hover:bg-secondary/20 transition-all text-center group">
                      <FiStar className="w-8 h-8 mx-auto mb-2 text-secondary group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-medium">Reviews</p>
                    </Link>
                  </div>
                </div>
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
