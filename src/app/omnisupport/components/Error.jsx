import React from 'react';

const Error = ({ transaction }) => (
  <div className="text-center p-6 bg-white">
    {/* Cross Icon */}
    <div className="flex items-center justify-center">
      <div className="mb-4 bg-red-600 p-3 rounded-full w-12 h-12 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    </div>

    <p className='text-center font-semibold mb-1 text-[22px]'>KES {transaction.recipientAmount}</p>
    <p className="text-center text-[15px] text-gray-400 mb-2">
    Transaction Failed to <span className="text-gray-800 font-semibold">KPLC</span>
    </p>
    <p className="text-center text-gray-[15px] text-gray-400 mb-7">
      on{' '}
      <span className="text-gray-800 font-semibold">
        {new Date(transaction.date).toLocaleString()}
      </span>
    </p>

    <ul className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-left">
      <li className="text-gray-500">Transaction ID:</li>
      <li>{transaction.transactionId}</li>

      <li className="text-gray-500">Transaction Key:</li>
      <li>{transaction.transactionKey}</li>

      <li className="text-gray-500">Sender Phone:</li>
      <li>{transaction.senderPhone}</li>

      <li className="text-gray-500">Transaction Type:</li>
      <li>{transaction.transactionType}</li>

      <li className="text-gray-500">Account Number:</li>
      <li>{transaction.accountNumber}</li>

      <li className="text-gray-500">Receiver Name:</li>
      <li>{transaction.receiverName}</li>

      <li className="text-gray-500">Sender Amount (GBP):</li>
      <li>{transaction.senderAmount}</li>

      <li className="text-gray-500">Recipient Amount (KES):</li>
      <li>{transaction.recipientAmount}</li>

      <li className="text-gray-500">Exchange Rate:</li>
      <li>{transaction.exchangeRate}</li>

      <li className="text-gray-500">Date:</li>
      <li>{transaction.date}</li>

    
    </ul>

    <hr className="mt-6" />

    <h1 className="text-center mt-4 font-semibold">Sender</h1>
    <p className="font-medium text-center mt-2">{transaction.senderName}</p>
    <p className="font-medium text-gray-500 text-center mt-2">{transaction.senderPhone}</p>
  </div>
);

export default Error;
