import { ChevronRight } from 'lucide-react';

export default function Modal1({ closeModal, openEscalateModal, closeChat }) {
  return (
    <div className="fixed inset-0 flex justify-end bg-black bg-opacity-80 z-50">
      <div className="w-1/4 h-full bg-white font-poppins text-lg px-8 shadow-lg transform translate-x-full transition-transform duration-300 ease-in-out animate-slide-in">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-6 right-5 text-gray-600 hover:text-gray-800 border-2 border-gray-600 rounded-full px-2 font-semibold"
        >
          ✕
        </button>

        {/* Modal content */}
        <div className="p-6 mt-32">
          <ul className="space-y-4 text-gray-700">
            <li
              className="flex items-center border-y-2 py-3 cursor-pointer hover:text-blue-600"
              onClick={() => {
                closeChat();
                closeModal();
              }}
            >
              Close Chat
              <ChevronRight className="w-5 h-5 ml-auto" />
            </li>

            <li
              className="flex items-center border-b-2 pb-3 cursor-pointer hover:text-blue-600"
              onClick={openEscalateModal}
            >
              Escalate Issue
              <ChevronRight className="w-5 h-5 ml-auto" />
            </li>

            <li className="flex items-center cursor-pointer border-b-2 pb-3 hover:text-blue-600">
              Assign
              <ChevronRight className="w-5 h-5 ml-auto" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
