"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../utils/apiAuth'; // Adjust path if needed
import { IoCloseCircleOutline } from 'react-icons/io5';

// Define the type for the data returned by the API on creation
interface Role {
  roleKey: string;
  name: string;
}

// Props for the modal component
interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback to inform the parent component that a new role was created
  onRoleCreated: (newRole: Role) => void; 
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ isOpen, onClose, onRoleCreated }) => {
  const [roleName, setRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset state whenever the modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setRoleName('');
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!roleName.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Use the API middleware to make the POST request
      const response = await api.post<Role>('/role', { name: roleName.toUpperCase() });
      
      // Call the parent's callback function with the new role data
      onRoleCreated(response.data);
      
      setSuccessMessage(`Role "${response.data.name}" created successfully!`);

      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Error creating role:", err);
      let errorMessage = "Failed to create role. Please try again.";
      if (axios.isAxiosError(err)) {
        // Extract more specific error message from API if available
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 md:h-screen flex items-end md:items-start md:justify-end"
      onClick={onClose}
    >
      <div
        className={`bg-gray-100 shadow-lg relative transform transition-transform duration-300 ease-in-out w-full max-w-md mx-2 max-h-[100vh] rounded-t-xl md:h-screen md:rounded-t-none ${
          isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>

        <div className="p-4 md:p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 pt-2 md:pt-0">
            <h2 className="text-xl font-semibold">Create New Role</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <IoCloseCircleOutline size={28} />
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>}
          {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">{successMessage}</div>}

          <div className="flex-1">
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">
              Role Name
            </label>
            <input
              id="roleName"
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g., SUPERVISOR"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200"
              disabled={isSubmitting || !!successMessage}
            />
          </div>

          <div className="mt-auto p-4 bg-white border-t border-gray-200 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
            <div className="flex gap-4">
              <button
                className="w-full text-blue-500 hover:bg-blue-50 border border-blue-500 py-2.5 rounded-md font-semibold transition-colors disabled:opacity-50"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-md font-semibold transition-colors disabled:bg-blue-300"
                onClick={handleSave}
                disabled={isSubmitting || !roleName || !!successMessage}
              >
                {isSubmitting ? "Creating..." : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleModal;