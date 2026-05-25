import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PwaRegister } from '@/components/pwa/pwa-register';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Lumio — Team Productivity',
    template: '%s | Lumio',
  },
  description: 'The team productivity platform that keeps everyone aligned.',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    title: 'Lumio — Team Productivity',
    description: 'The team productivity platform that keeps everyone aligned.',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f6ef7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
