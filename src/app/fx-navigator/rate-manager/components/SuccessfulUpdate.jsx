import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import closeIcon from '../../public/images/close.png';
import success from '../../public/images/success.png';

const SuccessfulUpdate = ({
  onClose,
  usdMarkup,
  gbpMarkup,
  eurMarkup,
  dateOfEffect,
}) => {
  const [successImageLoaded, setSuccessImageLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = require('../../public/images/success.png').default.src;
    img.onload = () => setSuccessImageLoaded(true);
  }, []);

  const parsedDate = dateOfEffect ? new Date(dateOfEffect) : null;
  const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate);

  return (
    <div className="fixed font-poppins inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white px-12 py-6 rounded-xl w-[33%] h-[calc(100vh*0.77)] relative">
        {/* Close Button */}
        <button className="absolute top-3 right-3" onClick={onClose}>
          <Image src={closeIcon} alt="Close Modal" width={30} height={30} />
        </button>

        {/* Success Icon (Wait for preload) */}
        {successImageLoaded ? (
          <Image
            src={success}
            alt="Success Icon"
            width={50}
            height={60}
            className="mx-auto mt-8"
          />
        ) : (
          <div className="mx-auto mt-8 w-[70px] h-[60px] bg-gray-200 animate-pulse"></div>
        )}

        <h2 className="text-2xl font-semibold text-center mb-2 mt-4">
          Tuma Markup
        </h2>
        <h2 className="text-2xl font-semibold text-center">
          Successfully Updated
        </h2>

        {/* Updated Markups */}
        <div className="text-center mt-10  mb-4">
          <p className="text-gray-900 text-2xl font-semibold">
            GBP - <span className="text-gray-500">{gbpMarkup}%</span>, USD -{' '}
            <span className="text-gray-500">{usdMarkup}%</span>, EUR -{' '}
            <span className="text-gray-500"> {eurMarkup}%</span>
          </p>
          <p className="mt-4 text-xl">
            <span className="mr-3 font-semibold">Date of Effect:</span>
            {isValidDate
              ? parsedDate.toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'No Date Selected'}
          </p>
        </div>

        <p className="text-[#808A92] mt-12 px-16 text-center text-xl mb-16">
          The changes have been applied to the destination currency.
        </p>

        {/* Close Button */}
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

export default SuccessfulUpdate;
