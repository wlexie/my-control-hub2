"use client";

import CampaignLayout from "../components/CampaignLayout";
import CampaignOverview from "./CampaignOverview";

export default function CampaignSubmittedPage() {
  return (
    <CampaignLayout>
      <div className="px-4 sm:px-6 md:px-12 py-6">
        <div className=" dark:bg-gray-800 p-6 rounded-2xl">
          <CampaignOverview />
        </div>
      </div>
    </CampaignLayout>
  );
}
