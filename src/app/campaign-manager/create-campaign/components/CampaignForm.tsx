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
  const [rewardType, setRewardType] = useState("");
  const [codeType, setCodeType] = useState("");
  const [influencer, setInfluencer] = useState("");

  const handleClearForm = () => {
    setCampaignName("");
    setCampaignType("");
    setDescription("");
    setStartDate(null);
    setEndDate(null);
    setNoExpiry(false);
    setCodeName("");
    setRewardType("");
    setCodeType("");
    setInfluencer("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/campaign-manager/create-campaign/success");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white max-w-7xl mx-auto dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-md"
    >
      <h2 className="text-lg font-semibold mb-4">Campaign Basics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter campaign name"
          />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Campaign Type <span className="text-red-500">*</span>
          </label>
          <select
            value={campaignType}
            onChange={(e) => setCampaignType(e.target.value)}
            className="w-full h-10 px-3 pr-8 border rounded-lg bg-gray-100 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Select campaign type</option>
            <option value="discount">Discount campaign</option>
            <option value="gift">Gift vouchers</option>
            <option value="cashback">Cashback</option>
          </select>
          <MdKeyboardArrowDown className="absolute right-2 top-9 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {/* Short Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-500">
          Short Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter campaign description"
        />
      </div>

      {/* Timeframe */}
      <h2 className="text-lg font-semibold mb-4">Timeframe and Validity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
        {/* Start Date */}
        <div className="relative">
          <label
            className={`block text-sm font-medium mb-1 ${
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
            className={`w-full h-12 border rounded-lg px-3 pr-9 text-sm cursor-pointer 
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
            className={`block text-sm font-medium mb-1 ${
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
            className={`w-full h-12 border rounded-lg px-3 pr-9 text-sm cursor-pointer 
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
        <label className="text-sm font-medium">No Expiry</label>
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
      <h2 className="text-lg font-semibold mb-4">Code Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Code Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Code Name <span className="text-red-500">*</span>
          </label>
          <input
            value={codeName}
            onChange={(e) => setCodeName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter code name"
          />
        </div>
        {/* Reward Type */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Reward Type <span className="text-red-500">*</span>
          </label>
          <select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value)}
            className="w-full h-10 px-3 pr-8 border rounded-lg bg-gray-100 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Select reward type</option>
            <option value="discount">Discount on exchange rate</option>
          </select>
          <MdKeyboardArrowDown className="absolute right-2 top-9 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
        {/* Code Type */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Code Type <span className="text-red-500">*</span>
          </label>
          <select
            value={codeType}
            onChange={(e) => setCodeType(e.target.value)}
            className="w-full h-10 px-3 pr-8 border rounded-lg bg-gray-100 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Select code type</option>
            <option value="one-time">One-time per customer</option>
            <option value="multi">Multi-use</option>
          </select>
          <MdKeyboardArrowDown className="absolute right-2 top-9 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
        {/* Influencer */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Influencer Assignment <span className="text-red-500">*</span>
          </label>
          <select
            value={influencer}
            onChange={(e) => setInfluencer(e.target.value)}
            className="w-full h-10 px-3 pr-8 border rounded-lg bg-gray-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Choose influencer</option>
            <option value="azziad">Azziad Nasenya</option>
            <option value="khaligraph">Khaligraph Jones</option>
          </select>
          <MdKeyboardArrowDown className="absolute right-2 top-9 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          type="button"
          onClick={handleClearForm}
          className="h-12 px-6 rounded-lg bg-red-100 text-red-600 font-medium hover:bg-red-200"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="h-12 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          Launch Campaign
          <span>🚀</span>
        </button>
      </div>
    </form>
  );
}
