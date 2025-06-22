import React from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import closeIcon from '../../public/images/close.png';
import success from '../../public/images/success.png';

const SuccessfulUpdateModal = ({ onClose }) => {
  const updatedData = useSelector((state) => state.currency);

  return (
    <div className="fixed font-poppins inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-white px-14 pt-6 rounded-xl w-[33%] h-[calc(100vh*0.77)] flex flex-col relative">
        <button className="absolute top-3 right-3" onClick={onClose}>
          <Image src={closeIcon} alt="Close Modal" width={30} height={30} />
        </button>
        <Image
          src={success}
          alt="Success Icon"
          width={50}
          height={60}
          className="mx-auto mt-8"
        />

        <h2 className="text-2xl font-semibold text-center mb-2 mt-4">
          Tuma markup
        </h2>

        <h2 className="text-2xl font-semibold text-center">
          successfully updated
        </h2>
        <ul className="text-center mt-10 text-lg mb-4">
          <li className="text-2xl mb-3 text-gray-500">
            <span className="font-semibold">{updatedData.baseCurrency}</span> →{' '}
            <span className="font-semibold">
              {updatedData.destinationCurrency}
            </span>
          </li>
          <li>
            <p className="font-semibold text-xl text-gray-600">
              <span className="text-gray-900 mr-3 text-xl">
                Exchange Rate:
              </span>
              {updatedData.exchangeRate}
            </p>
          </li>
          <li className="my-2">
            <p className="font-semibold text-xl text-gray-600">
              <span className="mr-3 text-gray-900 font-semibold">Markup:</span>{' '}
              {updatedData.markup}%
            </p>
          </li>
          <li>
            <p>
              <span className="mr-3 font-semibold">Date of Effect:</span>
              <span className="text-gray-500 text-xl font-semibold">
                {updatedData.dateOfEffect
                  ? new Date(updatedData.dateOfEffect).toLocaleDateString()
                  : 'N/A'}
              </span>
            </p>
          </li>
        </ul>
        <p className="text-[#808A92] mt-8 px-12 text-center text-xl mb-12">
          The changes have been applied to the destination currency.
        </p>
        <div className="flex justify-center px-10">
          <button
            onClick={onClose}
            className="px-16 py-2 text-lg border-2 border-gray-600 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessfulUpdateModal;
