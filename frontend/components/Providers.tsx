'use client';

import {
  AuthProvider,
  LocationProvider,
  ChatProvider,
  AnnouncementProvider,
  IssueProvider,
  TeamProvider,
  MessReviewProvider,
  ChallengesProvider,
  NotificationProvider,
  ThemeProvider,
} from '@/contexts';
import { DevModeToggle, ThemeToggle, PWAInstaller } from '@/components';

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
