import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setCurrency } from '../redux/features/currencySlice';
import arrowIcon from '../../public/images/arrow.png';
import gbpFlag from '../../public/images/gbp.png';
import usdFlag from '../../public/images/usd.png';
import eurFlag from '../../public/images/eur.png';
import kesFlag from '../../public/flags/kenya.png';
import EditModal from './EditModal';

export default function Footer() {
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  const [exchangeRates, setExchangeRates] = useState({});
  const [exchangeRate, setExchangeRate] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const dispatch = useDispatch();

  useEffect(() => {
    fetchExchangeRates();
  }, [selectedCurrency]);

  useEffect(() => {
    fetchExchangeRate();
  }, [selectedCurrency]);


  const fetchExchangeRates = async () => {
    try {
      const targets = Object.keys(currencyDetails);
      const responses = await Promise.all(
        targets.map(async (target) => {
          let apiUrl = '';

          console.log(selectedCurrency);
  
          if ((selectedCurrency === 'USD' || selectedCurrency === 'GBP') && target === 'KES') {
            apiUrl = 'https://api.tuma-app.com/api/treasury/exchange-rate-list';
          } else {
            apiUrl = `https://api.transferwise.com/v1/rates?source=${selectedCurrency}&target=${target}`;

          }

          console.log(apiUrl)
  
          try {
            const response = await fetch(apiUrl, {
              headers: {
                Authorization: 'Bearer 4e8f4270-8d0e-46f2-a6a2-405029e49bca',
                Accept: 'application/json',
              },
            });
  
            if (!response.ok) {
              console.warn(`Exchange rate for ${target} is unavailable. Setting to 'N/A'.`);
              return { [target]: 'N/A' }; // Gracefully handle missing exchange rates
            }
  
            const data = await response.json();
            let exchangeRate = 'N/A';
  
            if ((selectedCurrency === 'USD' || selectedCurrency === 'GBP') && target === 'KES') {
              const filteredRate = data.find(
                (rate) => rate.baseCurrency === selectedCurrency && rate.targetCurrency === 'KES'
              );
              exchangeRate = filteredRate ? filteredRate.currentRate : 'N/A';
            } else {
              exchangeRate = Array.isArray(data) && data.length > 0 ? data[0].rate : 'N/A';
            }
  
            return { [target]: exchangeRate };
          } catch (error) {
            console.warn(`Error fetching data for ${target}:`, error);
            return { [target]: 'N/A' }; // If fetch fails, return 'N/A'
          }
        })
      );
  
      setExchangeRates(Object.assign({}, ...responses));
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };


  useEffect(() => {
    fetchExchangeRates();
    
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 3000); 
  
    return () => clearInterval(interval); 
  }, [selectedCurrency]);
  
  
  
  
  const fetchExchangeRate = async () => {
    try {
      const targets = Object.keys(currencyDetails);
      const responses = await Promise.all(
        targets.map(async (target) => {
          const apiUrl = `https://api.transferwise.com/v1/rates?source=${selectedCurrency}&target=${target}`;
  
          try {
            const response = await fetch(apiUrl, {
              headers: {
                Authorization: 'Bearer 4e8f4270-8d0e-46f2-a6a2-405029e49bca',
                Accept: 'application/json',
              },
            });
  
            if (!response.ok) {
              console.warn(`Exchange rate for ${target} is unavailable. Setting to 'N/A'.`);
              return { [target]: 'N/A' }; // Gracefully handle missing exchange rates
            }
  
            const data = await response.json();
            const exchangeRate = Array.isArray(data) && data.length > 0 ? data[0].rate : 'N/A';
  
            return { [target]: exchangeRate };
          } catch (error) {
            console.error(`Error fetching data for ${target}:`, error);
            return { [target]: 'N/A' }; 
          }
        })
      );
  
      setExchangeRate(Object.assign({}, ...responses));
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };
  
  

  const currencyDetails = {
    GBP: { flag: gbpFlag, fullName: 'British Pound' },
    USD: { flag: usdFlag, fullName: 'United States Dollar' },
    EUR: { flag: eurFlag, fullName: 'Euro' },
    KES: { flag: kesFlag, fullName: 'Kenyan Shilling' },
    TZS: { flag: '/flags/tanzania.png', fullName: 'Tanzanian Shilling' },
    BIF: { flag: '/flags/burundi.png', fullName: 'Burundian Franc' },
    CDF: { flag: '/flags/drc.png', fullName: 'Congolese Franc' },
    ETB: { flag: '/flags/ethiopia.png', fullName: 'Ethiopian Birr' },
    MWK: { flag: '/flags/malawi.png', fullName: 'Malawian Kwacha' },
    MZN: { flag: '/flags/mozambique.png', fullName: 'Mozambican Metical' },
    RWF: { flag: '/flags/rwanda.png', fullName: 'Rwandan Franc' },
    ZAR: { flag: '/flags/southafrica.png', fullName: 'South African Rand' },
    SSP: { flag: '/flags/southsudan.png', fullName: 'South Sudanese Pound' },
    UGX: { flag: '/flags/uganda.png', fullName: 'Ugandan Shilling' },
    ZMW: { flag: '/flags/zambia.png', fullName: 'Zambian Kwacha' },
    ZWL: { flag: '/flags/zimbabwe.png', fullName: 'Zimbabwean Dollar' },
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    setIsDropdownOpen(false);
  };

  const handleEditClick = (currency) => {
    const rates = exchangeRate[currency]; 
  
    setModalData({
      baseCurrency: selectedCurrency,
      destinationCurrency: currency,
      exchangeRate: rates, // Pass the correct rate
      markup: 0,
      finalRate: rates,
      dateOfEffect: '',
    });
  
    setIsModalOpen(true);
  };
  

  const totalPages = Math.ceil(
    Object.keys(currencyDetails).length / itemsPerPage
  );
  const paginatedCurrencies = Object.keys(currencyDetails).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Fix for closing dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <footer className="bg-white font-poppins rounded-lg py-6 px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold font-poppins text-lg">Exchange Rates</h1>

        <div className="flex items-center gap-4">
          <label className="font-medium text-sm text-gray-500">
            Base Currency
          </label>
          <div className="relative">
            <button
              className="flex items-center gap-2 pl-2 pr-2 py-1 border  border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggling dropdown here
            >
              <Image
                src={currencyDetails[selectedCurrency].flag}
                alt={`${selectedCurrency} flag`}
                width={25}
                height={20}
                className="rounded"
              />
              <span className="font-semibold text-lg">{selectedCurrency}</span>
              <Image
                src={arrowIcon}
                alt="Arrow"
                width={12}
                height={12}
                className="ml-6"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute mt-2 w-full bg-white border border-gray-300  text-sm rounded-md shadow-lg z-10 dropdown">
                <ul>
                  {['GBP', 'USD', 'EUR'].map((currency) => (
                    <li
                      key={currency}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCurrencyChange(currency)}
                    >
                      <Image
                        src={currencyDetails[currency].flag}
                        alt={`${currency} flag`}
                        width={24}
                        height={12}
                        className="rounded"
                      />
                      {currency}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 mb-2 border-t border-gray-300"></div>

{/* Table Header */}
<div className="flex items-center justify-between gap-2 font-semibold text-gray-600 text-sm  pb-2">
  <span className="w-[300px]"></span>
  <div className="flex items-center gap-6">
    <span className="w-[120px]   text-gray-400 text-center">Market Rate</span>
    <span className="w-[120px]  text-gray-400 text-center">Tuma Rate</span>
    <span className="w-[50px]"></span> {/* Empty space for Edit button */}
  </div>
</div>

<div className="space-y-7 font-medium">
  {paginatedCurrencies.map((currency) => (
    <div
      key={currency}
      className="flex items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2 w-[300px]">
        <Image
          src={currencyDetails[currency].flag}
          alt={`${currency} flag`}
          width={20}
          height={20}
          className="rounded"
        />
        <span className="font-medium text-lg text-gray-500">
          {currencyDetails[currency].fullName}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Market Rate */}
        <span className="px-4 bg-red-50  text-sm py-1 w-[110px] rounded text-center font-semibold text-red-400">
          {exchangeRate[currency] && !isNaN(exchangeRate[currency])
            ? Number(exchangeRate[currency]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : 'Loading...'}
        </span>

        {/* Tuma Rate */}
        <span className="px-4 bg-green-50 text-sm py-1 w-[110px] rounded text-center font-semibold text-green-600">
          {exchangeRates[currency] && !isNaN(exchangeRates[currency])
            ? Number(exchangeRates[currency]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : 'Loading...'}
        </span>

        {/* Edit Button */}
        <button 
          onClick={() => handleEditClick(currency)} 
          className="px-4 py-1 underline text-gray-500 rounded"
        >
          Edit
        </button>
      </div>
    </div>
  ))}
</div>


      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-14 ">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          &lt;
        </button>
        <span className="flex items-center text-sm justify-center px-4 py-1 bg-gray-200 rounded-md">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          &gt;
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
        >
          &gt;&gt;
        </button>
      </div>

      {isModalOpen && (
        <EditModal data={modalData} onClose={() => setIsModalOpen(false)} />
      )}
    </footer>
  );
}
