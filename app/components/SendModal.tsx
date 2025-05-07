'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromAddress: string;
}

interface FraudulentAddress {
  address: string;
  comment: string;
}

export default function SendModal({ isOpen, onClose, fromAddress }: SendModalProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fraudulentAddresses, setFraudulentAddresses] = useState<FraudulentAddress[]>([]);
  const [isFraudulent, setIsFraudulent] = useState(false);
  const [fraudulentComment, setFraudulentComment] = useState('');
  const [securityHashRequired, setSecurityHashRequired] = useState(false);
  const [securityHash, setSecurityHash] = useState('');
  const [lastTransactionTime, setLastTransactionTime] = useState<number | null>(null);
  const [securityReason, setSecurityReason] = useState('');
  const [mixerAddresses, setMixerAddresses] = useState<string[]>([]);
  const [isMixerAddress, setIsMixerAddress] = useState(false);
  const [isCheckingAddress, setIsCheckingAddress] = useState(false);
  
  // Hardcoded private key - this is the key for the Lockr wallet
  const privateKey = 'YOUR OWN PRIVATE KEY';
  
  // The expected security hash for high-risk transactions
  const expectedSecurityHash = 'da8f0e79837a46616587a7473baeaa294fdcc789780b243aad22e5a780b34a7d';
  
  useEffect(() => {
    // Fetch the fraudulent addresses list
    fetch('/data/fraudulent-addresses.json')
      .then(response => response.json())
      .then(data => {
        setFraudulentAddresses(data);
      })
      .catch(err => {
        console.error('Failed to load fraudulent addresses:', err);
      });
      
    // Fetch Tornado Cash / mixer addresses
    fetch('/data/mixer-addresses.json')
      .then(response => response.json())
      .then(data => {
        setMixerAddresses(data.map((item: any) => item.address.toLowerCase()));
      })
      .catch(err => {
        console.error('Failed to load mixer addresses:', err);
        // Fallback with some known Tornado Cash addresses
        setMixerAddresses([
          '0x722122df12d4e14e13ac3b6895a86e84145b6967',
          '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b',
          '0xd96f2b1c14db8458374d9aca76e26c3d18364307',
          '0x4736dcf1b7a3d580672cce6e7c65cd5cc9cfba9d',
          '0x169ad27a470d064dede56a2d3ff727986b15d52b'
        ]);
      });
      
    // Get the last transaction time from localStorage
    const storedLastTxTime = localStorage.getItem('lastTransactionTime');
    if (storedLastTxTime) {
      setLastTransactionTime(parseInt(storedLastTxTime));
    }
  }, []);
  
  // Check if recipient is a mixer address when it changes
  useEffect(() => {
    if (recipient && ethers.isAddress(recipient)) {
      const normalizedAddress = recipient.toLowerCase();
      setIsMixerAddress(mixerAddresses.includes(normalizedAddress));
    } else {
      setIsMixerAddress(false);
    }
  }, [recipient, mixerAddresses]);
  
  // Add this effect to check addresses when they change
  useEffect(() => {
    if (recipient && ethers.isAddress(recipient)) {
      setIsCheckingAddress(true);
      
      // Check if the address is in the fraudulent list
      setTimeout(() => {
        const normalizedAddress = recipient.toLowerCase();
        const fraudAddress = fraudulentAddresses.find(
          addr => addr.address.toLowerCase() === normalizedAddress
        );
        
        if (fraudAddress) {
          setIsFraudulent(true);
          setFraudulentComment(fraudAddress.comment);
          setError(`Transaction blocked: This address is flagged as fraudulent. Reason: ${fraudAddress.comment}`);
        } else {
          setIsFraudulent(false);
          setFraudulentComment('');
          // Clear the error if it was previously set for a fraudulent address
          if (error.includes('Transaction blocked: This address is flagged as fraudulent')) {
            setError('');
          }
        }
        
        setIsCheckingAddress(false);
      }, 300);
    } else {
      setIsFraudulent(false);
      setFraudulentComment('');
    }
  }, [recipient, fraudulentAddresses]);
  
  if (!isOpen) return null;
  
  const validateInputs = () => {
    if (!recipient) {
      setError('Please enter a recipient address');
      return false;
    }
    
    if (!ethers.isAddress(recipient)) {
      setError('Please enter a valid Ethereum address');
      return false;
    }
    
    // Block transaction if recipient is in fraudulent list
    if (isFraudulent) {
      setError(`Transaction blocked: This address is flagged as fraudulent. Reason: ${fraudulentComment}`);
      return false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    // Check if security hash is required
    const amountValue = parseFloat(amount);
    const currentTime = Date.now();
    const isLargeAmount = amountValue >= 2;
    const isFrequentTransaction = lastTransactionTime && (currentTime - lastTransactionTime < 1 * 60 * 1000);
    
    if (isLargeAmount || isFrequentTransaction || isMixerAddress) {
      setSecurityHashRequired(true);
      
      if (!securityHash) {
        if (isMixerAddress) {
          setError('Security hash required: Sending to a known mixer/Tornado Cash address');
        } else if (isLargeAmount && isFrequentTransaction) {
          setError('Security hash required: Large amount AND frequent transaction detected');
        } else if (isLargeAmount) {
          setError('Security hash required: Large amount detected (≥ 2 ETH)');
        } else {
          setError('Security hash required: Frequent transaction detected (within 1 minute)');
        }
        return false;
      }
      
      if (securityHash !== expectedSecurityHash) {
        setError('Invalid security hash. Please try again.');
        return false;
      }
    }
    
    return true;
  };
  
  const handleProceed = () => {
    setError('');
    
    // If the address is fraudulent, don't proceed
    if (isFraudulent) {
      setError(`Transaction blocked: This address is flagged as fraudulent. Reason: ${fraudulentComment}`);
      return;
    }
    
    // Check if this is a high-risk transaction that requires security hash
    const amountValue = parseFloat(amount);
    const currentTime = Date.now();
    const isLargeAmount = amountValue >= 2;
    const isFrequentTransaction = lastTransactionTime && (currentTime - lastTransactionTime < 1 * 60 * 1000);
    
    // Set the security reason message
    if (isMixerAddress) {
      setSecurityReason('Sending to a known mixer/Tornado Cash address');
      setSecurityHashRequired(true);
    } else if (isLargeAmount && isFrequentTransaction) {
      setSecurityReason('Large amount AND frequent transaction detected');
      setSecurityHashRequired(true);
    } else if (isLargeAmount) {
      setSecurityReason('Large amount detected (≥ 2 ETH)');
      setSecurityHashRequired(true);
    } else if (isFrequentTransaction) {
      setSecurityReason('Frequent transaction detected (within 1 minute)');
      setSecurityHashRequired(true);
    } else {
      setSecurityReason('');
      setSecurityHashRequired(false);
    }
    
    if (validateInputs()) {
      setShowConfirmation(true);
    }
  };
  
  const handleCancel = () => {
    setShowConfirmation(false);
  };
  
  const handleSend = async () => {
    // Reset states
    setError('');
    setTxHash('');
    setIsLoading(true);
    
    try {
      // Create a provider for Holesky testnet
      const provider = new ethers.JsonRpcProvider('https://ethereum-holesky.publicnode.com');
      
      // Create a wallet instance from the private key
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // Verify the wallet address matches the fromAddress
      if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error('Hardcoded private key does not match the sender address');
      }
      
      // Convert ETH amount to wei
      const amountInWei = ethers.parseEther(amount);
      
      // Create transaction object
      const tx = {
        to: recipient,
        value: amountInWei,
        gasLimit: 21000, // Standard gas limit for ETH transfers
      };
      
      // Send the transaction
      console.log(`Sending ${amount} ETH to ${recipient} from ${fromAddress}`);
      const transaction = await wallet.sendTransaction(tx);
      
      // Set the transaction hash
      setTxHash(transaction.hash);
      
      // Update last transaction time
      const currentTime = Date.now();
      setLastTransactionTime(currentTime);
      localStorage.setItem('lastTransactionTime', currentTime.toString());
      
      // Wait for the transaction to be mined
      await transaction.wait();
      
      console.log('Transaction confirmed:', transaction.hash);
      
      // Close modal after 5 seconds
      setTimeout(() => {
        onClose();
        // Refresh wallet data
        window.dispatchEvent(new CustomEvent('refreshWalletData'));
      }, 5000);
      
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render confirmation screen
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl border border-blue-700/30">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Confirm Transaction</h2>
              <button 
                onClick={onClose}
                className="text-blue-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 bg-blue-900/30 p-4 rounded-lg border border-blue-700/30">
              {isFraudulent && (
                <div className="p-3 bg-red-900/50 border border-red-800/50 rounded text-red-300 text-sm mb-2">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-500 mr-1 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <span className="font-bold">WARNING: Potentially fraudulent address!</span>
                      <p className="mt-0.5">{fraudulentComment}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-blue-300 text-sm">From:</span>
                <p className="text-white font-mono text-sm break-all">{fromAddress}</p>
              </div>
              
              <div>
                <span className="text-blue-300 text-sm">To:</span>
                <p className="text-white font-mono text-sm break-all">{recipient}</p>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <span className="text-blue-300 text-sm">Amount:</span>
                  <p className="text-white font-medium">{amount} ETH</p>
                </div>
                
                <div>
                  <span className="text-blue-300 text-sm">Network:</span>
                  <p className="text-white font-medium">Holesky Testnet</p>
                </div>
              </div>
              
              <div>
                <span className="text-blue-300 text-sm">Gas Limit:</span>
                <p className="text-white font-medium">21,000</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-blue-300">
              <p>Once confirmed, this transaction cannot be reversed.</p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-800/50 rounded text-red-300 text-sm mb-4">
                {error}
              </div>
            )}
            
            {txHash && (
              <div className="p-3 bg-green-900/50 border border-green-800/50 rounded text-green-300 text-sm mb-4">
                Transaction sent! Hash: 
                <a 
                  href={`https://holesky.etherscan.io/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline ml-1"
                >
                  {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                </a>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-blue-950/50 hover:bg-blue-900/50 text-blue-300 rounded transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className={`px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render main form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl border border-blue-700/30">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Send ETH from Lockr</h2>
            <button 
              onClick={onClose}
              className="text-blue-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-blue-300 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full bg-blue-800/30 border border-blue-700/50 rounded-lg p-3 text-white placeholder-blue-400 font-mono text-sm"
              />
            </div>
            
            {isCheckingAddress && (
              <div className="mt-1 text-blue-300 text-sm flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying address security...
              </div>
            )}
            
            {isFraudulent && (
              <div className="mt-2 p-3 bg-red-900/50 border border-red-800/50 rounded text-red-300 text-sm">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-1 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="font-bold">Transaction Blocked</span>
                    <p className="mt-0.5">This address is flagged as fraudulent: {fraudulentComment}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-blue-300 mb-1">
                Amount (ETH)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.01"
                step="0.001"
                min="0"
                className="w-full bg-blue-800/30 border border-blue-700/50 rounded-lg p-3 text-white placeholder-blue-400"
              />
            </div>
            
            {securityHashRequired && (
              <div>
                <label htmlFor="securityHash" className="block text-sm font-medium text-blue-300 mb-1">
                  Security Hash <span className="text-red-400">({securityReason})</span>
                </label>
                <input
                  type="text"
                  id="securityHash"
                  value={securityHash}
                  onChange={(e) => setSecurityHash(e.target.value)}
                  placeholder="Enter security hash..."
                  className="w-full bg-blue-800/30 border border-blue-700/50 rounded-lg p-3 text-white placeholder-blue-400 font-mono text-sm"
                />
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <button
                onClick={handleProceed}
                disabled={isLoading || isFraudulent || isCheckingAddress}
                className={`px-4 py-2 rounded transition-colors ${
                  isFraudulent 
                    ? 'bg-red-900/30 text-red-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isFraudulent ? 'Transaction Blocked' : 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 