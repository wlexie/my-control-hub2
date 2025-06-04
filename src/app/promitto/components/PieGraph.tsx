"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import api from "../../../hooks/useApi";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

// Colors for the chart
const COLORS = {
  CARD_TO_PAYBILL: "#F1B80C",
  CARD_TO_BANK: "#92BFFF",
};

const defaultChartData = [{ name: "Loading...", value: 100, fill: "#e2e8f0" }];

// Properly typed tooltip
const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload?.length) {
    const item = payload[0];
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <div className="font-medium">{item.name}</div>
        <div>KES {(item.value as number).toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

type ApiResponse = {
  revenueBreakdown: {
    transactionTypeName: string;
    totalAmount: number;
    percentage: number;
  }[];
};

export default function PieGraph() {
  const [chartData, setChartData] = useState(defaultChartData);
  const { get } = api();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: ApiResponse = await get<ApiResponse>(
          "/transfer/get-partner-analytics"
        );

        const transformed = data.revenueBreakdown.map((item) => ({
          name: formatType(item.transactionTypeName),
          value: item.totalAmount,
          fill:
            COLORS[item.transactionTypeName as keyof typeof COLORS] || "#ccc",
        }));

        setChartData(transformed);
      } catch (error) {
        console.error("Error loading chart:", error);
      }
    };

    fetchData();
  }, []);

  const formatType = (type: string) => {
    switch (type) {
      case "CARD_TO_PAYBILL":
        return "Mpesa";
      case "CARD_TO_BANK":
        return "Bank";
      default:
        return type;
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-xl font-semibold">
          Amount by Channel
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-[210px] flex justify-center items-center">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={40}
                outerRadius={80}
                stroke="#fff"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-4">
          {chartData.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-black">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.fill }}
              />
              <span>{item.name}</span>
              <span className="font-medium">
                KES {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
