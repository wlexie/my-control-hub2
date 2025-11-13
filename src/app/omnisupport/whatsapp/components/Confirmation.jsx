import React from 'react';
import PropTypes from 'prop-types';

const Confirmation = ({ isOpen, onClose, onConfirm, title, children, confirmText = "Confirm" }) => {
  // If the modal is not set to be open, render nothing.
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop for the modal
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose} // Allows closing the modal by clicking the backdrop
    >
      {/* Modal Panel */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside it
      >
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{children}</p>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

Confirmation.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
};

export default Confirmation;