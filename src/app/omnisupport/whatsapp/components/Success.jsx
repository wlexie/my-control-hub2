import React from 'react';
import { jsPDF } from 'jspdf';

const Success = ({ transaction }) => {
  const downloadReceipt = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Transaction Receipt', 20, 20);

    doc.setFontSize(12);
    doc.text(`Recipient Amount: KES ${transaction.recipientAmount}`, 20, 35);
    doc.text(`Sent To: KPLC`, 20, 45);
    doc.text(`Date: ${new Date(transaction.date).toLocaleString()}`, 20, 55);

    doc.text(`Transaction ID: ${transaction.transactionId}`, 20, 70);
    doc.text(`Transaction Key: ${transaction.transactionKey}`, 20, 80);
    doc.text(`Transaction Reference: ${transaction.transactionReference}`, 20, 90);
    doc.text(`Transaction Type: ${transaction.transactionType}`, 20, 100);
    doc.text(`Account Number: ${transaction.accountNumber}`, 20, 110);
    doc.text(`Receiver Name: ${transaction.receiverName}`, 20, 120);
    doc.text(`Sender Amount: ${transaction.senderAmount}`, 20, 130);
    doc.text(`Exchange Rate: ${transaction.exchangeRate}`, 20, 140);

    doc.text(`Sender Name: ${transaction.senderName}`, 20, 155);
    doc.text(`Sender Phone: ${transaction.senderPhone}`, 20, 165);

    doc.save(`receipt_${transaction.transactionId}.pdf`);
  };

  return (
    <div className="text-center p-6 bg-white">
      {/* Tick SVG Icon */}
      <div className="flex items-center justify-center">
        <img
          src="/svgs/tick.svg"
          alt="Success"
          className="mb-4 bg-green-700 p-3 rounded-full w-12 h-12"
        />
      </div>

      <p className="text-center font-semibold mb-1 text-[22px]">
        KES {transaction.recipientAmount}
      </p>
      <p className="text-center text-[15px] text-gray-400 mb-2">
        Successfully sent to <span className="text-gray-800 font-semibold">KPLC</span>
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

      {/* Download Button */}
      <div className="mt-6 inline-flex justify-center">
        <span className='text-yellow-500 mr-2'>
            +

        </span>
        
        <button
          onClick={downloadReceipt}
          className=" text-yellow-500 font-semibold transition duration-300"
        >
          Download Receipt 
        </button>
      </div>
    </div>
  );
};

export default Success;
