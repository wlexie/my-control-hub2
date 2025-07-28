"use client";

import { useEffect, useState } from "react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import api from "@/hooks/useApi";

// Chart config for customer categories
const chartConfig = {
  active: {
    label: "Active Customers",
    color: "#3b82f6", // Tailwind's blue-500
  },
  inactive: {
    label: "Inactive Customers",
    color: "#ef4444", // red-500
  },
  highNetWorth: {
    label: "High Net Worth",
    color: "#10b981", // green-500
  },
  dormant: {
    label: "Dormant Customers",
    color: "#f59e0b", // yellow-500
  },
} satisfies ChartConfig;

interface CustomerSegmentationData {
  totalCustomers: number;
  segmentation: {
    active: number;
    inactive: number;
    dormant: number;
    highNetWorth: number;
  };
}

const CustomerSegmentation = () => {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<CustomerSegmentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { get } = api();

  useEffect(() => {
    setMounted(true);
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await get<CustomerSegmentationData>(
        "https://api.tuma-app.com/api/analytics/client-segmentation"
      );
      setData(response);
    } catch (err) {
      setError("Failed to fetch customer segmentation data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Prepare chart data from API response
  const chartData = data
    ? [
        {
          category: "customers",
          active: data.segmentation.active,
          inactive: data.segmentation.inactive,
          highNetWorth: data.segmentation.highNetWorth,
          dormant: data.segmentation.dormant,
          totalCustomers: data.totalCustomers,
        },
      ]
    : [];

  // Prepare legend data
  const legendData = data
    ? [
        {
          label: chartConfig.active.label,
          value: data.segmentation.active,
          color: chartConfig.active.color,
        },
        {
          label: chartConfig.inactive.label,
          value: data.segmentation.inactive,
          color: chartConfig.inactive.color,
        },
        {
          label: chartConfig.highNetWorth.label,
          value: data.segmentation.highNetWorth,
          color: chartConfig.highNetWorth.color,
        },
        {
          label: chartConfig.dormant.label,
          value: data.segmentation.dormant,
          color: chartConfig.dormant.color,
        },
      ]
    : [];

  // Define chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;

  if (loading) {
    return <div>Loading customer segmentation data...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center gap-12">
        <h1 className="text-black font-semibold text-lg">
          Customer Segmentation
        </h1>
      </div>
      <div className="flex flex-col items-center w-full p-0">
        {/* Chart Container */}
        <div style={{ width: chartWidth, height: chartHeight }}>
          <ChartContainer
            config={chartConfig}
            style={{ width: chartWidth, height: chartHeight }}
          >
            <RadialBarChart
              data={chartData}
              endAngle={360}
              innerRadius={100}
              outerRadius={180}
              width={chartWidth}
              height={chartHeight}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-2xl font-extrabold"
                          >
                            {data.totalCustomers.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 8}
                            className="fill-muted-foreground font-medium"
                          >
                            Customers
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="active"
                stackId="a"
                cornerRadius={10}
                fill={chartConfig.active.color}
              />
              <RadialBar
                dataKey="inactive"
                stackId="a"
                cornerRadius={10}
                fill={chartConfig.inactive.color}
              />
              <RadialBar
                dataKey="highNetWorth"
                stackId="a"
                cornerRadius={10}
                fill={chartConfig.highNetWorth.color}
              />
              <RadialBar
                dataKey="dormant"
                stackId="a"
                cornerRadius={10}
                fill={chartConfig.dormant.color}
              />
            </RadialBarChart>
          </ChartContainer>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-4">
          {legendData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">
                {item.label}: {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentation;
