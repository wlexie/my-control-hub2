"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CardContent } from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { TrendingDown, TrendingUp, ChevronDown } from "lucide-react";
import useApi from "../../../hooks/useApi"; // Import your middleware hook

interface Props {
  startDate: Date;
  endDate: Date;
}

type ApiDataItem = {
  day: string;
  success: number;
  failed: number;
};

type ApiResponse = {
  daily: ApiDataItem[];
  totals: {
    thisWeek: {
      success: number;
      failed: number;
      failedPercent: number;
    };
    lastWeek: {
      success: number;
      failed: number;
      failedPercent: number;
    };
    changePercent: {
      success: number;
      failed: number;
      failedPercent: number;
    };
  };
};

const chartConfig = {
  successful: {
    label: "successful",
    color: "hsl(var(--chart-1))",
  },
  failed: {
    label: "failed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function TransactionStatuses({ startDate, endDate }: Props) {
  const api = useApi(); // Initialize your API middleware
  const [selectedChannel, setSelectedChannel] = useState("MPESA");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(0);
  const [changeFailed, setChangeFailed] = useState(0);

  const [chartData, setChartData] = useState<
    Array<{
      day: string;
      successful: number;
      failed: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalSuccess, setTotalSuccess] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);

  // Get current date and date from 7 days ago
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { startDate, endDate } = getDateRange();

        const response: ApiResponse = await api.get<ApiResponse>(
          `/analytics/weekly?startDate=${startDate}&endDate=${endDate}`
        );

        const transformedData = response.daily.map((item: ApiDataItem) => ({
          day: item.day.substring(0, 3), // "Sunday" → "Sun"
          successful: item.success,
          failed: item.failed,
        }));

        setChartData(transformedData);
        setChangeSuccess(response.totals.changePercent.success);
        setChangeFailed(response.totals.changePercent.failed);
        setTotalSuccess(response.totals.thisWeek.success);
        setTotalFailed(response.totals.thisWeek.failed);
        // You can also store lastWeek and changePercent if needed
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching data:", err);
        } else {
          setError("An unknown error occurred.");
          console.error("Unknown error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedChannel]);

  if (loading) {
    return (
      <div className="w-full max-w-full px-4 py-4 bg-white rounded-xl">
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-full px-4 py-4 bg-white rounded-xl">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 py-4 bg-white rounded-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-black font-semibold text-base sm:text-lg">
          Successful vs. Failed Transactions
        </h1>
        <div className="flex gap-2">
          {/* Channel Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 border bg-white px-3 py-1 rounded-md text-sm hover:bg-gray-50"
            >
              <span>{selectedChannel}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-10">
                {["MPESA", "Paybill", "Till", "Bank", "Card"].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedChannel === channel ? "bg-gray-100" : ""
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="rounded-md px-3 py-1 bg-blue-500 text-white text-sm">
            Weekly
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col sm:flex-row justify-start sm:items-center gap-4 sm:gap-8 mb-4">
        {/* Successful */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full" />
          <div className="text-sm text-black font-medium">{totalSuccess}</div>
          <span className="flex bg-red-100 text-red-600 text-xs font-medium rounded-full px-2 py-0.5 items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            {Math.abs(changeSuccess)}%
          </span>
          <span className="text-gray-400 text-xs">Compared to Last Week</span>
        </div>

        {/* Failed */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          <div className="text-sm text-black font-medium">{totalFailed}</div>
          <span className="flex bg-green-100 text-green-600 text-xs font-medium rounded-full px-2 py-0.5 items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {Math.abs(changeFailed)}%
          </span>
          <span className="text-gray-400 text-xs">Compared to Last Week</span>
        </div>
      </div>

      {/* Scrollable Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <CardContent className="pb-0">
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="successful"
                  fill="#3b82f6"
                  radius={4}
                  barSize={24}
                />
                <Bar dataKey="failed" fill="#ef4444" radius={4} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
