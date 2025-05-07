'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import { WalletProvider } from './context/WalletContext';
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from './context/WalletContext';

const inter = Inter({ subsets: ['latin'] });

// Metadata needs to be in a separate file or handled differently in Next.js 13+
// when using 'use client' directive

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Lockr - Secure Crypto Wallet</title>
        <meta name="description" content="A secure and user-friendly cryptocurrency wallet" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-gray-900 to-blue-950`}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
