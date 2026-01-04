import '@/styles/app.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Head from 'next/head';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';

import { Header } from '@/components/Header';
import { Providers } from '@/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TUWA x Enso Finance | Wallet Assets & Token Exchange Demo',
  description:
    'A comprehensive demo showcasing TUWA SDK integration with Enso Finance API. Features wallet asset tracking, token exchange, and real-time portfolio management powered by Nova Connect and Pulsar Engine.',
  keywords: [
    'TUWA',
    'Enso Finance',
    'DeFi',
    'Token Exchange',
    'Wallet Assets',
    'Portfolio Management',
    'Nova Connect',
    'Pulsar Engine',
    'Ethereum',
    'EVM',
    'Web3',
    'Next.js',
    'React',
    'TypeScript',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="apple-mobile-web-app-title" content="Pulsar & Cosmos SDK: Next.js" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Header />
          {children}

          {/* Toast Container */}
          <ToastContainer
            className="Exchange_toast"
            containerId="exchange"
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            style={{
              fontSize: '14px',
            }}
            toastStyle={{
              backgroundColor: 'var(--tuwa-bg-primary)',
              color: 'var(--tuwa-text-primary)',
              border: '1px solid var(--tuwa-border-primary)',
              borderRadius: '12px',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
