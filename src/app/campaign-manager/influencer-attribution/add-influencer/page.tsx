"use client";

import CampaignLayout from "../../create-campaign/components/CampaignLayout";
import AddInfluencer from "./AddInfluencer";

export default function CampaignSubmittedPage() {
  return (
    <CampaignLayout>
      <div className="px-4 sm:px-6 md:px-12 relative z-10 space-y-8">
        <div className=" dark:bg-gray-800 p-6 rounded-2xl ">
          <AddInfluencer />
        </div>
      </div>
    </CampaignLayout>
  );
}
