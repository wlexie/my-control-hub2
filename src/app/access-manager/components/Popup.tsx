import React from "react";
import Image from "next/image";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  response: {
    status: string;
    message: string;
    account_key?: string;
  };
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose, response }) => {
  // Show only if open AND response is success
  if (!isOpen || response.status !== "success") return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-30  flex justify-center items-center z-50 font-poppins">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute top-4 right-4"
        >
          <Image src="/images/close.png" alt="Close" width={40} height={40} />
        </button>

        {/* Tick Icon */}
        <div className="flex mt-8 justify-center">
          <Image src="/images/tick.png" alt="Success" width={60} height={60} />
        </div>

        <h2 className="text-2xl font-bold mx-8 text-gray-600 mt-7">
          Request Submitted Successfully
        </h2>

        <p className="text-gray-500 text-xl px-6 mt-5">{response.message}</p>

        {response.account_key && (
          <p className="mt-4 text-gray-800 font-semibold">
            Account Key: {response.account_key}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-10 border mb-5 font-normal py-2 text-xl px-8 text-gray-700 rounded-lg transition hover:bg-gray-500 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
