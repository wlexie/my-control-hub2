// This should be located at a path like `pages/verify-otp.tsx` or `app/verify-otp/page.tsx`

"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/authSlice"; // Make sure this path is correct
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie"; 

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

const VerifyOTPContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, otp.length);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otp.length]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.charAt(0);
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "")
      .slice(0, otp.length);
    if (!pastedData) return;

    const newOtp = [...otp];
    const targetInput = event.target as HTMLInputElement;
    const startIndex = inputRefs.current.indexOf(targetInput) ?? 0;

    for (let i = 0; i < pastedData.length; i++) {
      if (startIndex + i < otp.length) {
        newOtp[startIndex + i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    const lastFilledIndex = Math.min(
      startIndex + pastedData.length,
      otp.length - 1
    );
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const verificationCode = otp.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
                "https://auth.tuma-app.com/api/auth/email",

       // `${process.env.NEXT_PUBLIC_API_AUTH_URL}/auth/email`,
        { email, verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 && response.data.accessToken) {
        // ---- START: THE CORRECTED COOKIE-SETTING LOGIC ----

        // 1. SET THE COOKIE WITH A ROOT PATH
        Cookies.set("accessToken", response.data.accessToken, {
          expires: 1, // Expires in 1 day
          secure: process.env.NODE_ENV === "production", 
          path: "/", // <-- This is the important addition
        });

        // 2. UPDATE REDUX (This remains unchanged)
        const decodedToken = jwtDecode<DecodedToken>(response.data.accessToken);
        const tokenExpiry = decodedToken.exp * 1000;

        // ⬇Save expiry in cookie
        Cookies.set("accessTokenExpiry", tokenExpiry.toString(), {
          expires: 1, // same as accessToken
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
        dispatch(
          setCredentials({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            tokenExpiry,
          })
        );

        // ---- END: THE CORRECTED COOKIE-SETTING LOGIC ----

        setIsVerified(true);
        router.push("/dashboard"); // This will now work correctly
      } else {
        setError("Invalid OTP or unexpected response. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      const specificErrorMsg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Invalid OTP. Please try again.";
      setError(specificErrorMsg);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendDisabled(true);
    setError("");
    setIsLoading(true);
    try {
      await axios.post(
                `https://auth.tuma-app.com/api/auth/send-otp/${encodeURIComponent(

       // `${process.env.NEXT_PUBLIC_API_AUTH_URL}/auth/send-otp/${encodeURIComponent(
          email
        )}`
      );
      alert("A new OTP has been sent to your email.");
    } catch (err) {
      const resendErrorMsg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to resend OTP. Please try again.";
      alert(resendErrorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(() => setResendDisabled(false), 30000);
    }
  };

  if (isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 font-poppins">
        <p className="text-center text-xl font-medium text-green-600 md:text-2xl">
          OTP Verified Successfully! Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100">
      <div className="flex w-full">
        <div className="relative hidden w-1/2 lg:block">
          <Image
            src="/user-access/images/lady.png"
            alt="Verification"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="flex w-full items-center justify-center p-8 lg:w-1/2 sm:p-12">
          <div className="w-full max-w-md">
            <h2 className="mb-8 flex items-center justify-center gap-4 text-3xl font-bold text-gray-800 md:justify-start lg:text-4xl">
              <Image
                src="/user-access/images/logo.png"
                alt="Logo"
                width={40}
                height={35}
              />
              Control Hub
            </h2>
            <h1 className="mb-2 text-center text-xl font-semibold text-gray-800 md:text-left sm:text-2xl">
              OTP Verification
            </h1>
            <p className="mb-6 text-center text-gray-500 md:text-left">
              Enter the code sent to <br className="sm:hidden" />
              <span className="font-medium text-gray-900">{email}</span>
            </p>

            {error && (
              <div className="mb-4 rounded bg-red-100 px-4 py-2 text-center text-red-800">
                {error}
              </div>
            )}

            <form className="w-full space-y-6" onSubmit={handleSubmit}>
              <div className="flex justify-center gap-2 sm:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d{1}"
                    maxLength={1}
                    className="h-12 w-12 rounded-lg border border-gray-300 text-center text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 sm:h-14 sm:w-14"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    autoComplete="one-time-code"
                    required
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== otp.length}
                className={`w-full rounded-lg bg-gray-800 py-3 text-lg font-semibold text-white transition duration-300 ${
                  isLoading || otp.join("").length !== otp.length
                    ? "cursor-not-allowed opacity-70"
                    : "hover:bg-gray-900"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">
              Did not receive the code?
              <button
                onClick={handleResendOTP}
                disabled={resendDisabled || isLoading}
                className="ml-1 font-semibold text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendDisabled ? "Resending..." : "Resend"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// This wrapper handles the case where `useSearchParams` is used.
const VerifyOTP = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-700">
          Loading Verification...
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
};

export default VerifyOTP;
