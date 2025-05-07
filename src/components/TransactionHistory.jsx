const TransactionHistory = () => {
  const transactions = [
    { id: 1, type: 'Send', amount: '0.5 ETH', status: 'Completed', date: '2024-03-20' },
    { id: 2, type: 'Receive', amount: '1.2 ETH', status: 'Pending', date: '2024-03-19' },
  ];

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800">Transaction History</h2>
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4 whitespace-nowrap">{tx.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{tx.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory; 