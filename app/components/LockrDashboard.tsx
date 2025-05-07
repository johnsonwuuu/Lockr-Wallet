'use client';
import { useState, useEffect } from 'react';
import SendModal from './SendModal';

// Instead, load from environment variable
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
const LOCKR_ADDRESS = '0xb1f13cffEe7D050c11405040FbFC7B8aeE1caEA5';
const DEFAULT_ETH_PRICE_USD = 3500; // Fallback price if API fails

export default function LockrDashboard() {
  const [ethBalance, setEthBalance] = useState('0.00');
  const [portfolioValue, setPortfolioValue] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [ethPrice, setEthPrice] = useState(DEFAULT_ETH_PRICE_USD);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Fetch current ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // Using CoinGecko API (free, no API key required)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        if (data && data.ethereum && data.ethereum.usd) {
          setEthPrice(data.ethereum.usd);
          
          // Recalculate portfolio value if we already have a balance
          if (ethBalance !== '0.00') {
            const newValue = (parseFloat(ethBalance) * data.ethereum.usd).toFixed(2);
            setPortfolioValue(newValue);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
        // Keep using the default price
      }
    };
    
    fetchEthPrice();
  }, [ethBalance]);

  // Fetch balance data for Lockr wallet
  useEffect(() => {
    const fetchLockrData = async () => {
      setIsLoading(true);
      try {
        // Fetch balance
        const balanceUrl = `https://api-holesky.etherscan.io/api?module=account&action=balance&address=${LOCKR_ADDRESS}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
        const balanceResponse = await fetch(balanceUrl);
        const balanceData = await balanceResponse.json();
        
        if (balanceData.status === '1') {
          // Convert wei to ETH (1 ETH = 10^18 wei)
          const balanceInEth = parseFloat(balanceData.result) / 1e18;
          const formattedBalance = balanceInEth.toFixed(4);
          setEthBalance(formattedBalance);
          
          // Calculate portfolio value
          const valueInUsd = (balanceInEth * ethPrice).toFixed(2);
          setPortfolioValue(valueInUsd);
        }
        
        // Fetch transactions
        const txUrl = `https://api-holesky.etherscan.io/api?module=account&action=txlist&address=${LOCKR_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
        const txResponse = await fetch(txUrl);
        const txData = await txResponse.json();
        
        if (txData.status === '1' && txData.result.length > 0) {
          // Process transactions
          const processedTx = txData.result.map((tx: any) => ({
            id: tx.hash,
            hash: tx.hash,
            type: tx.from.toLowerCase() === LOCKR_ADDRESS.toLowerCase() ? 'Send' : 'Receive',
            amount: `${(parseFloat(tx.value) / 1e18).toFixed(4)} ETH`,
            status: tx.confirmations > 12 ? 'Completed' : 'Pending',
            date: new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString(),
            from: tx.from,
            to: tx.to
          }));
          setTransactions(processedTx);
        }
      } catch (error) {
        console.error('Failed to fetch Lockr data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLockrData();
  }, [ethPrice]);

  const copyAddress = () => {
    navigator.clipboard.writeText(LOCKR_ADDRESS)
      .then(() => {
        alert('Lockr address copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };

  const viewOnExplorer = () => {
    window.open(`https://holesky.etherscan.io/address/${LOCKR_ADDRESS}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Lockr Exchange Wallet</h1>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => setIsSendModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Send
          </button>
          <button 
            onClick={copyAddress}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Copy Address
          </button>
          <button 
            onClick={viewOnExplorer}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            View on Explorer
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lockr Balance Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg p-6 border border-blue-700/30">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mr-3">
              <span className="text-xl">🔒</span>
            </div>
            <h2 className="text-lg font-medium text-blue-200">Lockr Balance</h2>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-8 bg-blue-700/40 rounded w-3/4"></div>
                <div className="h-6 bg-blue-700/40 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-2">
                <p className="text-3xl font-bold text-white">{ethBalance} ETH</p>
                <p className="text-blue-300 mt-1">${portfolioValue} USD</p>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-blue-300">Lockr Address</h3>
                <p className="mt-1 text-white text-sm font-mono bg-blue-800/50 p-2 rounded-md border border-blue-700/30">
                  {LOCKR_ADDRESS.substring(0, 8)}...{LOCKR_ADDRESS.substring(LOCKR_ADDRESS.length - 8)}
                </p>
              </div>
            </>
          )}
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-blue-300">Security Status</h3>
            <div className="mt-1 flex items-center text-green-400">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Maximum Security Protocol</span>
            </div>
          </div>
        </div>
        
        {/* Tabs section */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg overflow-hidden border border-blue-700/30">
          <div className="border-b border-blue-700">
            <div className="flex">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'text-white border-b-2 border-purple-500 bg-blue-800/50' 
                    : 'text-blue-300 hover:text-white hover:bg-blue-800/30'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transactions' 
                    ? 'text-white border-b-2 border-purple-500 bg-blue-800/50' 
                    : 'text-blue-300 hover:text-white hover:bg-blue-800/30'
                }`}
              >
                Transactions
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' ? (
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Lockr Exchange Wallet</h3>
                <p className="text-blue-200 mb-4">
                  The Lockr Exchange Wallet is a secure, multi-signature wallet that holds funds for the exchange operations. 
                  All user deposits are protected by advanced security protocols and insurance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-700/30">
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Total Value Locked</h4>
                    <p className="text-2xl font-bold text-white">${portfolioValue}</p>
                  </div>
                  <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-700/30">
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Security Rating</h4>
                    <p className="text-2xl font-bold text-green-400">A+</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-blue-700/40 rounded"></div>
                    <div className="h-10 bg-blue-700/40 rounded"></div>
                    <div className="h-10 bg-blue-700/40 rounded"></div>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-sm text-blue-300 border-b border-blue-700">
                          <th className="pb-2 text-left">Type</th>
                          <th className="pb-2 text-left">Amount</th>
                          <th className="pb-2 text-left">Status</th>
                          <th className="pb-2 text-left">Date</th>
                          <th className="pb-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-blue-700/50 hover:bg-blue-800/30 transition-colors">
                            <td className="py-3 text-white">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                  tx.type === 'Send' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                                }`}></div>
                                {tx.type}
                              </div>
                            </td>
                            <td className="py-3 text-white">{tx.amount}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                tx.status === 'Completed' 
                                  ? 'bg-gradient-to-r from-green-900 to-green-800 text-green-300 border border-green-700/50' 
                                  : 'bg-gradient-to-r from-yellow-900 to-yellow-800 text-yellow-300 border border-yellow-700/50'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 text-white">{tx.date}</td>
                            <td className="py-3">
                              <button 
                                onClick={() => window.open(`https://holesky.etherscan.io/tx/${tx.hash}`, '_blank')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-blue-300">
                    <p>No transactions found for the Lockr wallet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <SendModal 
        isOpen={isSendModalOpen} 
        onClose={() => setIsSendModalOpen(false)} 
        fromAddress={LOCKR_ADDRESS} 
      />
    </div>
  );
} 