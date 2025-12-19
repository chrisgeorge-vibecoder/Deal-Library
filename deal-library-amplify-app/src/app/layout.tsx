import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Sovrn Launchpad',
  description: 'Your marketing intelligence platform for audience insights, deal discovery, and campaign planning',
  icons: {
    icon: '/Sovrn_Logo.png',
    shortcut: '/Sovrn_Logo.png',
    apple: '/Sovrn_Logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
