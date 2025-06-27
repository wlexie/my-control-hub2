import React, { useState, useEffect } from 'react';
import api from '../../../../utils/apiService';
import { ChevronDown } from 'lucide-react'; // For the expand/collapse icon

export default function AuditTrail() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null); // State for mobile accordion
  const recordsPerPage = 15;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/treasury/currency-exchange-history?page=0&size=20');
        const responseData = response.data || response;

        const transformedData = responseData.map(item => {
          const dateOfEffectObj = new Date(item.dateOfEffect);
          const createdAtObj = new Date(item.createdAt);
  
          // Adjust for EAT timezone if needed
          dateOfEffectObj.setHours(dateOfEffectObj.getHours() + 3);
          createdAtObj.setHours(createdAtObj.getHours() + 3);
  
          const formatTime24h = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          
          const dateOfEffectString = dateOfEffectObj.toISOString().split('T')[0];
          const createdDateString = createdAtObj.toISOString().split('T')[0];
          const createdTimeString = formatTime24h(createdAtObj);
  
          return [
            { id: item.id + '_mpesa', currencyPair: `${item.baseCurrency}/${item.targetCurrency}`, channel: 'M-Pesa', finalRate: item.mpesaRate?.toFixed(2) || 'N/A', markup: item.mpesaMarkUp || 'N/A', weightedAvg: item.mpesaWeightedAvg?.toFixed(2) || 'N/A', createdDate: createdDateString, createdTime: createdTimeString, updatedBy: item.changedBy, timestamp: dateOfEffectObj.getTime() },
            { id: item.id + '_paybill', currencyPair: `${item.baseCurrency}/${item.targetCurrency}`, channel: 'Paybill', finalRate: item.paybillRate?.toFixed(2) || 'N/A', markup: item.paybillMarkUp || 'N/A', weightedAvg: item.paybillWeightedAvg?.toFixed(2) || 'N/A', createdDate: createdDateString, createdTime: createdTimeString, updatedBy: item.changedBy, timestamp: dateOfEffectObj.getTime() },
            { id: item.id + '_bank', currencyPair: `${item.baseCurrency}/${item.targetCurrency}`, channel: 'Bank', finalRate: item.bankRate?.toFixed(2) || 'N/A', markup: item.bankMarkUp || 'N/A', weightedAvg: item.bankWeightedAvg?.toFixed(2) || 'N/A', createdDate: createdDateString, createdTime: createdTimeString, updatedBy: item.changedBy, timestamp: dateOfEffectObj.getTime() }
          ];
        }).flat();
  
        transformedData.sort((a, b) => b.timestamp - a.timestamp);
  
        setRecords(transformedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch audit trail:', err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchData();
  },); // IMPORTANT: Fixed dependency array to prevent infinite API calls

  const handleRowClick = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const totalPages = Math.ceil(records.length / recordsPerPage);
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const currentRecords = records.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  if (loading) return <div className="p-4 bg-white rounded-lg ">Loading...</div>;
  if (error) return <div className="p-4 bg-white rounded-lg ">Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg w-full flex flex-col font-poppins ">
      <h1 className="text-xl font-bold ml-2 mb-4">Audit Trail</h1>

      {/* ===== MOBILE TABLE VIEW (Expandable Rows) ===== */}
      <div className="md:hidden">
        <table className="w-full border-collapse text-sm">
          <tbody className="bg-white">
            {currentRecords.map((record) => (
              <React.Fragment key={record.id}>
                {/* --- The main, visible row --- */}
                <tr 
                  className="border-b border-gray-200 cursor-pointer"
                  onClick={() => handleRowClick(record.id)}
                >
                  <td className="py-4 px-2">
                    <p className="font-semibold text-gray-800">{record.currencyPair}</p>
                    <p className="text-gray-500">{record.channel}</p>
                  </td>
                  <td className="py-4 px-2 text-right">
                     <p className="font-semibold text-gray-800">{record.finalRate}</p>
                     <p className="text-xs text-gray-500">{record.createdDate}</p>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedRowId === record.id ? 'rotate-180' : ''}`} />
                  </td>
                </tr>
                {/* --- The hidden, expandable row --- */}
                <tr className="bg-gray-50">
                  <td colSpan="3" className="p-0">
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedRowId === record.id ? 'max-h-96' : 'max-h-0'}`}>
                       <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <p className="text-xs text-gray-500">Markup (%):</p>
                            <p className="font-medium">{record.markup}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Weighted Avg:</p>
                            <p className="font-medium">{record.weightedAvg}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Time of Update:</p>
                            <p className="font-medium">{record.createdTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Updated By:</p>
                            <p className="font-medium">{record.updatedBy}</p>
                          </div>
                       </div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== DESKTOP TABLE VIEW (Full) ===== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left bg-gray-50 text-gray-500 text-[11px] uppercase">
              <th className="py-3 px-4 font-semibold">Currency Pair</th>
              <th className="py-3 px-4 font-semibold">Channel</th>
              <th className="py-3 px-4 font-semibold">Final Rate</th>
              <th className="py-3 px-4 font-semibold">Markup (%)</th>
              <th className="py-3 px-4 font-semibold">Weighted Avg</th>
              <th className="py-3 px-4 font-semibold">Date of Update</th>
              <th className="py-3 px-4 font-semibold">Time of Update</th>
              <th className="py-3 px-4 font-semibold">Updated By</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentRecords.map((record) => (
              <tr key={record.id} className="text-left text-[12px] border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-4 text-[12px] font-medium">{record.currencyPair}</td>
                <td className="py-2 px-4  text-gray-500">{record.channel}</td>
                <td className="py-2 px-4 ">{record.finalRate}</td>
                <td className="py-2 px-4 ">{record.markup}</td>
                <td className="py-2 px-4 ">{record.weightedAvg}</td>
                <td className="py-2 px-4 ">{record.createdDate}</td>
                <td className="py-2 px-4 ">{record.createdTime}</td>
                <td className="py-2 px-4 text-gray-600">{record.updatedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm">
        <span className="text-gray-600 mb-4 md:mb-0">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center space-x-2">
          <button onClick={() => paginate(1)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50" disabled={currentPage === 1}>First</button>
          <button onClick={() => paginate(currentPage - 1)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50" disabled={currentPage === 1}>Previous</button>
          <button onClick={() => paginate(currentPage + 1)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50" disabled={currentPage === totalPages}>Next</button>
          <button onClick={() => paginate(totalPages)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50" disabled={currentPage === totalPages}>Last</button>
        </div>
      </div>
    </div>
  );
}