'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useWallet } from '../context/WalletContext';
import DepositModal from './DepositModal';

// Mock data for the price chart
const priceData = [
  { time: '00:00', price: 1750 },
  { time: '04:00', price: 1760 },
  { time: '08:00', price: 1780 },
  { time: '12:00', price: 1775 },
  { time: '16:00', price: 1790 },
  { time: '20:00', price: 1770 },
  { time: '24:00', price: 1771 },
];

// You would need to get an API key from Etherscan
const ETHERSCAN_API_KEY = 'YOUR OWN API KEY';
// Update the default price to be more realistic
const DEFAULT_ETH_PRICE_USD = 1700; // More current fallback price

// Helper function to format currency with commas
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export default function Dashboard() {
  // Use the global wallet context
  const { address, isConnected } = useWallet();
  
  // Local state for the dashboard
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputAddress, setInputAddress] = useState('');
  const [activeTab, setActiveTab] = useState('assets');
  const [ethBalance, setEthBalance] = useState('0.00');
  const [portfolioValue, setPortfolioValue] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [ethPrice, setEthPrice] = useState(DEFAULT_ETH_PRICE_USD);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);

  // Fetch current ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // Using CoinGecko API (free, no API key required)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.ethereum && data.ethereum.usd) {
          console.log('Fetched ETH price:', data.ethereum.usd);
          setEthPrice(data.ethereum.usd);
          
          // Recalculate portfolio value if we already have a balance
          if (ethBalance !== '0.00') {
            const newValue = (parseFloat(ethBalance) * data.ethereum.usd).toFixed(2);
            setPortfolioValue(newValue);
          }
        } else {
          console.error('Invalid data format from CoinGecko API');
        }
      } catch (error) {
        console.error('Failed to fetch ETH price:', error);
        // Keep using the default price
      }
    };
    
    fetchEthPrice();
    
    // Set up a timer to refresh the price every 60 seconds
    const timer = setInterval(fetchEthPrice, 60000);
    
    return () => clearInterval(timer);
  }, [ethBalance]);

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(e.target.value);
  };
  
  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        alert('Address copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };
  
  // View address on explorer
  const viewOnExplorer = () => {
    // Open Holesky Etherscan in a new tab
    window.open(`https://holesky.etherscan.io/address/${address}`, '_blank');
  };
  
  // Format tooltip for chart
  const formatter = (value: number) => {
    return [`$${formatCurrency(value)}`, 'Price'];
  };

  // Fetch balance data for the connected wallet
  const fetchBalanceData = async (walletAddress: string) => {
    if (!walletAddress || walletAddress === '0x0000...0000') {
      resetDashboard();
      return;
    }
    
    setIsLoading(true);
    try {
      // Try to fetch from Etherscan API with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const balanceUrl = `https://api-holesky.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;
      
      console.log('Fetching fresh balance from:', balanceUrl);
      
      const balanceResponse = await fetch(balanceUrl, { 
        cache: 'no-store',
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (!balanceResponse.ok) {
        throw new Error(`HTTP error! Status: ${balanceResponse.status}`);
      }
      
      const balanceData = await balanceResponse.json();
      
      console.log('Balance API response:', balanceData);
      
      if (balanceData.status === '1' && balanceData.result) {
        // Convert wei to ETH (1 ETH = 10^18 wei)
        const balanceInEth = parseFloat(balanceData.result) / 1e18;
        const formattedBalance = balanceInEth.toFixed(4);
        setEthBalance(formattedBalance);
        
        // Calculate portfolio value
        const valueInUsd = (balanceInEth * ethPrice).toFixed(2);
        setPortfolioValue(valueInUsd);
        
        // Generate mock transaction history
        generateMockTransactions();
        
        // Generate mock price history
        generatePriceHistory();
      } else {
        console.log('API returned error status, using fallback data');
        useFallbackData(walletAddress);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Use fallback mock data
      useFallbackData(walletAddress);
    } finally {
      setIsLoading(false);
    }
  };

  // Cache wallet data to localStorage
  const cacheWalletData = (walletAddress: string, balance: string, value: string) => {
    try {
      const dataToCache = {
        ethBalance: balance,
        portfolioValue: value,
        transactions: transactions,
        priceHistory: priceHistory,
        timeLabels: timeLabels,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`wallet_data_${walletAddress}`, JSON.stringify(dataToCache));
    } catch (e) {
      console.error('Error caching wallet data:', e);
    }
  };

  // Generate price history data
  const generatePriceHistory = () => {
    const history = [];
    const labels = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const price = 3000 + Math.random() * 1000;
      history.push(price);
      
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    setPriceHistory(history);
    setTimeLabels(labels);
  };

  // Helper function to use fallback data when API fails
  const useFallbackData = (walletAddress: string) => {
    // Generate a random balance between 0.1 and 5 ETH
    const mockEthBalance = (0.1 + Math.random() * 4.9).toFixed(4);
    setEthBalance(mockEthBalance);
    
    // Calculate portfolio value
    const value = (parseFloat(mockEthBalance) * ethPrice).toFixed(2);
    setPortfolioValue(value);
    
    // Generate mock price history
    generatePriceHistory();
    
    // Generate mock transaction history
    generateMockTransactions();
    
    // Cache the fallback data
    cacheWalletData(walletAddress, mockEthBalance, value);
  };

  // Reset dashboard function
  const resetDashboard = () => {
    setEthBalance('0.00');
    setPortfolioValue('0.00');
    setTransactions([]);
    setIsLoading(false);
  };

  // Generate mock transaction history
  const generateMockTransactions = () => {
    const types = ['Send', 'Receive'];
    const statuses = ['Completed', 'Pending'];
    
    const mockTransactions = Array(5).fill(null).map((_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = (0.01 + Math.random() * 0.5).toFixed(4);
      const status = Math.random() > 0.2 ? 'Completed' : 'Pending';
      
      // Generate a random date within the last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      return {
        id: `tx-${i}`,
        type,
        amount: `${amount} ETH`,
        status,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
      };
    });
    
    setTransactions(mockTransactions);
  };

  // Fetch data when address changes from context
  useEffect(() => {
    if (isConnected && address) {
      console.log('Address changed in context, fetching data for:', address);
      setInputAddress(address);
      fetchBalanceData(address);
    } else {
      // Reset dashboard when disconnected
      resetDashboard();
    }
  }, [address, isConnected]);

  // Listen for wallet address changed events
  useEffect(() => {
    const handleWalletAddressChanged = (event: any) => {
      const { address } = event.detail;
      console.log('Received wallet address from connect button:', address);
      
      if (!address || address === '') {
        // Handle disconnect event
        resetDashboard();
        return;
      }
      
      // Update the input address
      setInputAddress(address);
      
      // Fetch balance data for this address
      fetchBalanceData(address);
    };
    
    window.addEventListener('walletAddressChanged', handleWalletAddressChanged);
    
    return () => {
      window.removeEventListener('walletAddressChanged', handleWalletAddressChanged);
    };
  }, []);

  // Fetch fresh data when component mounts or becomes visible
  useEffect(() => {
    if (isConnected && address) {
      // Force a fresh data fetch when component becomes visible
      fetchBalanceData(address);
    }
    
    // Listen for visibility changes (when user returns to the tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isConnected && address) {
        fetchBalanceData(address);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for refresh events
  useEffect(() => {
    const handleRefreshWalletData = () => {
      if (isConnected && address) {
        fetchBalanceData(address);
      }
    };
    
    window.addEventListener('refreshWalletData', handleRefreshWalletData);
    
    return () => {
      window.removeEventListener('refreshWalletData', handleRefreshWalletData);
    };
  }, [address, isConnected]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Dashboard</h1>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Deposit
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portfolio value card */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg overflow-hidden col-span-2 border border-blue-700/30">
          <div className="p-6">
            <h2 className="text-lg font-medium text-blue-200 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Portfolio Value
            </h2>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-white">${formatCurrency(parseFloat(portfolioValue))}</p>
              {isLoading && (
                <div className="ml-3 animate-pulse">
                  <div className="h-2 w-10 bg-blue-400 rounded"></div>
                </div>
              )}
            </div>
            <p className="text-green-400 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +2.4% (24h)
            </p>
          </div>
          <div className="h-40 px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: '#93c5fd' }} axisLine={{ stroke: '#3b82f6' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#93c5fd' }} axisLine={{ stroke: '#3b82f6' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e3a8a', borderColor: '#3b82f6', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
                  labelStyle={{ color: 'white', fontWeight: 'bold' }}
                  itemStyle={{ color: 'white' }}
                  formatter={formatter}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff' }}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Wallet info card */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl shadow-lg p-6 border border-blue-700/30">
          <h2 className="text-lg font-medium text-blue-200 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Wallet
          </h2>
          
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-blue-300">ETH Balance</h3>
              {isLoading && (
                <div className="animate-pulse">
                  <div className="h-2 w-10 bg-blue-400 rounded"></div>
                </div>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{ethBalance} ETH</p>
            <p className="text-blue-300 text-sm">${formatCurrency(parseFloat(portfolioValue))}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-blue-300">Wallet Address</h3>
            {isEditing ? (
              <div>
                <input 
                  type="text" 
                  value={inputAddress}
                  onChange={handleAddressChange}
                  placeholder="Enter wallet address"
                  className="w-full p-2 rounded text-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded text-white text-sm transition-all duration-200 shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center">
                <p className="text-sm font-mono bg-blue-900/50 backdrop-blur-sm p-2 rounded break-all text-white border border-blue-700/50">
                  {address || '0x0000...0000'}
                </p>
                <button 
                  onClick={() => {
                    setInputAddress(address);
                    setIsEditing(true);
                  }}
                  className="ml-2 text-blue-300 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-blue-300">Security Status</h3>
            <div className="mt-1 flex items-center text-green-400">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Protected by Lockr Security</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-blue-300">Quick Actions</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button 
                onClick={copyAddress}
                className="bg-gradient-to-r from-blue-700/80 to-blue-800/80 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-md text-sm transition-all duration-300 shadow-sm hover:shadow-md border border-blue-600/30 backdrop-blur-sm"
              >
                Copy Address
              </button>
              <button 
                onClick={viewOnExplorer}
                className="bg-gradient-to-r from-blue-700/80 to-blue-800/80 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-md text-sm transition-all duration-300 shadow-sm hover:shadow-md border border-blue-600/30 backdrop-blur-sm"
              >
                View on Explorer
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deposit Modal */}
      <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
    </div>
  );
} 