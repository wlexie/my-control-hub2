import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../../utils/apiAuth';

const Terrapay = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('KES');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState('All');
  const [selectedInstrumentType, setSelectedInstrumentType] = useState('All');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        // Make sure your API endpoint correctly handles the 'currency' parameter for filtering
        const response = await api.get(`https://api.tuma-app.com/api/treasury/get-rates?currency=${currency}`);
        setRates(response.data);
      } catch (err) {
        setError('Failed to fetch Terrapay rates. Please check your network or API token.');
        console.error('Error fetching Terrapay rates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [currency]);

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    // Reset filters and search when currency changes
    setSearchTerm('');
    setSelectedTransactionType('All');
    setSelectedInstrumentType('All');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTransactionTypeChange = (e) => {
    setSelectedTransactionType(e.target.value);
  };

  const handleInstrumentTypeChange = (e) => {
    setSelectedInstrumentType(e.target.value);
  };

  // Memoize filtered rates to prevent re-computation on every render
  const filteredRates = useMemo(() => {
    return rates.filter(rate => {
      const matchesSearchTerm = Object.values(rate).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesTransactionType =
        selectedTransactionType === 'All' || rate.transactionType === selectedTransactionType;

      const matchesInstrumentType =
        selectedInstrumentType === 'All' || rate.instrumentType === selectedInstrumentType;

      return matchesSearchTerm && matchesTransactionType && matchesInstrumentType;
    });
  }, [rates, searchTerm, selectedTransactionType, selectedInstrumentType]);

  const groupedRates = useMemo(() => {
    return filteredRates.reduce((acc, rate) => {
      if (!acc[rate.receivingCurrency]) {
        acc[rate.receivingCurrency] = [];
      }
      acc[rate.receivingCurrency].push(rate);
      return acc;
    }, {});
  }, [filteredRates]);

  // Extract unique transaction and instrument types for filter options
  const uniqueTransactionTypes = useMemo(() => [
    'All',
    ...new Set(rates.map(rate => rate.transactionType))
  ], [rates]);

  const uniqueInstrumentTypes = useMemo(() => [
    'All',
    ...new Set(rates.map(rate => rate.instrumentType))
  ], [rates]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 max-h-[60vh] mt-4 rounded-2xl overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-xl font-extrabold text-gray-700">Terrapay Exchange Rates</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select
            value={currency}
            onChange={handleCurrencyChange}
            className="px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:border-blue-300"
          >
  <option value="KES">Kenyan Shilling (KES)</option>
  <option value="TZS">Tanzanian Shilling (TZS)</option>
  <option value="UGX">Ugandan Shilling (UGX)</option>
  <option value="MWK">Malawian Kwacha (MWK)</option>
  <option value="SSP">South Sudanese Pound (SSP)</option>
  <option value="GHS">Ghanaian Cedi (GHS)</option>
  <option value="ETB">Ethiopian Birr (ETB)</option>
  <option value="BIF">Burundian Franc (BIF)</option>
  <option value="RWF">Rwandan Franc (RWF)</option>
  <option value="ZAR">South African Rand (ZAR)</option>
  <option value="USD">US Dollar (USD) — Congo (DRC)</option>
  <option value="EUR">Euro (EUR)</option>
  <option value="GBP">British Pound (GBP)</option>
</select>

        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-6  rounded-lg mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search all rate details..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:border-blue-300 col-span-full md:col-span-1"
          />

          <select
            value={selectedTransactionType}
            onChange={handleTransactionTypeChange}
            className="px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:border-blue-300"
          >
            {uniqueTransactionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={selectedInstrumentType}
            onChange={handleInstrumentTypeChange}
            className="px-4 py-2 border border-gray-300 rounded-md  focus:outline-none focus:ring focus:border-blue-300"
          >
            {uniqueInstrumentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedTransactionType('All');
            setSelectedInstrumentType('All');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring focus:border-blue-300"
        >
          Reset Filters
        </button>
      </div>


      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-700">Loading rates...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">{error}</div>
      ) : (
        <>
          {Object.entries(groupedRates).length === 0 && (
            <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md text-center">
              No rates found matching your criteria. Try adjusting your search or filters.
            </div>
          )}
    {Object.entries(groupedRates).map(([currencyKey, currencyRates]) => (
  <div
    key={currencyKey}
    className="mb-10 p-4 bg-white  rounded-lg border border-gray-200 max-h-[60vh] overflow-y-auto"
  >

              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Rates for {currencyKey} ({currencyRates.length} items)
              </h2>

              <div className="overflow-x-auto"> {/* Use overflow-x-auto for horizontal scrolling on small screens */}
                <table className="min-w-full text-sm text-left border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700 sticky top-0"> {/* Sticky header */}
                    <tr>
                      <th className="px-4 py-2 border">FX Rate</th>
                      <th className="px-4 py-2 border">Transaction Type</th>
                      <th className="px-4 py-2 border">Instrument Type</th>
                      <th className="px-4 py-2 border">Scheme</th>
                      {/* Add more headers if your rate objects have more properties */}
                    </tr>
                  </thead>
                  <tbody>
                    {currencyRates.map((rate, index) => (
                      <tr key={index} className="hover:bg-blue-50">
                        <td className="px-4 py-2 border">{rate.fxRate}</td>
                        <td className="px-4 py-2 border">{rate.transactionType}</td>
                        <td className="px-4 py-2 border">{rate.instrumentType}</td>
                        <td className="px-4 py-2 border">{rate.scheme}</td>
                        {/* Add more data cells */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Terrapay;