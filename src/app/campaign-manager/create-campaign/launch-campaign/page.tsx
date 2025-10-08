"use client";

import CampaignLayout from "../components/CampaignLayout";
import Image from "next/image";
import Link from "next/link";

export default function CampaignSubmittedPage() {
  return (
    <CampaignLayout>
      <div className="px-4 sm:px-6 md:px-12 relative z-10 flex justify-center mt-4">
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-4xl w-full text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/campaigns/launch.png"
              alt="Launch Campaign"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 You're about to Launch this Campaign
          </h1>

          <p className="text-gray-500 text-xl md:text-base max-w-md mx-auto mb-8">
            Once approved it will go live and be visible to the assigned
            influencer(s). This action cannot be undone. Confirm to proceed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <button className="px-6 py-3 rounded-lg text-xl bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition w-full sm:w-auto">
                Back to Dashboard
              </button>
            </Link>
            <Link href="/campaign-manager/create-campaign">
              <button className="px-6 py-3 rounded-lg bg-green-600 text-xl text-white font-medium hover:bg-green-700 transition w-full sm:w-auto">
                Launch Campaign
              </button>
            </Link>
          </div>
        </div>
      </div>
    </CampaignLayout>
  );
}
