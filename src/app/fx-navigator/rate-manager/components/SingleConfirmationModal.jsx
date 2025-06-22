import React from 'react';
import Image from 'next/image';
import axios from 'axios';
import closeIcon from '../../public/images/close.png';

const SingleConfirmationModal = ({ form, onConfirm, onCancel, oncClose }) => {
  console.log('SingleConfirmationModal props:', { form, onConfirm, onCancel, oncClose });

  // Ensure the modal is being rendered
  if (!form) {
    return <div>Loading...</div>;
  }

const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 19); 
};


const buildPayload = (form) => ({
  baseCurrency: form.baseCurrency,
  targetCurrency: form.destinationCurrency,
  rate: parseFloat(form.finalRate), 
  manualExpiry: formatDate(form.dateOfEffect),
});
const handleConfirm = async () => {
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 19); 
  };

  const params = new URLSearchParams({
    baseCurrency: form.baseCurrency,
    targetCurrency: form.destinationCurrency,
    rate: form.finalRate,
    manualExpiry: formatDate(form.dateOfEffect),
  }).toString();

  const url = `https://tuma-dev-backend-alb-1553448571.us-east-1.elb.amazonaws.com/api/treasury/update-exchange-rate?${params}`;

  console.log('Request URL:', url);

  try {
    const response = await axios.put(url);
    console.log('Success:', response.data);
    onConfirm();
  } catch (error) {
    console.error(
      'Error updating exchange rate:',
      error.response ? error.response.data : error
    );
  }
};

  return (
    <div className="fixed font-poppins inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-white px-14 pt-6 rounded-xl w-[33%] h-[calc(100vh*0.77)] flex flex-col relative">
        <button className="absolute top-3 right-3" onClick={oncClose}>
          <Image src={closeIcon} alt="Close Modal" width={30} height={30} />
        </button>
        <h2 className="text-2xl font-semibold text-center mb-2 mt-8">
          You’ve Set
        </h2>

        <h2 className="text-2xl font-semibold text-center mb-4">
          Tuma Markup as follows:
        </h2>
        <ul className="text-center mt-8 mb-4">
          <li>
            <span className="font-semibold  text-xl">{form.baseCurrency}</span>{' '}
            →{' '}
            <span className="font-semibold text-xl">
              {form.destinationCurrency}
            </span>
          </li>
          <li className="my-2">
            <span className="mr-3 text-xl font-semibold">By:</span>{' '}
            <span className="text-xl text-gray-600">{form.markup}%</span>
          </li>
          <li className="text-xl">
            <span className="mr-3 font-semibold text-xl">Date of Effect:</span>
            <span className="text-gray-600">
              {form.dateOfEffect
                ? new Date(form.dateOfEffect).toISOString()
                : 'N/A'}
            </span>
          </li>
        </ul>
        <p className="text-center text-[#808A92] px-16 text-lg mt-14 mb-16">
          Confirm you want to proceed with applying these rates to the
          destination currency?
        </p>
        <div className="flex justify-between px-8">
          <button
            onClick={onCancel}
            className="px-8 py-2 border-2 border-gray-800 text-lg font-semibold rounded-md hover:text-white hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-gray-800 text-lg font-semibold text-white rounded-md hover:bg-gray-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleConfirmationModal;
