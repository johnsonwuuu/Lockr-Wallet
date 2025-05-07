import { useState } from 'react';

const Dashboard = () => {
  const [balance, setBalance] = useState('0.00');
  const [address, setAddress] = useState('0x...');

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Balance Card */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Total Balance</h2>
        <p className="mt-2 text-3xl font-bold text-blue-600">${balance}</p>
        <div className="mt-4">
          <button className="px-4 py-2 mr-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Send
          </button>
          <button className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
            Receive
          </button>
        </div>
      </div>

      {/* Wallet Address Card */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Wallet Address</h2>
        <p className="mt-2 font-mono text-sm text-gray-600">{address}</p>
        <button className="px-4 py-2 mt-4 text-blue-500 border border-blue-500 rounded hover:bg-blue-50">
          Copy Address
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 