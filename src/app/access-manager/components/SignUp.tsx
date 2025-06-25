"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Popup from "./Popup"; // Make sure you have a corresponding Popup component
import axios from "axios";
import { IoIosArrowDown } from "react-icons/io";

// A placeholder for the Popup component if you don't have one.
// Replace this with your actual Popup component.
const PlaceholderPopup: React.FC<{ isOpen: boolean; onClose: () => void; response: any }> = ({ isOpen, onClose, response }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Success!</h2>
        <p className="mb-2">{response?.message}</p>
        {response?.account_key && <p className="text-sm text-gray-600 mb-4">Account Key: {response.account_key}</p>}
        <button onClick={onClose} className="px-4 py-2 bg-gray-800 text-white rounded">Close</button>
      </div>
    </div>
  );
};


export default function ControlHub() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [department, setDepartment] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<{
    status: string;
    message: string;
    account_key?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const departments = [
    { value: "Tech", label: "Tech" },
    { value: "Finance", label: "Finance" },
    { value: "Customer Support", label: "Customer Support" },
    { value: "Compliance", label: "Compliance" }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleDepartmentSelect = (value: string) => {
    setDepartment(value);
    setIsDropdownOpen(false);
    if (error) setError(null);
  };

  // 1. Create a function to reset the form's state.
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: ""
    });
    setDepartment("");
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const requestData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        department: department
      };
  
      const response = await axios.post(
        "https://auth.tuma-app.com/api/account/save-system-user",
        null,
        {
          params: requestData
        }
      );
  
      setApiResponse(response.data);
      
      if (response.data.status === "error") {
        setError(response.data.message);
      } else {
        setIsPopupOpen(true);
        // 2. Call the reset function on successful submission.
        resetForm();
      }
    } catch (err: unknown) {
      console.error("Error requesting access:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen w-full bg-white font-poppins">
      <div className="w-1/2 hidden md:block relative">
        <Image
          src="/user-access/images/lady.png"
          alt="A person looking at their phone"
          fill 
          className="object-cover" 
          priority 
        />
      </div>

      <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center space-y-6 overflow-y-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4">
          <Image src="/user-access/images/logo.png" alt="Logo" width={35} height={30} />
          Control Hub
        </h2>
        <p className="text-xl md:text-2xl font-semibold text-gray-800">
          Request for Access
        </p>
        <p className="text-gray-500 font-medium text-base">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline hover:text-blue-800 transition-colors">
            Login
          </Link>
        </p>

        <div className="w-full border-t border-gray-200"></div>

        <form className="space-y-4" onSubmit={handleRequestAccess}>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-600">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-600">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-600">
              Department <span className="text-red-500">*</span>
            </label>
            <div 
              className="mt-1 md:w-[250px] w-full px-3 py-2 border text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none flex justify-between items-center cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{department || "Select Department"}</span>
              <IoIosArrowDown className={`text-gray-500 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`} />
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {departments.map((dept, index) => (
                  <div key={`${dept.value}-${index}`}>
                    <div
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-base"
                      onClick={() => handleDepartmentSelect(dept.value)}
                    >
                      {dept.label}
                    </div>
                    {index !== departments.length - 1 && <hr className="border-gray-100" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !department || !formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber}
            className="w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold text-lg py-2.5 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Request for Access"}
          </button>
        </form>
      </div>
      
      {apiResponse?.status === "created" && (
        <PlaceholderPopup 
          isOpen={isPopupOpen} 
          onClose={() => setIsPopupOpen(false)} 
          response={apiResponse}
        />
      )}
    </div>
  );
}