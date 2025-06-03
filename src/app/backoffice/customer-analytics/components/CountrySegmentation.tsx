"use client";

import Image from "next/image";
import { Button } from "../../../../components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../../components/ui/popover";

const countries = [
  {
    name: "United Kingdom",
    customers: 42257,
    revenue: 81236.74,
    percent: 52,
    color: "#ef4444",
    flag: "/backoffice/uk-flag.png",
  },
  {
    name: "Kenya",
    customers: 22004,
    revenue: 20236.74,
    percent: 28,
    color: "#22c55e",
    flag: "/backoffice/kenya-flag.png",
  },
  {
    name: "Uganda",
    customers: 18871,
    revenue: 18236.74,
    percent: 12,
    color: "#facc15",
    flag: "/backoffice/ug-flag.png",
  },
  {
    name: "Tanzania",
    customers: 12257,
    revenue: 9236.74,
    percent: 8,
    color: "#0ea5e9",
    flag: "/backoffice/tz-flag.png",
  },
];

export function CountrySegmentationCard() {
  return (
    <div className="w-full bg-white rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-center px-4 md:px-8 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-black">
          Country Segmentation
        </h2>

        <Popover>
          <PopoverTrigger asChild>
            <Button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg">
              Monthly <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 text-sm">Yearly</PopoverContent>
        </Popover>
      </div>

      {/* Country Rows */}
      <div className="space-y-16 px-4 md:px-8">
        {countries.map((country) => (
          <div key={country.name} className="flex items-center justify-between">
            {/* Left: Flag, Name, Customers */}
            <div className="flex items-center gap-4">
              <Image
                src={country.flag}
                alt={country.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-sm md:text-base font-medium text-black">
                  {country.name}
                </p>
                <p className="text-xs md:text-sm text-gray-500">
                  Customers: {country.customers.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Center: Progress bar */}
            <div className="flex-1 mx-4">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${country.percent}%`,
                    backgroundColor: country.color,
                  }}
                ></div>
              </div>
            </div>

            {/* Right: Revenue + % */}
            <div className="text-right min-w-[90px]">
              <p className="text-sm md:text-base font-medium text-gray-800">
                £{country.revenue.toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {country.percent}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
