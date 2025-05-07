'use client';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';

export default function HashItPage() {
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyHash, setPrivateKeyHash] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  
  const generateHash = async (key: string) => {
    if (!key) return;
    
    setIsHashing(true);
    try {
      // For client-side hashing, we need to use the Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(key);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Convert the hash to a hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setPrivateKeyHash(hashHex);
    } catch (error) {
      console.error('Error generating hash:', error);
    } finally {
      setIsHashing(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateHash(privateKey);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(privateKeyHash)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy hash:', err);
      });
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          Hash-It: Private Key Verification
        </h1>
        
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl p-6 shadow-lg border border-blue-700/30 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4">Enter Private Key</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                value={privateKey}
                onChange={handleInputChange}
                placeholder="Enter private key"
                className="w-full bg-blue-800/30 border border-blue-700/50 rounded-lg p-3 text-white placeholder-blue-400 font-mono text-sm"
              />
            </div>
            
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg w-full"
              disabled={!privateKey || isHashing}
            >
              {isHashing ? 'Generating...' : 'Generate SHA-256 Hash'}
            </button>
          </form>
        </div>
        
        {privateKeyHash && (
          <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl p-6 shadow-lg border border-blue-700/30">
            <h2 className="text-white text-lg font-semibold mb-4">Private Key Hash (SHA-256)</h2>
            
            <div className="bg-blue-800/30 p-4 rounded-lg border border-blue-700/30 mb-4">
              <p className="text-white font-mono break-all">
                {privateKeyHash}
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {isCopied ? 'Copied!' : 'Copy Hash'}
              </button>
              
              <div className="text-blue-300 text-sm">
                <p className="mb-2">This hash is used to verify transactions from the Lockr wallet.</p>
                <p>The original private key is never exposed or transmitted.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl p-6 shadow-lg border border-blue-700/30">
          <h2 className="text-white text-lg font-semibold mb-4">How It Works</h2>
          
          <div className="text-blue-100 space-y-3">
            <p>1. Enter your private key above to generate its SHA-256 hash.</p>
            <p>2. This hash is used as a verification mechanism for sending transactions.</p>
            <p>3. When you send ETH, the system verifies the hash matches before processing.</p>
            <p>4. This provides an additional layer of security without exposing the private key.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 