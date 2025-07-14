"use client";

import { useEffect, useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import auth from "../../../hooks/Auth";

interface Role {
  roleKey: string;
  name: string;
}

// Assuming the post function returns the response body
interface ApiResponse {
    status: string;
    message: string;
}

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    firstName: string;
    lastName:string;
    email: string;
    department: string;
    phoneNumber: string;
    status: "active" | "pending";
    accountKey: string | null;
  } | null;
}

export default function AssignRoleModal({ isOpen, onClose, user }: AssignRoleModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 

  const { get, post } = auth();

  // Reset state on close or open
  useEffect(() => {
    if (!isOpen) {
      setSelectedRole(null);
      setIsSubmitting(false);
      setError(null);
      setSuccessMessage(null); 
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await get<Role[]>('/role/roles');
        setRoles(data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setError("Failed to load roles");
      }
    };

    if (isOpen && user) {
      fetchRoles();
    }
  }, [isOpen, user, get]);

  const handleSave = async () => {
    if (!selectedRole || !user?.accountKey) {
      setError("Please select a role");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // <-- 3. MODIFIED HANDLER
      const response = await post<ApiResponse>(`/account/assign/role`, null, {
        params: { accountKey: user.accountKey, roleKey: selectedRole.roleKey }
      });
      
      // Set the success message from the API response
      setSuccessMessage(response.message || "Role assigned successfully!");

      // Close the modal after a delay to show the message
      setTimeout(() => {
        onClose();
      }, 2000); // 2-second delay

    } catch (error: unknown) {
      console.error("Error assigning role:", error);
      let errorMessage = "Failed to assign role. Please try again.";
      if (typeof error === 'object' && error !== null) {
        const err = error as { response?: { data?: { message?: string } }, message?: string };
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      // We still want to stop the "Saving..." spinner, even during the success delay
      setIsSubmitting(false);
    }
  };


  if (!isOpen || !user) return null;

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getInitialsColor = (initials: string) => {
    const colors = [
      "bg-blue-100 text-blue-600", "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600", "bg-red-100 text-red-600",
      "bg-purple-100 text-purple-600", "bg-pink-100 text-pink-600",
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(user.firstName, user.lastName);
  const initialsColor = getInitialsColor(initials);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-start md:justify-end"
      onClick={onClose}
    >
      <div
        className={`
          bg-gray-100 shadow-lg relative transform transition-transform duration-3000 ease-in-out
          w-full mx-2 max-h-[100vh] rounded-t-xl
          md:w-2/7 md:h-screen md:rounded-t-none
          ${isOpen 
            ? 'translate-y-0 md:translate-x-0' 
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>

        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 pt-2 md:pt-0">
            <h2 className="text-xl font-semibold">Assign Role</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <IoCloseCircleOutline size={28} />
            </button>
          </div>

          {/* --- Message Area --- */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>
          )}
          {/* <-- 4. RENDER SUCCESS MESSAGE --> */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">{successMessage}</div>
          )}

          <div className="space-y-5 flex-1 overflow-y-auto pb-24">
            {/* ... (user details, department, etc. - no changes here) ... */}
            <div className="flex flex-col bg-white rounded-xl py-10 items-center">
              <div className={`p-4 py-5 rounded-full ${initialsColor} flex items-center justify-center mb-4`}>
                <span className="font-semibold text-4xl">{initials}</span>
              </div>
              <div className="text-center space-y-1 text-[#101820]">
                <h3 className="font-semibold text-2xl">{user.firstName} {user.lastName}</h3>
                <p className="text-lg font-medium">{user.phoneNumber}</p>
                <p className="text-sm font-normal text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="p-4 flex justify-between items-center mt-4 gap-x-4 bg-white rounded-xl">
              <h4 className="font-semibold text-base">Current Department</h4>
              <p className="text-yellow-600 bg-yellow-100 text-sm border border-yellow-200 rounded-md px-4 py-2">
                {user.department}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl relative">
              <h4 className="font-semibold text-base">Assign Role</h4>
              <div className="relative mt-3">
                <button 
                  className="text-sm w-full border bg-white text-gray-900 border-gray-400 rounded-md px-4 py-3 flex justify-between items-center cursor-pointer disabled:bg-gray-200"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={!!successMessage} // <-- 5. UPDATE BUTTON STATE
                >
                  <span>{selectedRole ? selectedRole.name : "Select a role"}</span>
                  <IoIosArrowDown className={`text-gray-500 text-xl transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {roles.length > 0 ? roles.map((role) => (
                      <div
                        key={role.roleKey}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleRoleSelect(role)}
                      >{role.name}</div>
                    )) : <div className="px-4 py-2 text-gray-500">No roles available</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-200">
            <div className="flex gap-4">
              <button
                className="w-full text-blue-500 hover:bg-blue-50 border border-blue-500 py-2.5 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={isSubmitting || !!successMessage} // <-- 5. UPDATE BUTTON STATE
              >Cancel</button>
              <button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-md font-semibold transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={isSubmitting || !selectedRole || !!successMessage} // <-- 5. UPDATE BUTTON STATE
              >{isSubmitting ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}