'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from '../context/WalletContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
  
  // Function to view Lockr exchange wallet on explorer
  const viewLockrWallet = () => {
    window.open(`https://holesky.etherscan.io/address/0xb1f13cffEe7D050c11405040FbFC7B8aeE1caEA5`, '_blank');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-blue-950">
      {/* Navigation */}
      <nav className="bg-blue-900/80 backdrop-blur-md border-b border-blue-800/50 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Lockr Exchange
                </div>
                <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-xs px-2 py-0.5 rounded-full text-white font-medium shadow-sm">BETA</span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/" className="text-white hover:text-blue-200 px-3 py-2 font-medium transition-colors duration-200">Dashboard</Link>
                <Link 
                  href="/lockr" 
                  className="text-white hover:text-blue-200 px-3 py-2 font-medium transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2">🔒</span>
                  <span>Lockr</span>
                  <span className="ml-2 text-xs text-blue-300 hidden lg:inline">0xb1f1...aEA5</span>
                </Link>
                <Link 
                  href="/hash-it" 
                  className="text-white hover:text-blue-200 px-3 py-2 font-medium transition-colors duration-200"
                >
                  Hash-It
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center">
              {isConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="text-blue-300 text-sm">
                    <span className="hidden lg:inline">Connected: </span>
                    <span className="font-mono">{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Connect Wallet
                </button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-300 hover:text-white hover:bg-blue-800/50 focus:outline-none transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/" 
                className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800/30 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/lockr" 
                className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800/30 transition-colors duration-200 w-full text-left flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">🔒</span>
                <span>Lockr</span>
                <span className="ml-2 text-xs text-blue-300">0xb1f1...aEA5</span>
              </Link>
              <Link 
                href="/hash-it" 
                className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-800/30 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Hash-It
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t border-blue-800/50">
              <div className="px-2 space-y-1">
                {isConnected ? (
                  <>
                    <div className="px-3 py-2 text-blue-300 text-sm">
                      Connected: <span className="font-mono">{address.substring(0, 6)}...{address.substring(address.length - 4)}</span>
                    </div>
                    <button 
                      onClick={() => {
                        disconnectWallet();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm"
                    >
                      Disconnect Wallet
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      connectWallet();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-sm"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-blue-900/80 backdrop-blur-md border-t border-blue-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-blue-300">
            &copy; 2024 Lockr Exchange. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 