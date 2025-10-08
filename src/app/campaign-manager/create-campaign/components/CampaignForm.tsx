"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { MdKeyboardArrowDown } from "react-icons/md";
import DateFilter from "@/app/backoffice/components/DateFilter";

export default function CampaignForm() {
  const router = useRouter();

  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [noExpiry, setNoExpiry] = useState(false);

  const [codeName, setCodeName] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [rewardType, setRewardType] = useState("");
  const [codeType, setCodeType] = useState("");

  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);

  const influencers = [
    {
      id: "1",
      name: "Khaligraph Jones",
      username: "@khaligraph_jones",
      avatar:
        "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
    },
    {
      id: "2",
      name: "Azziad Nasenya",
      username: "@azziadnasenya",
      avatar:
        "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
    },
    {
      id: "3",
      name: "Kabii wa Jesus",
      username: "@kabiiwajesus",
      avatar:
        "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
    },
    {
      id: "4",
      name: "Ombachi Dennis",
      username: "@mr_ombachi",
      avatar:
        "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
    },
    {
      id: "5",
      name: "Baby Rue",
      username: "@rue.baby",
      avatar:
        "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
    },
    {
      id: "6",
      name: "Joy Kendi",
      username: "@joykendi",
      avatar:
        "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg",
    },
  ];

  const handleGenerateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    setUniqueCode(randomCode);
  };

  const handleInfluencerSelect = (id: string) => {
    setSelectedInfluencers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClearForm = () => {
    setCampaignName("");
    setCampaignType("");
    setDescription("");
    setStartDate(null);
    setEndDate(null);
    setNoExpiry(false);
    setCodeName("");
    setUniqueCode("");
    setRewardType("");
    setCodeType("");
    setSelectedInfluencers([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const campaignData = {
      campaignName,
      campaignType,
      description,
      startDate: startDate?.toLocaleDateString(),
      endDate: endDate?.toLocaleDateString(),
      noExpiry,
      codeName,
      uniqueCode,
      rewardType,
      codeType,
      influencers: selectedInfluencers,
    };

    // Save form data in sessionStorage (so we can read it in the overview page)
    sessionStorage.setItem("campaignData", JSON.stringify(campaignData));

    // Navigate to the overview page
    router.push("/campaign-manager/create-campaign/campaign-overview");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white max-w-8xl mx-auto p-8 rounded-2xl shadow-md"
    >
      {/* Campaign Basics */}
      <h2 className="text-xl font-semibold mb-4">Campaign Basics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Type <span className="text-red-500">*</span>
          </label>
          <select
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            className="w-full h-10 px-3 pr-8 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Select campaign type</option>
            <option value="Discount Campaign">Discount Campaign</option>
            <option value="Gift Vouchers">Gift Vouchers</option>
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-9 text-gray-400" />
        </div>
      </div>

      {/* Short Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Timeframe */}
      <h2 className="text-xl font-semibold mb-4">Timeframe and Validity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
        {/* Start Date */}
        <div className="relative">
          <label
            className={`block text-md font-medium mb-1 ${
              noExpiry ? "text-gray-400" : "text-gray-700"
            }`}
          >
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            readOnly
            value={
              startDate ? startDate.toLocaleDateString() : "Select start date"
            }
            onClick={() => !noExpiry && setShowStartPicker(true)}
            placeholder="Select start date"
            className={`w-full h-12 border rounded-lg px-3 pr-9 text-md cursor-pointer 
      ${noExpiry ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-gray-100 text-gray-800"}`}
            disabled={noExpiry}
          />
          <Calendar className="absolute right-3 top-[42px] w-4 h-4 text-gray-400 pointer-events-none" />
          {showStartPicker && (
            <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/30 overflow-y-auto p-4">
              <div className="p-4 rounded-xl max-w-lg w-full">
                <DateFilter
                  isOpen={showStartPicker}
                  onClose={() => setShowStartPicker(false)}
                  initialStartDate={startDate || new Date()}
                  initialEndDate={startDate || new Date()}
                  onChange={(start) => {
                    setStartDate(start);
                    setShowStartPicker(false);
                  }}
                  onClear={() => setStartDate(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* End Date */}
        <div className="relative">
          <label
            className={`block text-md font-medium mb-1 ${
              noExpiry ? "text-gray-400" : "text-gray-700"
            }`}
          >
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            readOnly
            value={endDate ? endDate.toLocaleDateString() : "Select end date"}
            onClick={() => !noExpiry && setShowEndPicker(true)}
            placeholder="Select end date"
            className={`w-full h-12 border rounded-lg px-3 pr-9 text-md cursor-pointer 
      ${noExpiry ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-gray-100 text-gray-800"}`}
            disabled={noExpiry}
          />
          <Calendar className="absolute right-3 top-[42px] w-4 h-4 text-gray-400 pointer-events-none" />
          {showEndPicker && (
            <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/30 overflow-y-auto p-4">
              <div className="p-4 rounded-xl max-w-lg w-full">
                <DateFilter
                  isOpen={showEndPicker}
                  onClose={() => setShowEndPicker(false)}
                  initialStartDate={endDate || new Date()}
                  initialEndDate={endDate || new Date()}
                  onChange={(_, end) => {
                    setEndDate(end);
                    setShowEndPicker(false);
                  }}
                  onClear={() => setEndDate(null)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No Expiry Toggle */}
      <div className="flex justify-end items-center gap-2 mb-6">
        <label className="text-md font-medium">No Expiry</label>
        <button
          type="button"
          onClick={() => setNoExpiry(!noExpiry)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            noExpiry ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              noExpiry ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Code Settings */}
      <h2 className="text-xl font-semibold mb-4">Code Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">
            Code Name <span className="text-red-500">*</span>
          </label>
          <input
            value={codeName}
            onChange={(e) => setCodeName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Unique Code ID
          </label>
          <input
            value={uniqueCode}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleGenerateCode}
            className="w-full h-10 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200"
          >
            Generate Code
          </button>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Reward Type <span className="text-red-500">*</span>
          </label>
          <select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value)}
            className="w-full h-10 px-3 pr-8 border rounded-lg bg-gray-100 appearance-none"
          >
            <option value="">Select reward type</option>
            <option value="Percentage of transaction value">
              Percentage of transaction value
            </option>
          </select>
          <MdKeyboardArrowDown className="absolute right-3 top-9 text-gray-400" />
        </div>
      </div>

      <div className="relative mb-6">
        <label className="block text-sm font-medium mb-1">
          Code Type <span className="text-red-500">*</span>
        </label>
        <select
          value={codeType}
          onChange={(e) => setCodeType(e.target.value)}
          className="w-full h-10 px-3 pr-8 border rounded-lg bg-gray-100 appearance-none"
        >
          <option value="">Select code type</option>
          <option value="One-time per customer">One-time per customer</option>
        </select>
        <MdKeyboardArrowDown className="absolute right-3 top-9 text-gray-400" />
      </div>

      {/* Influencer Assignment */}
      <h2 className="text-xl font-semibold mb-4">Influencer Assignment</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {influencers.map((inf) => (
          <div
            key={inf.id}
            onClick={() => handleInfluencerSelect(inf.id)}
            className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition ${
              selectedInfluencers.includes(inf.id)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <img
              src={inf.avatar}
              alt={inf.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-800">{inf.name}</p>
              <p className="text-sm text-gray-500">{inf.username}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleClearForm}
          className="h-12 px-6 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200 transition w-full sm:w-auto"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="h-12 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition w-full sm:w-auto"
        >
          Submit Campaign
        </button>
      </div>
    </form>
  );
}
