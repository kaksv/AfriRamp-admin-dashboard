import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'https://afriramp-backend2.onrender.com/api';
const POLL_INTERVAL = 60000; // 60 seconds
const NO_PROOF_IMG_URL = 'https://res.cloudinary.com/dagn33ye3/image/upload/v1757411505/no-proof_dvzuzz.png';

const explorerUrls: Record<number, string> = {
  1: 'https://etherscan.io/tx/',
  11155111: 'https://sepolia.etherscan.io/tx/',
  44787: 'https://alfajores.celoscan.io/tx/',
  42220: 'https://celoscan.io/tx/',
  8453: 'https://basescan.org/tx/',
  84532: 'https://sepolia.basescan.org/tx/',
  1135: 'https://blockscout.lisk.com/tx/',
  4202: 'https://sepolia-blockscout.lisk.com/tx/'
};

type OfframpTransaction = {
  id: number;
  created_at: string;
  tx_hash: string;
  amount: number;
  token: string;
  fiat_amount: number;
  fiat_currency: string;
  payout_method: string;
  mobile_number: string;
  sender_email: string;
  sender_address: string;
  recipient_address: string;
  chain_id: number;
  status: string;
};

type OnrampTransaction = {
  id: number;
  created_at: string;
  amount: number;
  fiat_amount: number;
  fiat_currency: string;
  payout_network: string;
  sender_mobile: string;
  sender_email: string;
  recipient_address: string;
  chain_id: number;
  status: string;
  image_url?: string | null;
};

type TransactionType = 'offramp' | 'onramp';

const App = () => {
  const [type, setType] = useState<TransactionType>('offramp');
  const [transactions, setTransactions] = useState<OfframpTransaction[] | OnrampTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal state
  const [modalImg, setModalImg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${type}`, {
          params: { page, limit: 10 }
        });
        setTransactions(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch transactions');
        setLoading(false);
      }
    };
    fetchTransactions();

    // Polling setup
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRefreshFlag(f => f + 1); // triggers useEffect
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [type, page, refreshFlag]);

  const offrampHeaders = [
    'Timestamp', 'TX Hash', 'Amount', 'Token', 'Fiat Amount', 'Currency',
    'Payout Method', 'Mobile Number', 'Sender Email', 'Sender', 'Recipient', 'Chain ID', 'Status'
  ];
  const onrampHeaders = [
    'Timestamp', 'Amount', 'Fiat Amount', 'Currency', 'Payout Network',
    'Sender Mobile', 'Sender Email', 'Recipient', 'Chain ID', 'Status', 'Image'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h2 className="text-2xl font-bold leading-tight text-gray-900 mb-6">
        Transaction History
      </h2>

      <div className="mb-4 flex gap-4">
        <button
          className="px-4 py-2 rounded bg-green-500 text-white"
          onClick={() => setRefreshFlag(f => f + 1)}
        >
          Refresh
        </button>

        <button
          className={`px-4 py-2 rounded ${type === 'offramp' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => { setType('offramp'); setPage(1); }}
        >
          Offramp
        </button>
        <button
          className={`px-4 py-2 rounded ${type === 'onramp' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => { setType('onramp'); setPage(1); }}
        >
          Onramp
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-600 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                {(type === 'offramp' ? offrampHeaders : onrampHeaders).map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  {type === 'offramp' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[150px] truncate">
                        {tx.tx_hash && explorerUrls[tx.chain_id] ? (
                          <a
                            href={`${explorerUrls[tx.chain_id]}${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-blue-800 hover:underline"
                          >
                            {tx.tx_hash}
                          </a>
                        ) : (
                          <span>{tx.tx_hash}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.token}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.fiat_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.fiat_currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.payout_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.mobile_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.sender_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[120px] truncate">{tx.sender_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[120px] truncate">{tx.recipient_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.chain_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.status}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.fiat_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.fiat_currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.payout_network}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.sender_mobile}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.sender_email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[120px] truncate">{tx.recipient_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.chain_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          className="focus:outline-none"
                          onClick={() => setModalImg(tx.image_url ? tx.image_url : NO_PROOF_IMG_URL)}
                          title={tx.image_url ? "Click to preview" : "No proof uploaded"}
                        >
                          <img
                            src={tx.image_url ? tx.image_url : NO_PROOF_IMG_URL}
                            alt={tx.image_url ? "Proof" : "No proof uploaded"}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Image Modal */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
          onClick={() => setModalImg(null)}
        >
          <div className="bg-white rounded-lg p-4 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-700 hover:text-red-500 text-2xl"
              onClick={() => setModalImg(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={modalImg}
              alt="Proof"
              className="w-full h-auto max-h-[70vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
// ...existing code...