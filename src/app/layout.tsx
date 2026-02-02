import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpsFlow | Operational Excellence',
  description: 'Real-time routine execution & forensic audit platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-900 text-white font-mono">
        {children}
      </body>
    </html>
  );
}
