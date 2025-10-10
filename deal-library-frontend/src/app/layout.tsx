import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Sovrn Marketing Co-Pilot',
  description: 'Marketing Co-Pilot Platform',
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
