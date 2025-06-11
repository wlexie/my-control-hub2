"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Success from "./Success";
import Error from "./Error";
import { useRef } from "react";


const CopyButton = ({ text }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="ml-2 px-2 py-1 text-blue-600 underline hover:text-blue-800"
    >
      Copy
    </button>
  );
};

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const recordsPerPage = 12;

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `https://api.tuma-app.com/api/transfer/kplc-transactions?page=${currentPage}&size=${recordsPerPage}`
      );
      setTransactions(response.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date).setHours(0, 0, 0, 0);
    const matchesSearchTerm = transaction.senderName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      return (
        matchesSearchTerm &&
        transactionDate >= start &&
        transactionDate <= end
      );
    }

    if (startDate && !endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      return matchesSearchTerm && transactionDate === start;
    }

    return matchesSearchTerm;
  });
  // Inside TransactionTable component
const modalRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setSelectedTransaction(null);
    }
  };

  if (selectedTransaction) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [selectedTransaction]);

  return (
    <div className="pt-3 pl-6 bg-white w-full font-poppins max-h-screen rounded-lg shadow-md overflow-x-auto relative">
      <div className="mb-6 flex items-center justify-between mr-6 gap-4">
        <h1 className="text-lg font-semibold">All KPLC Transactions</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by sender name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-72 px-2 p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <h1 className="text-gray-400 text-[14px] font-[500] ml-5">
            Filter By Date
          </h1>
          <div className="flex items-center gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                setEndDate(null);
                setCurrentPage(1);
              }}
              placeholderText="Start Date"
              className="px-2 p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
              isClearable
            />
            <span>to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                setCurrentPage(1);
              }}
              placeholderText="End Date"
              className="px-2 p-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
              isClearable
              minDate={startDate}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="">
        <table className="min-w-full text-[12px] font-poppins text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-500 whitespace-nowrap">
              <th className="p-3 font-semibold">Transaction ID</th>
              <th className="p-3 font-semibold">Sender Name</th>
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Account No</th>
              <th className="p-3 font-semibold">Sender Phone</th>
              <th className="p-3 font-semibold">Sender Amount</th>
              <th className="p-3 font-semibold">Recipient Amount</th>
              <th className="p-3 font-semibold">Exchange Rate</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr
                key={transaction.transactionId || index}
                className="border-b hover:bg-gray-100 text-[13px] transition-colors whitespace-nowrap cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <td className="p-3">{transaction.transactionId}</td>
                <td className="p-3">{transaction.senderName}</td>
                <td className="p-3">{transaction.transactionType}</td>
                <td className="p-3">{transaction.accountNumber}</td>
                <td className="p-3">{transaction.senderPhone}</td>
                <td className="p-3 text-center">{transaction.senderAmount}</td>
                <td className="p-3 text-center">{transaction.recipientAmount}</td>
                <td className="p-3 text-center">{transaction.exchangeRate}</td>
             
                <td className="p-3">
                  <span
                    className={`p-1 px-2 rounded-xl w-fit inline-block ${
                      transaction.status === "SUCCESS"
                        ? "text-green-600 bg-green-100"
                        : "text-red-600 bg-red-100"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-[11px] ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Prev
        </button>
        <span className="px-4 py-2 text-[11px] bg-gray-100 rounded-lg">
          Page {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-4 py-2 rounded-lg text-[11px] bg-blue-500 text-white hover:bg-blue-600"
        >
          Next
        </button>
      </div>

 {/* Right Slide Modal */}
{selectedTransaction && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex">
    <div
      ref={modalRef}
      className="ml-auto bg-white w-full max-w-[500px] h-screen p-6 shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out"
    >
      <div className="flex justify-end items-center ">
  <button
    onClick={() => setSelectedTransaction(null)}
    className="text-gray-600 hover:text-black text-3xl font-medium"
  >
    ×
  </button>
</div>

      {selectedTransaction.status === "SUCCESS" ? (
        <Success transaction={selectedTransaction} />
      ) : (
        <Error transaction={selectedTransaction} />
      )}
    </div>
  </div>
)}


    </div>
  );
};

export default TransactionTable;



