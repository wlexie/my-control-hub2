import Image from 'next/image';
import closeIcon from '../../public/images/close.png';

const MultipleConfirmationModal = ({
  onClose,
  usdMarkup,
  gbpMarkup,
  eurMarkup,
  dateOfEffect,
  onSave,
}) => {
  // Convert dateOfEffect to a Date
  const parsedDate = dateOfEffect ? new Date(dateOfEffect) : null;

  // Check if parsedDate is a valid Date object
  const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate);
  return (
    <div className="fixed font-poppins inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-white px-12 py-6 rounded-xl w-[33%] h-[calc(100vh*0.77)] relative">
        {/* Close Button */}
        <button className="absolute top-3 right-3" onClick={onClose}>
          <Image src={closeIcon} alt="Close Modal" width={30} height={30} />
        </button>
 
        <h2 className="text-2xl mb-2 font-semibold mt-16 px-16 text-center">
          You've Set
        </h2>
        <h2 className="text-2xl font-semibold px-1 text-center mb-6">
          Tuma Markups as follows:
        </h2>

        <div className="flex justify-center  text-[16px]">
          <p className="mr-6 text-center">
            USD → <span className="text-gray-500">{usdMarkup}%,</span>
          </p>
          <p className="mr-6 text-center">
            GBP → <span className="text-gray-500">{gbpMarkup}%,</span>
          </p>
          <p className="text-center">
            EUR → <span className="text-gray-500">{eurMarkup}%</span>
          </p>
        </div>

        <div className="flex text-xl justify-center mt-4">
          <p className="mt-4">
            <span className="mr-3 font-semibold">Date of Effect:</span>
            <span className="text-gray-600">
              {isValidDate
                ? parsedDate.toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'No Date Selected'}
            </span>
          </p>
        </div>

        <p className="text-gray-500 text-center text-xl mt-16 px-6 mb-16">
          Confirm you want to proceed with applying these rates to all
          destination currencies?
        </p>

        {/* Buttons */}
        <div className="flex justify-between px-6">
          <button
            className="px-8 py-2 border-2 border-gray-800 text-xl font-semibold rounded-md hover:text-white hover:bg-gray-600"
            onClick={onClose}
          >
            Back
          </button>
          <button
            className="px-8 py-2 bg-gray-800 text-xl font-semibold text-white rounded-md hover:bg-gray-600"
            onClick={onSave}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultipleConfirmationModal;
