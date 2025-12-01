'use client';

import { useAuth } from '@/contexts';
import { useChallenges } from '@/contexts/ChallengesContext';
import { useAnnouncements } from '@/contexts/AnnouncementContext';
import { useIssues } from '@/contexts/IssueContext';
import { 
  FiHome, FiMessageCircle, FiMic, FiAlertCircle, FiUsers, FiStar, 
  FiTarget, FiLogOut, FiMapPin, FiBell
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { challenges } = useChallenges();
  const { announcements } = useAnnouncements();
  const { issues } = useIssues();

  if (!user) return null;

  const activeChallenges = challenges.filter((c: any) => c.is_active);
  const recentAnnouncements = announcements.slice(0, 4);
  const openIssues = issues.filter((i: any) => i.status === 'open');

  const isActive = (path: string) => pathname === path;

  return (
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
        <Link href="/" className={`sidebar-link ${isActive('/') ? 'sidebar-link-active' : ''}`}>
          <FiHome className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link href="/announcements" className={`sidebar-link ${isActive('/announcements') ? 'sidebar-link-active' : ''}`}>
          <FiMic className="w-5 h-5" />
          <span>Announcements</span>
          {recentAnnouncements.length > 0 && (
            <span className="ml-auto text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
              {recentAnnouncements.length}
            </span>
          )}
        </Link>
        <Link href="/challenges" className={`sidebar-link ${isActive('/challenges') ? 'sidebar-link-active' : ''}`}>
          <FiTarget className="w-5 h-5" />
          <span>Challenges</span>
          {activeChallenges.length > 0 && (
            <span className="ml-auto text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
              {activeChallenges.length}
            </span>
          )}
        </Link>
        <Link href="/chat" className={`sidebar-link ${isActive('/chat') ? 'sidebar-link-active' : ''}`}>
          <FiMessageCircle className="w-5 h-5" />
          <span>Chat</span>
        </Link>
        <Link href="/issues" className={`sidebar-link ${isActive('/issues') ? 'sidebar-link-active' : ''}`}>
          <FiAlertCircle className="w-5 h-5" />
          <span>Issues</span>
          {openIssues.length > 0 && (
            <span className="ml-auto text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">
              {openIssues.length}
            </span>
          )}
        </Link>
        <Link href="/location" className={`sidebar-link ${isActive('/location') ? 'sidebar-link-active' : ''}`}>
          <FiMapPin className="w-5 h-5" />
          <span>Location</span>
        </Link>
        <Link href="/mess-reviews" className={`sidebar-link ${isActive('/mess-reviews') ? 'sidebar-link-active' : ''}`}>
          <FiStar className="w-5 h-5" />
          <span>Mess Reviews</span>
        </Link>
        <Link href="/teams" className={`sidebar-link ${isActive('/teams') ? 'sidebar-link-active' : ''}`}>
          <FiUsers className="w-5 h-5" />
          <span>Teams</span>
        </Link>
        <Link href="/notifications" className={`sidebar-link ${isActive('/notifications') ? 'sidebar-link-active' : ''}`}>
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
  );
}
