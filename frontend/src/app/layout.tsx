import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'sonner';
import Navbar from '@/components/layout/navbar';
import { NotificationCountProvider } from '@/hooks/use-notification-count';
import { AppLoader } from '@/components/layout/app-loader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Chat App | Created by Satyam',
  description: 'Chat App Created by Satyam'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <NotificationCountProvider>
            <AppLoader>
              {/* min-h-screen ensures background fills viewport; no flex-col height cap so content pages scroll freely */}
              <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <main>
                  <div className="mx-auto w-full max-w-6xl px-4 py-3 md:py-8">
                    {children}
                  </div>
                </main>
              </div>
              <Toaster />
            </AppLoader>
          </NotificationCountProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
