import React, { useState, useEffect } from 'react';
import api from '../../../utils/apiService';

export default function AuditTrail() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/treasury/currency-exchange-history?page=0&size=20');
        
     
        const responseData = response.data || response; 
            console.log('Fetched raw data:', responseData); 

        
        const transformedData = responseData.map(item => {
          const dateOfEffectObj = new Date(item.dateOfEffect);
          const createdAtObj = new Date(item.createdAt);
  
          dateOfEffectObj.setHours(dateOfEffectObj.getHours() + 3);
          createdAtObj.setHours(createdAtObj.getHours() + 3);
  
          const formatTime24h = (date) => {
            return date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
          };
  
          const timeOfEffectString = formatTime24h(dateOfEffectObj);
          const dateOfEffectString = dateOfEffectObj.toISOString().split('T')[0];
          const createdDateString = createdAtObj.toISOString().split('T')[0];
          const createdTimeString = formatTime24h(createdAtObj);
  
          const channelRecords = [
            {
              id: item.id + '_mpesa',
              currencyPair: `${item.baseCurrency}/${item.targetCurrency}`,
              channel: 'M-Pesa',
              finalRate: item.mpesaRate?.toFixed(2) || '0.00',
              markup: item.mpesaMarkUp || '0',
              weightedAvg: item.mpesaWeightedAvg?.toFixed(2) || '0.00',
              dateOfEffect: dateOfEffectString,
              timeOfEffect: timeOfEffectString,
              createdDate: createdDateString,
              createdTime: createdTimeString,
              updatedBy: item.changedBy,
              timestamp: dateOfEffectObj.getTime()
            },
            {
              id: item.id + '_paybill',
              currencyPair: `${item.baseCurrency}/${item.targetCurrency}`,
              channel: 'Paybill',
              finalRate: item.paybillRate?.toFixed(2) || '0.00',
              markup: item.paybillMarkUp || '0',
              weightedAvg: item.paybillWeightedAvg?.toFixed(2) || '0.00',
              createdDate: createdDateString,
              createdTime: createdTimeString,
              updatedBy: item.changedBy,
              timestamp: dateOfEffectObj.getTime()
            },
            {
              id: item.id + '_bank',
              currencyPair: `${item.baseCurrency}/${item.targetCurrency}`,
              channel: 'Bank',
              finalRate: item.bankRate?.toFixed(2) || '0.00',
              markup: item.bankMarkUp || '0',
              weightedAvg: item.bankWeightedAvg?.toFixed(2) || '0.00',
              createdDate: createdDateString,
              createdTime: createdTimeString,
              updatedBy: item.changedBy,
              timestamp: dateOfEffectObj.getTime()
            }
          ];
  
          return channelRecords;
        }).flat();
  
        transformedData.sort((a, b) => b.timestamp - a.timestamp);
  
        setRecords(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch audit trail:', error);
        setError(error.message);
        setLoading(false);
      }
    };
  
    fetchData();
  }, );
  

  const totalPages = Math.ceil(records.length / recordsPerPage);
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

  if (loading) {
    return <div className="p-4 bg-white rounded w-full px-14 flex flex-col">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 bg-white rounded w-full px-14 flex flex-col">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded w-full px-6 flex flex-col">
      <h1 className="text-lg font-bold ml-6 mb-4 mt-6">Audit Trail</h1>

      <div className="flex-1 pb-6">
        <table className="w-full border border-gray-200 bg-white">
          <thead>
            <tr className="text-left bg-gray-50 text-gray-500 text-xs">
              <th className="py-2 px-4 border-b">Currency Pair</th>
              <th className="py-2 px-4 border-b">Channel</th>
              <th className="py-2 px-4 border-b">Final Rate</th>
              <th className="py-2 px-4 border-b">Markup (%)</th>
              <th className="py-2 px-4 border-b">Weighted Avg</th>
              <th className="py-2 px-4 border-b">Date of Update</th>
              <th className="py-2 px-4 border-b">Time of Update</th>
              <th className="py-2 px-4 border-b">Updated By</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record) => (
              <tr key={record.id} className="text-left border-b border-gray-200">
                <td className="py-2 px-4 text-[12px]">{record.currencyPair}</td>
                <td className="py-2 px-4 text-left text-gray-400 font-[600] text-[12px]">{record.channel}</td>
                <td className="py-2 px-4 text-[12px]">{record.finalRate}</td>
                <td className="py-2 px-4  text-[12px]">{record.markup}</td>
                <td className="py-2 px-4 text-[12px]">{record.weightedAvg}</td>
                <td className="py-2 px-4 text-[11px]">{record.createdDate}</td>
                <td className="py-2 px-4 text-[11px]">{record.createdTime}</td>
                <td className="py-2 px-4 text-left text-gray-400 font-[600] text-[12px]">{record.updatedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <div>
          <button
            onClick={() => paginate(1)}
            className="px-4 py-2 mx-1 bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
            disabled={currentPage === 1}
          >
            &lt;&lt; First
          </button>
          <button
            onClick={() => paginate(currentPage - 1)}
            className="px-4 py-2 mx-1 bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
            disabled={currentPage === 1}
          >
            &lt; Previous
          </button>
        </div>
        <span className="text-gray-700 font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <div>
          <button
            onClick={() => paginate(currentPage + 1)}
            className="px-4 py-2 mx-1 bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next &gt;
          </button>
          <button
            onClick={() => paginate(totalPages)}
            className="px-4 py-2 mx-1 bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Last &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}