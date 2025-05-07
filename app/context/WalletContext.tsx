'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  address: string;
  isConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem('walletAddress');
      if (storedAddress && storedAddress !== '0x0000...0000') {
        setAddress(storedAddress);
        setIsConnected(true);
      }
    }
  }, []);

  const connectWallet = () => {
    const walletAddress = '0x2CFEa584c7fF59B4e52B12e0395D466ec8eE1E3b';
    
    // Store in state
    setAddress(walletAddress);
    setIsConnected(true);
    
    // Store in localStorage for persistence
    localStorage.setItem('walletAddress', walletAddress);
    
    // Dispatch event for components that might be listening
    const event = new CustomEvent('walletAddressChanged', { 
      detail: { address: walletAddress }
    });
    window.dispatchEvent(event);
  };

  const disconnectWallet = () => {
    setAddress('');
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
    
    // Dispatch event for components that might be listening
    const event = new CustomEvent('walletAddressChanged', { 
      detail: { address: '' }
    });
    window.dispatchEvent(event);
  };

  return (
    <WalletContext.Provider value={{ address, isConnected, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 