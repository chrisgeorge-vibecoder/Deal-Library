import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Sovrn Launchpad',
  description: 'Your marketing intelligence platform for audience insights, deal discovery, and campaign planning',
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
