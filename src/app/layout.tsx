
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

// This is a client component, but we can't export metadata from it.
// We can keep this here for reference, but it won't be used.
// export const metadata: Metadata = {
//   title: 'AsraPy',
//   description: 'Coding Beyond Imagination',
// };

function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatPage = useMemo(() => pathname === '/chat', [pathname]);

  if (isChatPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <title>AsraPy</title>
        <meta name="description" content="Coding Beyond Imagination" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            <SiteLayout>{children}</SiteLayout>
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
