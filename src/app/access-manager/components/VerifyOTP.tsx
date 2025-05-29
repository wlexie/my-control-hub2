"use client";

import { useState, Suspense, useRef, useEffect } from "react"; // Added useRef, useEffect
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../store/authSlice"; // Verify path
import { jwtDecode } from "jwt-decode"; // Make sure to install this package

interface DecodedToken {
  exp: number;
  [key: string]: unknown;
}

const VerifyOTPContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create refs for inputs to manage focus programmatically
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = inputRefs.current.slice(0, otp.length);
    // Autofocus the first input field on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otp.length]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow multiple digits for paste, maxLength will handle UI

    const newOtp = [...otp];
    // If value is longer than 1 (e.g. from a paste event not caught by onPaste or browser autofill)
    // take only the first character for this input. The onPaste handler is preferred for multi-char.
    newOtp[index] = value.charAt(0);
    setOtp(newOtp);

    // Move focus to the next input if a digit was entered and it's not the last input
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
        // If current input has a value, clear it
        newOtp[index] = "";
        setOtp(newOtp);
        // Focus remains on current input after clearing it
      } else if (index > 0) {
        // If current input is empty and not the first, clear previous and focus it
        newOtp[index - 1] = ""; // Optionally clear previous
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
      .replace(/\D/g, "") // Remove non-digits
      .slice(0, otp.length); // Take only up to otp.length digits

    if (!pastedData) return;

    const newOtp = [...otp]; // Create a new array
    let currentFocusIndex = 0; // Keep track of where to focus next

    // Determine the starting index for pasting
    // This assumes the paste event target is one of the OTP inputs
    const targetInput = event.target as HTMLInputElement;
    const startIndex = inputRefs.current.indexOf(targetInput);

    if (startIndex === -1) {
      // Fallback if target is not in refs (should not happen)
      currentFocusIndex = 0;
    } else {
      currentFocusIndex = startIndex;
    }

    for (let i = 0; i < pastedData.length; i++) {
      if (currentFocusIndex + i < otp.length) {
        newOtp[currentFocusIndex + i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    // Determine where to focus after paste
    const lastFilledIndex = Math.min(
      currentFocusIndex + pastedData.length - 1,
      otp.length - 1
    );

    if (lastFilledIndex < otp.length - 1) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    } else {
      inputRefs.current[lastFilledIndex]?.focus(); // Focus the last filled input
    }
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
        { email: email, verificationCode: verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 && response.data.accessToken) {
        const decodedToken = jwtDecode<DecodedToken>(response.data.accessToken);
        const tokenExpiry = decodedToken.exp * 1000;
        dispatch(
          setCredentials({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            tokenExpiry: tokenExpiry,
          })
        );
        setError("");
        setIsVerified(true);
        router.push("/dashboard");
      } else {
        setError("Invalid OTP or unexpected response. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      let specificErrorMsg = "Invalid OTP. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        specificErrorMsg = err.response.data.message;
      }
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
          email
        )}`
      );
      if (typeof alert !== "undefined")
        alert("A new OTP has been sent to your email.");
    } catch (err) {
      let resendErrorMsg = "Failed to resend OTP. Please try again.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        resendErrorMsg = err.response.data.message;
      }
      if (typeof alert !== "undefined") alert(resendErrorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(() => setResendDisabled(false), 30000);
    }
  };

  if (isVerified) {
    return (
      <div className="flex min-h-screen font-poppins items-center justify-center bg-gray-100 text-green-600">
        <p className="text-2xl">OTP Verified Successfully! Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-poppins items-center justify-center bg-gray-100">
      <div className="w-full max-w-full overflow-hidden flex">
        <div className="w-1/2 relative">
          <Image
            src="/user-access/images/lady.png"
            alt="Verification"
            width={500}
            height={500}
            className="h-screen w-full object-cover"
            priority
          />
        </div>
        <div className="w-1/2 mt-32 px-24 pr-40">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 flex items-center gap-4">
            <Image
              src="/user-access/images/logo.png"
              alt="Logo"
              width={40}
              height={35}
            />
            Control Hub
          </h2>
          <h1 className="text-2xl text-gray-800 font-semibold mb-8">
            OTP Verification
          </h1>
          <p className="text-gray-400 font-medium text-lg mb-7">
            Enter the verification code we just sent to <br />
            <span className="font-medium text-gray-900 flex items-center">
              {email}
            </span>
          </p>
          <div className="w-full border-t border-gray-300 mb-10"></div>
          {error && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  // Assign ref
                  id={`otp-${index}`} // Keep ID for potential direct access if needed elsewhere
                  type="text" // Changed to text to better handle paste, pattern enforces numeric
                  inputMode="numeric"
                  pattern="\d{1}" // Ensures only a single digit visually (though JS handles more)
                  maxLength={1} // Still useful for user typing
                  className="w-14 h-14 sm:w-16 sm:h-16 border text-xl text-center border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={digit} // Use `digit` from map
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste} // Add the paste handler
                  autoComplete="one-time-code" // Good for OTP autofill from SMS/OS
                  required // Consider if each field should be required individually
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== otp.length} // Disable if OTP not fully entered
              className={`w-full mt-6 bg-gray-800 text-white font-semibold text-xl py-3 rounded-lg transition duration-300 ${
                isLoading || otp.join("").length !== otp.length
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-gray-900"
              }`}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </form>
          <p className="mt-6 text-center text-gray-500 text-lg">
            Did not receive the code?
            <button
              onClick={handleResendOTP}
              disabled={resendDisabled || isLoading}
              className="ml-2 text-blue-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendDisabled ? "Resending..." : "Resend"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const VerifyOTP = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-gray-700">
          Loading Verification...
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
};

export default VerifyOTP;
