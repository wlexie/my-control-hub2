"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { useEffect, useState } from "react";
import api from "../../../hooks/useApi";

type ApiResponse = {
  transactionVolume: {
    dayOfWeek: string;
    transactionCount: number;
  }[];
};

const dayAbbreviations: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

const weekDayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AreaGraph({
  dateRange,
}: {
  dateRange: { startDate: Date | null; endDate: Date | null };
}) {
  const [chartData, setChartData] = useState<{ day: string; number: number }[]>(
    []
  );
  const { get } = api();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "/transfer/get-partner-analytics";

        if (dateRange.startDate && dateRange.endDate) {
          const start = dateRange.startDate.toISOString().split("T")[0];
          const end = dateRange.endDate.toISOString().split("T")[0];
          url += `?startDate=${start}&endDate=${end}`;
        }

        const data = await get<ApiResponse>(url);

        const todayIndex = new Date().getDay();

        const transformedData = data.transactionVolume.map((item) => ({
          day: dayAbbreviations[item.dayOfWeek.toUpperCase()] || item.dayOfWeek,
          number: item.transactionCount,
        }));

        const fullWeekData = weekDayOrder.map((day, index) => {
          if (index > todayIndex) {
            return { day, number: 0 };
          }
          const found = transformedData.find((d) => d.day === day);
          return found ? found : { day, number: 0 };
        });

        setChartData(fullWeekData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [dateRange]);

  return (
    <Card className="bg-white">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-xl">Transaction Volume</CardTitle>
        <div className="text-sm text-black bg-gray-100 px-3 py-1 rounded-md">
          Weekly
        </div>
      </CardHeader>
      <CardContent className="pt-0 ">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              domain={[0, "dataMax + 5"]}
              tickCount={8}
              fill="#000"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
              fill="#000"
            />
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <Tooltip
              cursor={{ stroke: "gray", strokeWidth: 1 }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Area
              dataKey="number"
              type="monotone"
              stroke="#FFBF00"
              fill="#FFBF00"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default AreaGraph;
