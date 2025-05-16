import { useState, useEffect } from 'react';
import axios from 'axios';

// Add blockchain explorer URLs based on chain ID
const explorerUrls: Record<number, string> = {
  1: 'https://etherscan.io/tx/', // Ethereum Mainnet
  11155111: 'https://sepolia.etherscan.io/tx/', // Binance Smart Chain
  44787: 'https://alfajores.celoscan.io/tx/', // Polygon
  42220: 'https://celoscan.io/tx/', // Arbitrum
  8453: 'https://basescan.org/tx/', // Optimism
  84532: 'https://sepolia.basescan.org/tx/', // Avalanche
  1135: 'https://blockscout.lisk.com/tx/', // Ethereum Goerli Testnet
  4202: 'https://sepolia-blockscout.lisk.com/tx/' // Ethereum Sepolia Testnet
};

const App = () => {
  interface Transaction {
    id: string;
    created_at: string;
    tx_hash: string;
    amount: number;
    token: string;
    fiat_amount: number;
    fiat_currency: string;
    payout_method: string;
    mobile_number: string;
    sender_address: string;
    recipient_address: string;
    chain_id: number;
  }

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('https://afriramp-backend.onrender.com/api/admin/transactions');
        setTransactions(response.data.data);
        console.log(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch transactions');
        setLoading(false);
        console.error(err);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-100 text-red-600 text-center">
      {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h2 className="text-2xl font-bold leading-tight text-gray-900 mb-6">
        Transaction History
      </h2>
      
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800">
            <tr>
              {[
                'Timestamp',
                'TX Hash',
                'Amount',
                'Token',
                'Fiat Amount',
                'Currency',
                'Payout Method',
                'Mobile Number',
                'Sender',
                'Recipient',
                'Chain ID'
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[150px] truncate">
                  {explorerUrls[transaction.chain_id] ? (
                    <a
                      href={`${explorerUrls[transaction.chain_id]}${transaction.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-blue-800 hover:underline"
                    >
                      {transaction.tx_hash}
                    </a>
                  ) : (
                    <span>{transaction.tx_hash}</span>
                  )}
                  {transaction.tx_hash}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.token}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.fiat_amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.fiat_currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.payout_method}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.mobile_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[120px] truncate">
                  {transaction.sender_address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[120px] truncate">
                  {transaction.recipient_address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.chain_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;