import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import userImage from '../../../../public/omnisupport/images/user.png';
import logImage from '../../../../public/omnisupport/images/log.png';
import accountImage from '../../../../public/omnisupport/images/account.png';
import notificationImage from '../../../../public/omnisupport/images/notification.png';
import settingImage from '../../../../public/omnisupport/images/logout.png';
import {FiChevronRight} from 'react-icons/fi'; 

export default function User() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Close modal if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    // Add event listener for clicks outside
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle button clicks inside the modal to close it
  const handleButtonClick = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative font-poppins">
      <div
        className="flex cursor-pointer justify-between rounded-md  p-2 py-1"
        onClick={handleModalToggle}
      >
        {/* User Image and Placeholder Name */}
        <div className="flex items-center">
          <Image
            src={userImage}
            alt="User"
            width={40}
            height={30}
            className="rounded-full"
          />
          <span className="ml-3 text-lg font-medium">Shiqs Imani</span>
        </div>

        <div className="ml-1">
        <div className="mr-1 flex items-center">
          <FiChevronRight className="rotate-90 mt-2 text-white text-2xl font-medium" />
        </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="absolute md:left-28 left-6 -bottom-3 font-poppins transform translate-x-1/2 mb-2 bg-white border z-10 p-3 rounded-md md:w-48 w-32 shadow-lg"
          ref={modalRef}
        >
          {/* Modal Content */}
          <div className="flex items-center mb-1 border-b ">
            <Image
              src={userImage}
              alt="User"
              width={30}
              height={40}
              className="rounded-full mb-1"
            />
            <span className="ml-3 text-lg text-gray-600 font-medium">
              Shiqs Imani
            </span>
          </div>

          <div className="space-y-1">
            {/* Account Button */}
            <button
              className="w-full flex items-center p-2 text-left text-xs hover:bg-gray-50 rounded-md"
              onClick={handleButtonClick}
            >
              <Image src={accountImage} alt="Account" width={24} height={16} />
              <span className="ml-2 text-gray-600 text-lg">Account</span>
            </button>

            {/* Notification Button */}
            <button
              className="w-full flex items-center p-2 text-left text-xs hover:bg-gray-50 border-b mb-1 rounded-md"
              onClick={handleButtonClick}
            >
              <Image
                src={notificationImage}
                alt="Notification"
                width={22}
                height={16}
              />
              <span className="ml-2 text-gray-600 text-lg">Notification</span>
            </button>

            {/* Logout Button */}
            <button
              className="w-full flex items-center p-2 text-left text-xs hover:bg-gray-50 rounded-md"
              onClick={handleButtonClick}
            >
              <Image src={settingImage} alt="Settings" width={22} height={16} />
              <span className="ml-2 text-gray-600 text-lg">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
