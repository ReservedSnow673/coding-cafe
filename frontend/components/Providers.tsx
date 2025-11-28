'use client';

import { AuthProvider, LocationProvider, ChatProvider, AnnouncementProvider, IssueProvider, TeamProvider } from '@/contexts'
import { MessReviewProvider } from '@/contexts/MessReviewContext'
import { ChallengesProvider } from '@/contexts/ChallengesContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import DevModeToggle from '@/components/DevModeToggle'
import ThemeToggle from '@/components/ThemeToggle'
import PWAInstaller from '@/components/PWAInstaller'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <LocationProvider>
            <ChatProvider>
              <AnnouncementProvider>
                <IssueProvider>
                  <TeamProvider>
                    <MessReviewProvider>
                      <ChallengesProvider>
                        <PWAInstaller />
                        {children}
                        <ThemeToggle />
                        <DevModeToggle />
                      </ChallengesProvider>
                    </MessReviewProvider>
                  </TeamProvider>
                </IssueProvider>
              </AnnouncementProvider>
            </ChatProvider>
          </LocationProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
