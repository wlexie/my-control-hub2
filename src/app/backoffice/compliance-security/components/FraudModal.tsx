// components/FraudModal.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface FraudData {
  seonId: string;
  state: string;
  fraudScore: number;
  version: string;
  appliedRules: {
    id: string;
    name: string;
    operation: string;
    score: number;
  }[];
  deviceDetails: {
    androidVersion: string;
    mobileDetails: {
      deviceName: string;
    };
    deviceIpAddress: string;
    deviceIpCountry: string;
    deviceIpIsp: string;
    vpnState: string;
    type: string;
  };
  ipDetails: {
    ip: string;
    country: string;
    stateProv: string;
    city: string;
    ispName: string;
    latitude: number;
    longitude: number;
    timezoneOffset: string;
    type: string;
  };
}

export default function FraudModal({
  isOpen,
  onClose,
  fraudReference,
}: {
  isOpen: boolean;
  onClose: () => void;
  fraudReference: string | null;
}) {
  const [data, setData] = useState<FraudData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFraudData = async () => {
      if (!isOpen || !fraudReference) return;

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.tuma-app.com/api/transfer/fraud-profile?fraudReference=${fraudReference}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching fraud data:", error);
        toast.error("Failed to load fraud data");
        onClose(); // Close modal on error
      } finally {
        setLoading(false);
      }
    };

    fetchFraudData();
  }, [isOpen, fraudReference, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Fraud Information</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading fraud data...</p>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Basic Info</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">SEON ID:</span>{" "}
                      {data.seonId}
                    </p>
                    <p>
                      <span className="font-medium">State:</span> {data.state}
                    </p>
                    <p>
                      <span className="font-medium">Fraud Score:</span>{" "}
                      {data.fraudScore}
                    </p>
                    <p>
                      <span className="font-medium">Version:</span>{" "}
                      {data.version}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Device Details</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Device OS:</span>{" "}
                      {data.deviceDetails?.type?.toUpperCase()}
                    </p>
                    <p>
                      <span className="font-medium">Device:</span>{" "}
                      {data.deviceDetails?.mobileDetails?.deviceName}
                    </p>
                    <p>
                      <span className="font-medium">Android Version:</span>{" "}
                      {data.deviceDetails?.androidVersion}
                    </p>
                    <p>
                      <span className="font-medium">IP Address:</span>{" "}
                      {data.deviceDetails?.deviceIpAddress}
                    </p>
                    <p>
                      <span className="font-medium">Country:</span>{" "}
                      {data.deviceDetails?.deviceIpCountry}
                    </p>
                    <p>
                      <span className="font-medium">ISP:</span>{" "}
                      {data.deviceDetails?.deviceIpIsp}
                    </p>
                    <p>
                      <span className="font-medium">VPN State:</span>{" "}
                      {data.deviceDetails?.vpnState}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Applied Rules</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">ID</th>
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Operation</th>
                        <th className="text-left py-2 px-4">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.appliedRules?.map((rule) => (
                        <tr key={rule.id} className="border-b">
                          <td className="py-2 px-4">{rule.id}</td>
                          <td className="py-2 px-4">{rule.name}</td>
                          <td className="py-2 px-4">{rule.operation}</td>
                          <td className="py-2 px-4">{rule.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">IP Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <span className="font-medium">IP:</span>{" "}
                      {data.ipDetails?.ip}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {data.ipDetails?.city}, {data.ipDetails?.stateProv},{" "}
                      {data.ipDetails?.country}
                    </p>
                    <p>
                      <span className="font-medium">Coordinates:</span>{" "}
                      {data.ipDetails?.latitude}, {data.ipDetails?.longitude}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">ISP:</span>{" "}
                      {data.ipDetails?.ispName}
                    </p>
                    <p>
                      <span className="font-medium">Timezone:</span>{" "}
                      {data.ipDetails?.timezoneOffset}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {data.ipDetails?.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p>No fraud data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
