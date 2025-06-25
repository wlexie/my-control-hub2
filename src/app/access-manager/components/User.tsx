"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  FiUser, 
  FiBell, 
  FiSettings, 
  FiChevronRight,
  FiLogOut
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials } from '../../../store/authSlice';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../store/store';

export default function User() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
 // const email = user?.email || '';
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    // Clear credentials from Redux store
    dispatch(clearCredentials());
    
    // Clear any persisted data
    localStorage.removeItem('persist:root'); // If using redux-persist
    sessionStorage.clear();
    
    // Optional: Call your API logout endpoint if needed
    // await axios.post('/api/auth/logout');
    
    // Redirect to login page
    router.push('/login');
    
    console.log('User logged out successfully');
  };

  return (
    <div className="relative ">
      <div
        className="flex cursor-pointer justify-between rounded-md bg-yellow p-2 py-1"
        onClick={handleModalToggle}
      >
        {/* User Initials and Name */}
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-blue-600 font-bold">
            {userInitials}
          </div>
          <span className="ml-3 text-lg hover:text-white font-medium">
            {firstName} {lastName}
          </span>
        </div>

        <div className="mr-1 flex items-center">
          <FiChevronRight className="rotate-90 text-white text-xl" />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="absolute md:left-28 left-24 -bottom-3 font-poppins transform translate-x-1/2 mb-2 bg-gray-100 text-gray-600 z-20 p-3 rounded-md w-48 shadow-xl"
          ref={modalRef}
        >
          {/* Modal Header */}
          <div className="flex items-center mb-3 pb-2 border-b">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
              {userInitials}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {firstName} {lastName}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {/* Account Button */}
            <button
              className="w-full flex items-center p-2 text-left hover:bg-gray-200 rounded-md text-sm"
              onClick={handleButtonClick}
            >
              <FiUser className="text-gray-600" size={16} />
              <span className="ml-2">Account</span>
            </button>

            {/* Notification Button */}
            <button
              className="w-full flex items-center p-2 text-left hover:bg-gray-200 rounded-md text-sm"
              onClick={handleButtonClick}
            >
              <FiBell className="text-gray-600" size={16} />
              <span className="ml-2">Notifications</span>
            </button>

            {/* Settings Button */}
            <button
              className="w-full flex items-center p-2 text-left hover:bg-gray-200 rounded-md text-sm"
              onClick={handleButtonClick}
            >
              <FiSettings className="text-gray-600" size={16} />
              <span className="ml-2">Settings</span>
            </button>

            {/* Logout Button */}
            <button
              className="w-full flex items-center p-2 text-left hover:bg-gray-200 rounded-md text-sm text-red-600"
              onClick={handleLogout}
            >
              <FiLogOut className="text-red-600" size={16} />
              <span className="ml-2">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}