import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { ThemeProvider } from '@/lib/theme';
import { BackendWarmup } from '@/components/aws/BackendWarmup';

export const metadata: Metadata = {
  title: 'AWS Route 53 Console Clone',
  description: 'A functional clone of the AWS Route 53 DNS Management console',
  icons: {
    icon: '/image.png',
    shortcut: '/image.png',
    apple: '/image.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <BackendWarmup>{children}</BackendWarmup>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
