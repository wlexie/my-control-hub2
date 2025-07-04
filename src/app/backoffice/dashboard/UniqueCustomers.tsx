"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type PaymentMethod = "All" | "MPESA" | "Paybill" | "Till" | "Card" | "Bank";

type ChartEntry = {
  name: string;
  value: number;
};

const fullData: Record<PaymentMethod, ChartEntry[]> = {
  All: [
    { name: "JAN", value: 1000 },
    { name: "FEB", value: 2500 },
    { name: "MAR", value: 2000 },
    { name: "APR", value: 2800 },
    { name: "MAY", value: 3500 },
    { name: "JUN", value: 1900 },
    { name: "JUL", value: 2700 },
    { name: "AUG", value: 3900 },
    { name: "SEP", value: 1100 },
    { name: "OCT", value: 1500 },
    { name: "NOV", value: 2600 },
    { name: "DEC", value: 2100 },
  ],
  MPESA: [
    { name: "JAN", value: 1000 },
    { name: "FEB", value: 2500 },
    { name: "MAR", value: 2000 },
    { name: "APR", value: 2800 },
    { name: "MAY", value: 3500 },
    { name: "JUN", value: 1900 },
    { name: "JUL", value: 2700 },
    { name: "AUG", value: 3900 },
    { name: "SEP", value: 1100 },
    { name: "OCT", value: 1500 },
    { name: "NOV", value: 2600 },
    { name: "DEC", value: 2100 },
  ],
  Paybill: [
    { name: "JAN", value: 1000 },
    { name: "FEB", value: 2500 },
    { name: "MAR", value: 2000 },
    { name: "APR", value: 2800 },
    { name: "MAY", value: 3500 },
    { name: "JUN", value: 1900 },
    { name: "JUL", value: 2700 },
    { name: "AUG", value: 3900 },
    { name: "SEP", value: 1100 },
    { name: "OCT", value: 1500 },
    { name: "NOV", value: 2600 },
    { name: "DEC", value: 2100 },
  ],
  Till: [
    { name: "JAN", value: 1000 },
    { name: "FEB", value: 2500 },
    { name: "MAR", value: 2000 },
    { name: "APR", value: 2800 },
    { name: "MAY", value: 3500 },
    { name: "JUN", value: 1900 },
    { name: "JUL", value: 2700 },
    { name: "AUG", value: 3900 },
    { name: "SEP", value: 1100 },
    { name: "OCT", value: 1500 },
    { name: "NOV", value: 2600 },
    { name: "DEC", value: 2100 },
  ],
  Card: [
    { name: "JAN", value: 1000 },
    { name: "FEB", value: 2500 },
    { name: "MAR", value: 2000 },
    { name: "APR", value: 2800 },
    { name: "MAY", value: 3500 },
    { name: "JUN", value: 1900 },
    { name: "JUL", value: 2700 },
    { name: "AUG", value: 3900 },
    { name: "SEP", value: 1100 },
    { name: "OCT", value: 1500 },
    { name: "NOV", value: 2600 },
    { name: "DEC", value: 2100 },
  ],
  Bank: [
    { name: "JAN", value: 1000 },
    { name: "FEB", value: 2500 },
    { name: "MAR", value: 2000 },
    { name: "APR", value: 2800 },
    { name: "MAY", value: 3500 },
    { name: "JUN", value: 1900 },
    { name: "JUL", value: 2700 },
    { name: "AUG", value: 3900 },
    { name: "SEP", value: 1100 },
    { name: "OCT", value: 1500 },
    { name: "NOV", value: 2600 },
    { name: "DEC", value: 2100 },
  ],
};

const paymentOptions = ["All", "MPESA", "Paybill", "Till", "Card", "Bank"];

export default function UniqueCustomersChart() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("All");

  const data = fullData[selectedMethod];

  return (
    <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-lg md:text-xl font-semibold text-black">
          Number of Unique Customers
        </h2>

        {/* Filters */}
        <div className="flex gap-3 mt-2 md:mt-0">
          {/* Mpesa Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button className="bg-[#f4f4f5] text-black text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium">
                {selectedMethod} <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-2">
              <ul className="space-y-1">
                {paymentOptions.map((option) => (
                  <li
                    key={option}
                    onClick={() => setSelectedMethod(option as PaymentMethod)}
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer rounded text-sm"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          {/* Yearly Filter */}
          <Button className="bg-blue-500 text-white text-sm px-4 py-1.5 rounded-lg font-medium">
            Yearly <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Subheader (Total + Comparison) */}
      <div className="flex items-center gap-3 text-sm text-gray-700">
        <span>Total No. of Unique Customers</span>
        <span className="text-black font-semibold">18,279</span>
        <span className="flex items-center bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-medium gap-1">
          <TrendingUp className="w-3 h-3" />
          56%
        </span>
        <span className="text-gray-400 text-xs">Compared to Last Year</span>
      </div>

      {/* Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
              formatter={(value) => value.toLocaleString()}
            />
            <Bar
              dataKey="value"
              fill="#fbbf24"
              barSize={25}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
