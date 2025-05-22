"use client";
import { usePathname } from "next/navigation";
import CurrencyDropdown from "./CurrencyDropdown";

const pathMap: Record<string, string> = {
  "/backoffice/dashboard": "Overview",
  "/backoffice/financial-metrics": "Financial Metrics & Revenue Performance",
  "/backoffice/customer-analytics": "Customer Analytics",
  "/backoffice/compliance-risk": "Compliance & Risk Management",
  "/backoffice/operational-efficiency": "Operational Efficiency",
};

function HeroSection() {
  const pathname = usePathname();
  const currentTitle = pathMap[pathname] || "Page";

  return (
    <div className="px-4 md:px-12 mt-4">
      {/* Breadcrumb */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-white/70">
          Dashboard / <span className="text-white">{currentTitle}</span>
        </p>
        <div className="text-white/70">
          <CurrencyDropdown />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
