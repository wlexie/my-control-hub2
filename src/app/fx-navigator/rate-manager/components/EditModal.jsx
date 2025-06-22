import React, { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrency } from '../redux/features/currencySlice';
import Image from 'next/image';
import gbpFlag from '../../public/images/gbp.png';
import usdFlag from '../../public/images/usd.png';
import eurFlag from '../../public/images/eur.png';
import arrowClose from '../../public/images/arrowclose.png';
import closeIcon from '../../public/images/close.png';
import kesFlag from '../../public/images/kes.png'; // Add KES flag
import SingleConfirmationModal from './SingleConfirmationModal';
import SuccessfulUpdateModal from './SuccessfulUpdateModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';

const currencyDetails = {
  GBP: { flag: gbpFlag, fullName: 'British Pound' },
  USD: { flag: usdFlag, fullName: 'United States Dollar' },
  EUR: { flag: eurFlag, fullName: 'Euro' },
  BIF: { flag: '/flags/burundi.png', fullName: 'Burundian Franc' },
  CDF: { flag: '/flags/drc.png', fullName: 'Congolese Franc' },
  ETB: { flag: '/flags/ethiopia.png', fullName: 'Ethiopian Birr' },
  MWK: { flag: '/flags/malawi.png', fullName: 'Malawian Kwacha' },
  MZN: { flag: '/flags/mozambique.png', fullName: 'Mozambican Metical' },
  RWF: { flag: '/flags/rwanda.png', fullName: 'Rwandan Franc' },
  ZAR: { flag: '/flags/southafrica.png', fullName: 'South African Rand' },
  SSP: { flag: '/flags/southsudan.png', fullName: 'South Sudanese Pound' },
  TZS: { flag: '/flags/tanzania.png', fullName: 'Tanzanian Shilling' },
  UGX: { flag: '/flags/uganda.png', fullName: 'Ugandan Shilling' },
  ZMW: { flag: '/flags/zambia.png', fullName: 'Zambian Kwacha' },
  ZWL: { flag: '/flags/zimbabwe.png', fullName: 'Zimbabwean Dollar' },
  KES: { flag: kesFlag, fullName: 'Kenyan Shilling' },
};

