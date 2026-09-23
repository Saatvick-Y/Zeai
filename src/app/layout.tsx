import type { Metadata } from 'next';
import './globals.css';
import { TelemetryProvider } from '@/context/TelemetryContext';
import { ShellLayout } from '@/components/layout/ShellLayout';

export const metadata: Metadata = {
  title: 'ESPADA | Industrial Digital Twin & Operations Intelligence',
  description: 'Premium AI-driven Industrial Digital Twin Platform for M01-M10.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-industrial-950 text-industrial-100 h-screen w-screen overflow-hidden font-sans selection:bg-sky-500 selection:text-industrial-950">
        <TelemetryProvider>
          <ShellLayout>
            {children}
          </ShellLayout>
        </TelemetryProvider>
      </body>
    </html>
  );
}
