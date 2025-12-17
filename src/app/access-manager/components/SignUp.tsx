"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import api from "../../../utils/apiAuth";

/* ================= TYPES ================= */

interface ApiResponse {
  status: string;
  message: string;
  account_key?: string;
}

/* ================= SUCCESS POPUP ================= */

const SuccessPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  response: ApiResponse | null;
}> = ({ isOpen, onClose, response }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Request Submitted
        </h2>
        <p className="mb-2 text-gray-700">{response?.message}</p>

        {response?.account_key && (
          <p className="mb-4 text-sm text-gray-500">
            Account Key: <span className="font-medium">{response.account_key}</span>
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-4 rounded-lg bg-gray-800 px-6 py-2 text-white hover:bg-gray-900"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ================= SIGNUP COMPONENT ================= */

export default function Signup() {
  const [department, setDepartment] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const departments = [
    { value: "Tech", label: "Tech" },
    { value: "Finance", label: "Finance" },
    { value: "Customer Support", label: "Customer Support" },
    { value: "Compliance", label: "Compliance" },
  ];

  /* ================= HANDLERS ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleDepartmentSelect = (value: string) => {
    setDepartment(value);
    setIsDropdownOpen(false);
    if (error) setError(null);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setDepartment("");
  };

  /* ================= SUBMIT ================= */

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/account/save-system-user", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        department,
      });

      setApiResponse(response.data);

      if (response.data.status === "error") {
        setError(response.data.message);
      } else {
        setIsPopupOpen(true);
        resetForm();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen w-full bg-white font-poppins">
      {/* LEFT IMAGE */}
      <div className="relative hidden w-1/2 md:block">
        <Image
          src="/user-access/images/lady.png"
          alt="Person using a phone"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT FORM */}
      <div className="flex w-full flex-col justify-center space-y-6 overflow-y-auto p-8 md:w-1/2 md:p-20">
        <h2 className="flex items-center gap-3 text-3xl font-bold text-gray-800">
          <Image
            src="/user-access/images/logo.png"
            alt="Logo"
            width={35}
            height={30}
          />
          Control Hub
        </h2>

        <p className="text-2xl font-semibold text-gray-800">
          Request for Access
        </p>

        <p className="text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>

        <form className="space-y-4" onSubmit={handleRequestAccess}>
          {/* FIRST NAME */}
          <input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* LAST NAME */}
          <input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* PHONE */}
          <input
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          {/* DEPARTMENT */}
          <div className="relative">
            <div
              className="flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{department || "Select Department"}</span>
              <IoIosArrowDown
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow">
                {departments.map((dept) => (
                  <div
                    key={dept.value}
                    onClick={() => handleDepartmentSelect(dept.value)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {dept.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || !department}
            className="mt-4 w-full rounded-lg bg-gray-800 py-3 text-lg font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Request for Access"}
          </button>
        </form>
      </div>

      {/* SUCCESS POPUP */}
      <SuccessPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        response={apiResponse}
      />
    </div>
  );
}
