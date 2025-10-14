"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Influencer {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export default function CampaignOverview() {
  const params = useSearchParams();
  const router = useRouter();
  const campaignName = params.get("campaignName") || "New Sign Ups Promo";
  const campaignType = params.get("campaignType") || "Discount Campaign";
  const rewardType =
    params.get("rewardType") || "Percentage of transaction value";
  const codeType = params.get("codeType") || "One-time per customer";
  const codeName = params.get("codeName") || "AZZIADTUMA10";
  const uniqueCode = params.get("uniqueCode") || "819X";
  const startDate = params.get("startDate") || "12 September 2025";
  const endDate = params.get("endDate") || "12 December 2025";
  const description =
    params.get("description") ||
    "Reward new customers with a welcome discount on their first transfer. This campaign encourages fresh sign-ups, builds trust, and helps influencers attract more users with exclusive first-time benefits.";

  const createdDate = "05 October 2025";
  const createdTime = "12:06pm";

  const influencers: Influencer[] = [
    {
      id: "1",
      name: "Khaligraph Jones",
      username: "@khaligraph_jones",
      avatar: "https://cdn-icons-png.flaticon.com/512/4333/4333609.png",
    },
    {
      id: "2",
      name: "Kabii wa Jesus",
      username: "@kabiwajesus",
      avatar: "https://cdn-icons-png.flaticon.com/512/4333/4333609.png",
    },
    {
      id: "3",
      name: "Omobachi Dennis",
      username: "@mr_omobachi",
      avatar: "https://cdn-icons-png.flaticon.com/512/4333/4333609.png",
    },
  ];
  const handleSubmit = async () => {
    router.push("/campaign-manager/create-campaign/campaign-submitted");
  };
  const handleReject = () => {
    router.push("/campaign-manager/create-campaign/reject-campaign");
  };
  const handleLaunch = () => {
    router.push("/campaign-manager/create-campaign/launch-campaign");
  };
  return (
    <div className="w-full max-w-8xl mx-auto p-10 rounded-2xl ">
      {/* Title */}
      <h2 className="text-2xl font-semibold mb-10 text-gray-900">
        Campaign Overview
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6 mb-8">
        <div>
          <p className="text-gray-500 text-md mb-2">Campaign Name</p>
          <p className="font-semibold">{campaignName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-md   mb-2">Campaign Type</p>
          <p className="font-semibold">{campaignType}</p>
        </div>
        <div>
          <p className="text-gray-500 text-md mb-2">Reward Type</p>
          <p className="font-semibold">{rewardType}</p>
        </div>

        <div>
          <p className="text-gray-500 text-md mb-2">Code Type</p>
          <p className="font-semibold">{codeType}</p>
        </div>
        <div>
          <p className="text-gray-500 text-md mb-2">Start Date</p>
          <p className="font-semibold">{startDate}</p>
        </div>
        <div>
          <p className="text-gray-500 text-md mb-2">End Date</p>
          <p className="font-semibold">{endDate}</p>
        </div>

        <div>
          <p className="text-gray-500 text-md mb-2">Code Name</p>
          <p className="font-semibold">{codeName}</p>
        </div>
        <div>
          <p className="text-gray-500 text-md mb-2">Unique Code ID</p>
          <p className="font-semibold">{uniqueCode}</p>
        </div>
        <div>
          <p className="text-gray-500 text-md mb-2">Code Type</p>
          <p className="font-semibold">{codeType}</p>
        </div>

        <div>
          <p className="text-gray-500 text-md mb-2">Created by</p>
          <div className="flex items-center gap-3 mt-1">
            <img
              src="https://cdn-icons-png.flaticon.com/512/219/219983.png"
              alt="Linda Maina"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-semibold text-md">Linda Maina</p>
              <p className="text-gray-500 text-sm">lmaina@tuma.com</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-md  mb-2">Created on</p>
          <p className="font-semibold">{createdDate}</p>
        </div>

        <div>
          <p className="text-gray-500 text-md mb-2">Time</p>
          <p className="font-semibold">{createdTime}</p>
        </div>
      </div>

      {/* Influencers */}
      <div className="mb-10">
        <h3 className="text-gray-900 font-semibold mb-3">
          Influencer(s) Assigned
        </h3>
        <div className="flex flex-wrap gap-6">
          {influencers.map((inf) => (
            <div key={inf.id} className="flex items-center gap-2">
              <img
                src={inf.avatar}
                alt={inf.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-md font-medium">{inf.name}</p>
                <p className="text-sm text-gray-500">{inf.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="max-w-4xl mt-4">
        <h3 className="text-gray-900 font-semibold mb-2">Short Description</h3>
        <p className="text-gray-600 text-md leading-relaxed">
          {description ||
            "Reward new customers with a welcome discount on their first transfer. This campaign encourages fresh sign-ups, builds trust, and helps influencers attract more users with exclusive first-time benefits."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">
        <button
          onClick={handleReject}
          className="h-12 px-8 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition w-full sm:w-auto"
        >
          Reject Campaign
        </button>
        <button
          onClick={handleSubmit}
          className="h-12 px-8 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition w-full sm:w-auto"
        >
          Submit Campaign
        </button>
        <button
          onClick={handleLaunch}
          className="h-12 px-8 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition w-full sm:w-auto"
        >
          Launch Campaign
        </button>
      </div>
    </div>
  );
}
