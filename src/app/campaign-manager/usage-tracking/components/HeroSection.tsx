"use client";

import { usePathname } from "next/navigation";
import CurrencyDropdown from "./CurrencyDropdown";

const pathMap: Record<string, string> = {
  "/campaign-manager/usage-tracking": "Code Expiry & Usage Tracking",
  "/campaign-manager/influencer-attribution": "Influencer Attribution",
  "/campaign-manager/create-campaign": "Create Campaign",
  "/campaign-manager/create-campaign/success": "Create Campaign",
};

interface HeroSectionProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
}

function HeroSection({ currency, onCurrencyChange }: HeroSectionProps) {
  const pathname = usePathname();
  const currentTitle = pathMap[pathname] || "Page";

  return (
    <div className="px-4 md:px-12 mt-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-white/70">
          Campaign Manager / <span className="text-white">{currentTitle}</span>
        </p>
        <div className="text-white/70">
          <CurrencyDropdown
            selectedCurrency={currency}
            onCurrencyChange={onCurrencyChange}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
