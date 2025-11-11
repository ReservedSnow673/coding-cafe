import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider, LocationProvider, ChatProvider, AnnouncementProvider, IssueProvider } from '@/contexts'
import DevModeToggle from '@/components/DevModeToggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlakshaConnect - Connecting Plaksha Together',
  description: 'Campus networking and collaboration platform for Plaksha University',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <AuthProvider>
          <LocationProvider>
            <ChatProvider>
              <AnnouncementProvider>
                <IssueProvider>
                  {children}
                  <DevModeToggle />
                </IssueProvider>
              </AnnouncementProvider>
            </ChatProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
