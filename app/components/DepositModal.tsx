'use client';
import { useState } from 'react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const lockrAddress = 'CHANGE TO YOUR ADDRESS';

  if (!isOpen) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(lockrAddress)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl border border-blue-700/30">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Deposit to Lockr</h2>
            <button 
              onClick={onClose}
              className="text-blue-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-blue-200 mb-4">
              Send ETH to the following address to deposit funds into your Lockr Exchange account:
            </p>
            
            <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <span className="text-white">🔒</span>
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 mb-1">Lockr Exchange Address</p>
                    <p className="font-mono text-sm text-white break-all">{lockrAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button 
                  onClick={copyAddress}
                  className={`w-full py-2 rounded-md font-medium transition-all duration-300 ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-800/20 rounded-lg p-4 border border-blue-700/20">
            <h3 className="text-white font-medium mb-2">Important Notes:</h3>
            <ul className="text-blue-200 text-sm space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Only send ETH to this address. Other tokens may be lost.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Deposits typically take 1-2 minutes to be credited to your account.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Your funds are secured by Lockr's advanced security protocols.</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-blue-300 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 