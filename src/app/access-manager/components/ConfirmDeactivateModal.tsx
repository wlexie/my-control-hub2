"use client";

import { IoCloseCircleOutline } from "react-icons/io5";

interface ConfirmDeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeactivating: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    department: string;
  } | null;
}

export default function ConfirmDeactivateModal({
  isOpen,
  onClose,
  onConfirm,
  isDeactivating,
  user,
}: ConfirmDeactivateModalProps) {
  if (!user) return null;

  const getInitials = (firstName: string, lastName:string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getInitialsColor = (initials: string) => {
    // UPDATED: Using an amber color scheme for the avatar
    const colors = [
      "bg-amber-100 text-amber-600",
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(user.firstName, user.lastName);
  const initialsColor = getInitialsColor(initials);

  return (
    // Modal Overlay
    <div
      className={`fixed inset-0 bg-opacity-45 bg-black/40 z-50 flex justify-end transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      {/* Sliding Panel */}
      <div
        className={`h-screen w-full md:w-2/6 bg-gray-100 shadow-lg transform transition-transform duration-300 ease-in-out relative ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Deactivate User</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <IoCloseCircleOutline size={28} />
            </button>
          </div>

          {/* Scrollable content area */}
          <div className="space-y-5 flex-1 overflow-y-auto pb-24">
            {/* User Info Card */}
            <div className="flex flex-col bg-white rounded-xl py-10 items-center">
              <div className={`p-4 py-5 rounded-full ${initialsColor} flex items-center justify-center mb-4`}>
                <span className="font-semibold text-4xl">{initials}</span>
              </div>
              <div className="text-center space-y-1 text-[#101820]">
                <h3 className="font-[600] text-[23px]">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-[18px] font-[500]">{user.phoneNumber}</p>
                <p className="text-sm text-[14px] font-[400]">{user.email}</p>
              </div>
            </div>

            {/* Department Info Card */}
            <div className="p-4 flex justify-between items-center mt-4 gap-x-4 bg-white rounded-xl">
              <h4 className="font-[600] text-[16px]">Current Department</h4>
              <p className="text-[#F1B80C] text-[15px] border border-[#F1B80C] rounded-md px-4 p-2">
                {user.department}
              </p>
            </div>

            {/* Confirmation Text Card */}
            <div className="p-6 bg-white rounded-xl border-l-4 border-amber-500">
              <h4 className="font-semibold text-lg text-amber-700">Confirm Deactivation</h4>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to deactivate this user? They will lose access to the system until reactivated.
              </p>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-7 bg-white border-t border-gray-200">
            <div className="flex gap-4">
              <button
                className="w-full text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 py-3 rounded-lg"
                onClick={onClose}
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg disabled:bg-amber-300"
                onClick={onConfirm}
                disabled={isDeactivating}
              >
                {isDeactivating ? "Deactivating..." : "Deactivate User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}