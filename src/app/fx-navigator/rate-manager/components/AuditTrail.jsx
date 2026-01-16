import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import api from '../../../../utils/apiService';
import { ChevronDown, Download, Calendar, RefreshCcw } from 'lucide-react';

export default function AuditTrail() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);
  
  // Date Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const recordsPerPage = 15;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetching records. Size 1000 for export/filtering purposes.
        const response = await api.get('/treasury/currency-exchange-history?page=0&size=1000');
        const responseData = response.data || response;

        const transformedData = responseData.map(item => {
          const dateOfEffectObj = new Date(item.dateOfEffect);
          const createdAtObj = new Date(item.createdAt);

          // Adjust for EAT timezone (UTC+3)
          dateOfEffectObj.setHours(dateOfEffectObj.getHours() + 3);
          createdAtObj.setHours(createdAtObj.getHours() + 3);

          const formatTime24h = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

          const createdDateString = createdAtObj.toISOString().split('T')[0];
          const createdTimeString = formatTime24h(createdAtObj);

          // Each API item contains 3 channel rates; we split them into 3 rows
          const sharedProps = {
            currencyPair: `${item.baseCurrency}/${item.targetCurrency}`,
            interbankRate: item.interbankRate?.toFixed(2) || 'N/A', // FIXED: Now included
            createdDate: createdDateString,
            createdTime: createdTimeString,
            updatedBy: item.changedBy,
            timestamp: dateOfEffectObj.getTime(),
            rawDate: createdAtObj // Used for date filtering
          };

          return [
            { ...sharedProps, id: item.id + '_mpesa', channel: 'M-Pesa', finalRate: item.mpesaRate?.toFixed(2) || 'N/A', markup: item.mpesaMarkUp?.toFixed(2) || 0.00, weightedAvg: item.mpesaWeightedAvg?.toFixed(2) || 'N/A' },
            { ...sharedProps, id: item.id + '_paybill', channel: 'Paybill', finalRate: item.paybillRate?.toFixed(2) || 'N/A', markup: item.paybillMarkUp?.toFixed(2) || 0.00, weightedAvg: item.paybillWeightedAvg?.toFixed(2) || 'N/A' },
            { ...sharedProps, id: item.id + '_bank', channel: 'Bank', finalRate: item.bankRate?.toFixed(2) || 'N/A', markup: item.bankMarkUp?.toFixed(2) || 0.00, weightedAvg: item.bankWeightedAvg?.toFixed(2) || 'N/A' }
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
  }, []);

  // Filter Logic: Filters the records based on selected dates
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!startDate && !endDate) return true;
      
      const recordDate = record.createdDate; // Format: YYYY-MM-DD
      
      if (startDate && endDate) {
        return recordDate >= startDate && recordDate <= endDate;
      } else if (startDate) {
        return recordDate === startDate; // If only one date picked, treat as "Specific Day"
      }
      return true;
    });
  }, [records, startDate, endDate]);

  const handleExport = () => {
    const headers = [
      'Currency Pair', 'Channel', 'Interbank Rate', 'Final Rate', 
      'Markup (%)', 'Weighted Avg', 'Date of Update', 'Time of Update', 'Updated By'
    ];

    const dataToExport = filteredRecords.map(record => [
      record.currencyPair, record.channel, record.interbankRate, record.finalRate,
      record.markup, record.weightedAvg, record.createdDate, record.createdTime, record.updatedBy
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataToExport]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AuditTrail');
    
    const columnWidths = headers.map((_, i) => ({
      wch: Math.max(headers[i].length, 15)
    }));
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `AuditTrail_${startDate || 'All'}_to_${endDate || 'Now'}.xlsx`);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  if (loading) return <div className="p-8 text-center font-poppins">Loading Audit Trail...</div>;
  if (error) return <div className="p-8 text-red-500 font-poppins">Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg w-full flex flex-col font-poppins">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Audit Trail</h1>
          <p className="text-xs text-gray-500">View and export historical exchange rate changes</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Pickers */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
            <Calendar size={16} className="text-gray-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}}
              className="bg-transparent text-sm outline-none focus:ring-0"
            />
            <span className="text-gray-400 text-xs font-bold">TO</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}}
              className="bg-transparent text-sm outline-none focus:ring-0"
            />
            {(startDate || endDate) && (
              <button onClick={clearFilters} className="ml-1 text-gray-400 hover:text-red-500">
                <RefreshCcw size={14} />
              </button>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Download size={16} />
            Export ({filteredRecords.length})
          </button>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden">
        <table className="w-full border-collapse text-sm">
          <tbody className="bg-white">
            {currentRecords.map((record) => (
              <React.Fragment key={record.id}>
                <tr className="border-b border-gray-200 cursor-pointer" onClick={() => setExpandedRowId(expandedRowId === record.id ? null : record.id)}>
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
                <tr className="bg-gray-50">
                  <td colSpan="3" className="p-0">
                    <div className={`overflow-hidden transition-all duration-300 ${expandedRowId === record.id ? 'max-h-96' : 'max-h-0'}`}>
                       <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
                          <div><p className="text-xs text-gray-500">Interbank:</p><p className="font-medium">{record.interbankRate}</p></div>
                          <div><p className="text-xs text-gray-500">Markup (%):</p><p className="font-medium">{record.markup}</p></div>
                          <div><p className="text-xs text-gray-500">Weighted Avg:</p><p className="font-medium">{record.weightedAvg}</p></div>
                          <div><p className="text-xs text-gray-500">Updated By:</p><p className="font-medium text-[10px]">{record.updatedBy}</p></div>
                       </div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left bg-gray-50 text-gray-500 text-[11px] uppercase">
              <th className="py-3 px-4 font-semibold">Currency Pair</th>
              <th className="py-3 px-4 font-semibold">Channel</th>
              <th className="py-3 px-4 font-semibold">Interbank Rate</th>
              <th className="py-3 px-4 font-semibold">Final Rate</th>
              <th className="py-3 px-4 font-semibold">Markup (%)</th>
              <th className="py-3 px-4 font-semibold">Weighted Avg</th>
              <th className="py-3 px-4 font-semibold">Date of Update</th>
              <th className="py-3 px-4 font-semibold">Time of Update</th>
              <th className="py-3 px-4 font-semibold">Updated By</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {currentRecords.length > 0 ? currentRecords.map((record) => (
              <tr key={record.id} className="text-left text-[12px] border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">{record.currencyPair}</td>
                <td className="py-2 px-4 text-gray-500">{record.channel}</td>
                <td className="py-2 px-4 font-semibold text-blue-700">{record.interbankRate}</td>
                <td className="py-2 px-4 font-semibold">{record.finalRate}</td>
                <td className="py-2 px-4">{record.markup}</td>
                <td className="py-2 px-4">{record.weightedAvg}</td>
                <td className="py-2 px-4">{record.createdDate}</td>
                <td className="py-2 px-4">{record.createdTime}</td>
                <td className="py-2 px-4 text-gray-600">{record.updatedBy}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="py-10 text-center text-gray-400">No records found for the selected dates.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm">
        <span className="text-gray-600 mb-4 md:mb-0">
          Showing {currentRecords.length} of {filteredRecords.length} records (Page {currentPage} of {totalPages || 1})
        </span>
        <div className="flex items-center space-x-2">
          <button onClick={() => paginate(1)} className="px-3 py-1.5 bg-gray-100 rounded-md disabled:opacity-30" disabled={currentPage === 1}>First</button>
          <button onClick={() => paginate(currentPage - 1)} className="px-3 py-1.5 bg-gray-100 rounded-md disabled:opacity-30" disabled={currentPage === 1}>Prev</button>
          <button onClick={() => paginate(currentPage + 1)} className="px-3 py-1.5 bg-gray-100 rounded-md disabled:opacity-30" disabled={currentPage === totalPages || totalPages === 0}>Next</button>
          <button onClick={() => paginate(totalPages)} className="px-3 py-1.5 bg-gray-100 rounded-md disabled:opacity-30" disabled={currentPage === totalPages || totalPages === 0}>Last</button>
        </div>
      </div>
    </div>
  );
}