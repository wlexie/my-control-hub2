import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import api from '../../../../utils/apiService';
import { ChevronDown, Download, Calendar, RefreshCcw, Filter, Search, X } from 'lucide-react';

export default function AuditTrail() {
  const [records, setRecords] = useState([]);
  const [currencyPairs, setCurrencyPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);
  
  // Main Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPair, setSelectedPair] = useState('');

  // Dropdown UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pairSearchTerm, setPairSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  
  const recordsPerPage = 15;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Currency Pairs
        const pairsResponse = await api.get("/treasury/get-currency-pairs");
        const pairsData = pairsResponse.data || pairsResponse;
        
        const formattedPairs = Array.isArray(pairsData) 
          ? pairsData.map(p => `${p.baseCurrency}/${p.targetCurrency}`)
          : [];
        setCurrencyPairs(formattedPairs);

        // 2. Fetch Audit Trail Records
        const response = await api.get('/treasury/currency-exchange-history?page=0&size=1000');
        const responseData = response.data || response;

        const transformedData = responseData.map(item => {
          const dateOfEffectObj = new Date(item.dateOfEffect);
          const createdAtObj = new Date(item.createdAt);

          dateOfEffectObj.setHours(dateOfEffectObj.getHours() + 3);
          createdAtObj.setHours(createdAtObj.getHours() + 3);

          const formatTime24h = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          const createdDateString = createdAtObj.toISOString().split('T')[0];
          const createdTimeString = formatTime24h(createdAtObj);

          const sharedProps = {
            currencyPair: `${item.baseCurrency}/${item.targetCurrency}`,
            interbankRate: item.interbankRate?.toFixed(2) || '0.00',
            createdDate: createdDateString,
            createdTime: createdTimeString,
            updatedBy: item.changedBy,
            timestamp: dateOfEffectObj.getTime(),
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
        console.error('Failed to fetch data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Currency Pairs based on dropdown search field
  const filteredPairOptions = useMemo(() => {
    return currencyPairs.filter(pair => 
      pair.toLowerCase().includes(pairSearchTerm.toLowerCase())
    );
  }, [currencyPairs, pairSearchTerm]);

  // Main Audit Trail Filtering Logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesPair = !selectedPair || record.currencyPair === selectedPair;
      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = record.createdDate >= startDate && record.createdDate <= endDate;
      } else if (startDate) {
        matchesDate = record.createdDate === startDate;
      }
      return matchesPair && matchesDate;
    });
  }, [records, startDate, endDate, selectedPair]);

  const handleExport = () => {
    const headers = ['Currency Pair', 'Channel', 'Interbank Rate', 'Final Rate', 'Markup (%)', 'Weighted Avg', 'Date', 'Time', 'By'];
    const dataToExport = filteredRecords.map(r => [r.currencyPair, r.channel, r.interbankRate, r.finalRate, r.markup, r.weightedAvg, r.createdDate, r.createdTime, r.updatedBy]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataToExport]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AuditTrail');
    XLSX.writeFile(workbook, `AuditTrail_Export.xlsx`);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedPair('');
    setPairSearchTerm('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  if (loading) return <div className="p-8 text-center font-poppins">Loading...</div>;
  if (error) return <div className="p-8 text-red-500 font-poppins">Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg w-full flex flex-col font-poppins">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Audit Trail</h1>
          <p className="text-xs text-gray-500">Historical exchange rate changes</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* SEARCHABLE CUSTOM DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-2 bg-gray-50 h-10 px-3 rounded-md border border-gray-200 cursor-pointer min-w-[180px] hover:border-blue-400 transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Filter size={14} className="text-gray-400 shrink-0" />
                <span className="text-sm truncate">
                  {selectedPair || "Select Currency Pair"}
                </span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded-md shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
                {/* Search Field Inside Dropdown */}
                <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                  <Search size={14} className="text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search pair..."
                    className="w-full text-xs bg-transparent outline-none py-1"
                    value={pairSearchTerm}
                    onChange={(e) => setPairSearchTerm(e.target.value)}
                    autoFocus
                  />
                  {pairSearchTerm && (
                    <X size={12} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setPairSearchTerm('')} />
                  )}
                </div>
                
                {/* List of Pairs */}
                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                  <div 
                    onClick={() => {setSelectedPair(''); setIsDropdownOpen(false);}}
                    className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${!selectedPair ? 'bg-blue-100 font-bold text-blue-700' : ''}`}
                  >
                    All Pairs
                  </div>
                  {filteredPairOptions.length > 0 ? filteredPairOptions.map((pair, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {setSelectedPair(pair); setIsDropdownOpen(false); setCurrentPage(1);}}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 transition-colors ${selectedPair === pair ? 'bg-blue-100 font-bold text-blue-700' : ''}`}
                    >
                      {pair}
                    </div>
                  )) : (
                    <div className="px-3 py-4 text-xs text-gray-400 italic text-center">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date Range Pickers */}
          <div className="flex items-center gap-2 bg-gray-50 h-10 px-3 rounded-md border border-gray-200 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <input type="date" value={startDate} onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}} className="bg-transparent outline-none h-full" />
            <span className="text-gray-400 font-bold px-1">TO</span>
            <input type="date" value={endDate} onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}} className="bg-transparent outline-none h-full" />
            {(startDate || endDate || selectedPair) && (
              <button onClick={clearFilters} className="ml-1 text-gray-400 hover:text-red-500 transition-colors"><RefreshCcw size={14} /></button>
            )}
          </div>

          {/* Export Button */}
          <button onClick={handleExport} disabled={filteredRecords.length === 0} className="flex items-center gap-2 px-4 h-10 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
            <Download size={16} /> Export ({filteredRecords.length})
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead><tr className="text-left bg-gray-50 text-gray-500 text-[11px] uppercase"><th className="py-3 px-4 font-semibold">Currency Pair</th><th className="py-3 px-4 font-semibold">Channel</th><th className="py-3 px-4 font-semibold">Interbank Rate</th><th className="py-3 px-4 font-semibold">Final Rate</th><th className="py-3 px-4 font-semibold">Markup (%)</th><th className="py-3 px-4 font-semibold">Weighted Avg</th><th className="py-3 px-4 font-semibold">Date</th><th className="py-3 px-4 font-semibold">Time</th><th className="py-3 px-4 font-semibold">Updated By</th></tr></thead>
          <tbody className="bg-white">
            {currentRecords.length > 0 ? currentRecords.map((record) => (
              <tr key={record.id} className="text-left text-[12px] border-b border-gray-200 hover:bg-gray-50"><td className="py-2 px-4 font-medium">{record.currencyPair}</td><td className="py-2 px-4 text-gray-500">{record.channel}</td><td className="py-2 px-4 font-semibold text-blue-700">{record.interbankRate}</td><td className="py-2 px-4 font-semibold">{record.finalRate}</td><td className="py-2 px-4">{record.markup}</td><td className="py-2 px-4">{record.weightedAvg}</td><td className="py-2 px-4">{record.createdDate}</td><td className="py-2 px-4">{record.createdTime}</td><td className="py-2 px-4 text-gray-600">{record.updatedBy}</td></tr>
            )) : <tr><td colSpan="9" className="py-10 text-center text-gray-400 italic">No matching records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* MOBILE TABLE */}
      <div className="md:hidden">
        <table className="w-full border-collapse text-sm">
          <tbody className="bg-white">
            {currentRecords.map((record) => (
              <React.Fragment key={record.id}>
                <tr className="border-b border-gray-200" onClick={() => setExpandedRowId(expandedRowId === record.id ? null : record.id)}>
                  <td className="py-4 px-2"><p className="font-semibold text-gray-800">{record.currencyPair}</p><p className="text-gray-500">{record.channel}</p></td>
                  <td className="py-4 px-2 text-right"><p className="font-semibold text-gray-800">{record.finalRate}</p><p className="text-xs text-gray-500">{record.createdDate}</p></td>
                  <td className="py-4 px-2 text-right"><ChevronDown size={20} className={`text-gray-400 transition-transform ${expandedRowId === record.id ? 'rotate-180' : ''}`} /></td>
                </tr>
                {expandedRowId === record.id && (
                  <tr className="bg-gray-50"><td colSpan="3" className="p-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] text-gray-400 uppercase font-bold">Interbank</p><p className="font-medium text-blue-700">{record.interbankRate}</p></div><div><p className="text-[10px] text-gray-400 uppercase font-bold">Markup (%)</p><p className="font-medium">{record.markup}</p></div><div><p className="text-[10px] text-gray-400 uppercase font-bold">Weighted Avg</p><p className="font-medium">{record.weightedAvg}</p></div><div><p className="text-[10px] text-gray-400 uppercase font-bold">Updated By</p><p className="font-medium text-[10px]">{record.updatedBy}</p></div></div></td></tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm">
        <span className="text-gray-600 mb-4 md:mb-0">Showing {currentRecords.length} of {filteredRecords.length} results</span>
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