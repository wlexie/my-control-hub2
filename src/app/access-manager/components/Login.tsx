"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        `https://auth.tuma-app.com/api/auth/send-otp/${encodeURIComponent(email)}`
      );
  
      if (response.status === 200) {
        setNotification("An OTP has been sent to your email. Please verify.");
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
      console.error("OTP sending error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100">
      <div className="flex w-full">
        {/* Left Column: Image */}
        {/* "hidden" hides this on mobile. "lg:block" makes it visible on large screens (1024px+). */}
        <div className="relative hidden w-1/2 lg:block">
          <Image
            src="/user-access/images/lady.png"
            alt="Person using a computer"
            layout="fill"
            objectFit="cover"
            loading="lazy"
          />
        </div>

        {/* Right Column: Form */}
        {/* "w-full" makes this full-width on mobile. "lg:w-1/2" makes it half-width on large screens. */}
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2 sm:p-12">
          <div className="w-full max-w-md">
            <h2 className="mb-10 flex items-center gap-4 text-3xl font-bold text-gray-800 lg:text-4xl">
              <Image src="/user-access/images/logo.png" alt="Logo" width={40} height={35} />
              Control Hub
            </h2>
            <h1 className="mb-6 text-xl font-semibold text-gray-800 sm:text-2xl">
              Login to your account
            </h1>
            <p className="mb-8 text-base font-medium text-gray-500">
              Don't have an account?{" "}
              <Link href="/" className="text-blue-600 underline">
                Request for Access
              </Link>
            </p>

            {error && (
              <div className="mb-4 rounded bg-red-100 px-4 py-2 text-center text-red-800">
                {error}
              </div>
            )}

            {notification && (
              <div className="mb-4 rounded bg-green-100 px-4 py-2 text-center text-green-800">
                {notification}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                    <path d="M2 6l10 7 10-7" />
                  </svg>
                </div>

                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-lg bg-gray-800 py-3 text-lg font-semibold text-white transition duration-300 hover:bg-gray-900 ${
                  isLoading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {isLoading ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;