const EditModal = ({ data, onClose }) => {
  const [form, setForm] = useState(() => {
    if (data) {
      return {
        ...data,
        dateOfEffect: data.dateOfEffect
          ? new Date(data.dateOfEffect)
          : new Date(),
      };
    } else {
      // Fallback to default values if data is null,
      return {
        baseCurrency: '',
        destinationCurrency: '',
        exchangeRate: '',
        finalRate: '',
        markup: '',
        dateOfEffect: new Date(),
      };
    }
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessfulUpdate, setShowSuccessfulUpdate] = useState(false);
  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.currency);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };

    if (name === 'markup') {
      const markup = parseFloat(value) || 0;
      newForm.finalRate = (form.exchangeRate * (1 - markup / 100)).toFixed(2);
    } else if (name === 'finalRate') {
      const finalRate = parseFloat(value) || 0;
      newForm.markup = ((finalRate / form.exchangeRate - 1) * 100).toFixed(2);
    }

    setForm(newForm);
  };

  const handleDateChange = (date) => {
    // Convert the selected date to Kenyan time (UTC+3)
    const kenyanTime = new Date(date);
    kenyanTime.setHours(kenyanTime.getHours() + 3);
    setForm({ ...form, dateOfEffect: kenyanTime });
  };
  

  const handleUpdate = () => {
    if (
      !form.baseCurrency ||
      !form.destinationCurrency ||
      !form.exchangeRate ||
      !form.finalRate ||
      !form.dateOfEffect
    ) {
      alert('Please fill all required fields before updating.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleReset = () => {
    setForm(data);
  };

  const handleCancel = () => {
    console.log('Back clicked. Current form data:', form);
    setShowConfirmation(false);
    setForm(storeData);
  };

  const handleConfirmUpdate = () => {
    const updatedData = {
      baseCurrency: form.baseCurrency,
      destinationCurrency: form.destinationCurrency,
      exchangeRate: parseFloat(form.finalRate),
      markup: parseFloat(form.markup),
      dateOfEffect: form.dateOfEffect instanceof Date 
      ? form.dateOfEffect.toISOString()  
      : form.dateOfEffect,  
    };
  
  dispatch(setCurrency(updatedData));
  localStorage.setItem('currencyData', JSON.stringify(updatedData));
      localStorage.setItem('currencyData', JSON.stringify(updatedData));

    console.log('Data saved to store:', updatedData);

    setShowConfirmation(false);
    setShowSuccessfulUpdate(true);
  };

  useEffect(() => {
    const savedData = localStorage.getItem('currencyData');
    if (savedData) {
      setForm(JSON.parse(savedData));
    }
  }, []);

  const handleSuccessfulUpdateClose = () => {
    setShowSuccessfulUpdate(false);
    onClose();
  };

  const handlecCancel = () => {
    setShowConfirmation(false);
    setForm(storeData);
    onClose();
  };

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  if (!form) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    if (!data) {
      setForm({
        baseCurrency: '',
        destinationCurrency: '',
        exchangeRate: '',
        finalRate: '',
        markup: '',
        dateOfEffect: new Date(),
      });
    } else {
      setForm({
        ...data,
        dateOfEffect: data.dateOfEffect
          ? new Date(data.dateOfEffect)
          : new Date(),
      });
    }
  }, [data]);

  return (
    <div className="fixed font-poppins inset-0 bg-gray-600 bg-opacity-50 flex justify-center flex-col items-center z-10">
      <div className="bg-white px-14 pt-6 rounded-xl w-[33%] h-[calc(100vh*0.77)] flex flex-col relative">
        <button onClick={handlecCancel} className="absolute top-3 right-3">
          <Image src={closeIcon} alt="Close Modal" width={30} height={30} />
        </button>
        <h2 className="text-lg font-lufga text-center font-semibold mb-2">
          Edit Rate
        </h2>
        <div className="flex items-center text-xl font-semibold mb-4 justify-center">
          <span className="mx-2">{form.baseCurrency}</span>
          <Image
            src={arrowClose}
            alt="Arrow"
            width={16}
            height={12}
            className="mx-2"
          />
          <span className="mx-2">{form.destinationCurrency}</span>
        </div>

        <div className="mb-4 flex justify-between gap-4">
          <div className="flex-1 border px-4  rounded-md">
            <label className="block text-sm font-medium mt-1 text-gray-500 mb-1">
              Base Currency
            </label>
            <div className="flex items-center  gap-2">
              {currencyDetails[form.baseCurrency]?.flag ? (
                <Image
                  src={currencyDetails[form.baseCurrency]?.flag}
                  alt={`${form.baseCurrency} flag`}
                  width={20}
                  height={16}
                  className="rounded"
                />
              ) : (
                <span>No flag available</span>
              )}
              <span className="font-medium text-lg ml-3 ">
                {form.baseCurrency}
              </span>{' '}
              {/* Display currency code */}
            </div>
          </div>

          <div className="flex-1 border px-4 py-1 rounded-md">
            <label className="block text-sm truncate w-[145px] font-medium text-gray-500 mb-1">
              Destination Currency
            </label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src={currencyDetails[form.destinationCurrency]?.flag || ''}
                  alt={`${form.destinationCurrency} flag`}
                  width={20}
                  height={16}
                  className="rounded"
                />
                <span className="font-medium ml-3 text-lg">
                  {form.destinationCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 border px-4 py-1 rounded-md">
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Current Bank Rate
          </label>
          <div className="px-3 py-1 font-semibold text-sm rounded-md w-[120px] bg-red-50 text-red-400">
            {form.exchangeRate}
          </div>
        </div>

        <div className="mb-4 border px-4 py-1 rounded-md">
          <label className="block text-sm text-gray-500 font-medium mb-2">
            Tuma Markup
          </label>
          <div className="flex items-center justify-between">
            <input
              type="number"
              name="markup"
              value={form.markup}
              onChange={handleChange}
              className="border px-3 py-2 w-[40px] rounded-md flex-1 focus:border-gray-800 focus:border-2 focus:outline-none"
              placeholder="Enter percentage"
            />
            <span className="ml-32 mr-8 text-2xl text-gray-500">%</span>
          </div>
        </div>

        <div className="mb-4 border px-4 py-1 rounded-md">
          <label className="block text-sm text-gray-500 font-medium mb-2">
            Final Rate
          </label>
          <input
            type="text"
            name="finalRate"
            value={form.finalRate}
            onChange={handleChange}
            className="px-3 py-1 font-semibold text-sm  rounded-md w-[120px] placeholder:text-xs placeholder:px-0
           bg-green-50 text-green-800 focus:border-gray-800 focus:border-2 focus:outline-none"
            placeholder="Enter final rate"
          />
        </div>


 

        
      <div className=" ">
          <label className="block text-gray-600  text-sm font-medium mb-2">
            Date of Effect
          </label>
          <div className="relative">
          <FaCalendarAlt className="absolute left-3 top-1/2 text-sm transform -translate-y-1/2 text-gray-600 z-10 mr-2" />

          <DatePicker
            selected={form.dateOfEffect}
            onChange={handleDateChange}
            dateFormat="MMMM d, yyyy h:mm:ss aa" 
            minDate={new Date()}
            showTimeSelect 
            showSecond 
            timeFormat="HH:mm:ss" 
            className="pl-10 pr-4 border-2 border-gray-300 text-gray-500 text-lg rounded-md px-2 py-1 w-full focus:outline-none focus:border-gray-500"
          />

        </div>
      


        </div>
        <div className="flex justify-between px-12 gap-4 mt-auto mb-6">
          <button
            onClick={handleReset}
            className="px-12 py-1 text-lg border-2 border-gray-950 rounded-md"
          >
            Reset
          </button>
          <button
            onClick={handleUpdate}
            className="px-12 py-1 text-lg  bg-gray-950 font-semibold text-white rounded-md"
          >
            Update
          </button>
        </div>
      </div>

      {showConfirmation && (
        <SingleConfirmationModal
          form={form}
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancel}
          oncClose={handlecCancel}
        />
      )}

      {showSuccessfulUpdate && (
        <SuccessfulUpdateModal onClose={handleSuccessfulUpdateClose} />
      )}
    </div>
  );
};

export default EditModal;
