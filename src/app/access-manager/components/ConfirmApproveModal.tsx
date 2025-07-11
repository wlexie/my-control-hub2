"use client";

import { IoCloseCircleOutline } from "react-icons/io5";

interface ConfirmApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isApproving: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    department: string;
  } | null;
}

export default function ConfirmApproveModal({
  isOpen,
  onClose,
  onConfirm,
  isApproving,
  user,
}: ConfirmApproveModalProps) {
  if (!user) return null;

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getInitialsColor = () => "bg-green-100 text-green-600";
  const initials = getInitials(user.firstName, user.lastName);
  const initialsColor = getInitialsColor();

  return (
    // Backdrop & Positioning Container
    <div
      className={`fixed inset-0 bg-black/40 z-50 flex items-end md:items-start md:justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      {/* Modal Panel - Responsive */}
      <div
        className={`
          bg-gray-100 shadow-lg relative transform transition-transform duration-300 ease-in-out
          
          // Mobile: Bottom Sheet
          w-full mx-2 max-h-[90vh] rounded-t-xl
          
          // Desktop: Side Panel
          md:w-2/6 md:h-screen md:rounded-t-none
          
          // Animation
          ${isOpen 
            ? 'translate-y-0 md:translate-x-0' 
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile-only "grabber" handle for UX */}
        <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>

        <div className="p-4 sm:p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pt-2 md:pt-0">
            <h2 className="text-xl font-semibold">Approve User</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <IoCloseCircleOutline size={28} />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="space-y-5 flex-1 overflow-y-auto pb-24">
            <div className="flex flex-col bg-white rounded-xl py-10 items-center">
              <div className={`p-4 py-5 rounded-full ${initialsColor} flex items-center justify-center mb-4`}>
                <span className="font-semibold text-4xl">{initials}</span>
              </div>
              <div className="text-center space-y-1 text-[#101820]">
                <h3 className="font-semibold text-2xl">{user.firstName} {user.lastName}</h3>
                <p className="text-lg font-medium">{user.phoneNumber}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center mt-4 gap-x-4 bg-white rounded-xl">
              <h4 className="font-semibold text-base">Current Department</h4>
              <p className="text-green-600 bg-green-100 text-sm border border-green-200 rounded-md px-4 py-2">
                {user.department}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border-l-4 border-green-500">
              <h4 className="font-semibold text-lg text-green-700">Confirm Approval</h4>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to approve this user? They will be granted access to the system.
              </p>
            </div>
          </div>

          {/* Sticky Footer with Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-200">
            <div className="flex gap-4">
              <button
                className="w-full text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 py-3 rounded-lg"
                onClick={onClose}
                disabled={isApproving}
              >Cancel</button>
              <button 
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg disabled:bg-green-300"
                onClick={onConfirm}
                disabled={isApproving}
              >{isApproving ? "Approving..." : "Approve User"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}