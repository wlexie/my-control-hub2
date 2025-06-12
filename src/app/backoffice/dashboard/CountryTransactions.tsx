"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";

const chartData = [
  { route: "UK to Kenya", value: 150250 },
  { route: "Kenya to UK", value: 0 },
  { route: "UK to Tanzania", value: 0 },
];

const customColors = ["#367DFF", "#50B800", "#FBBF24"];

const generateChartDataAndConfig = (data: typeof chartData) => {
  const config: ChartConfig = {
    value: { label: "Value" },
  };

  const updatedData = data.map((item, index) => {
    const key = item.route.toLowerCase().replace(/\s+/g, "_");
    config[key] = {
      label: item.route,
      color: customColors[index % customColors.length],
    };
    return {
      ...item,
      fill: customColors[index % customColors.length],
    };
  });

  return { updatedData, config };
};

const { updatedData, config: chartConfig } =
  generateChartDataAndConfig(chartData);

export function CountryTransactions() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
      {/* Chart */}
      <div className="w-[200px] h-[200px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <PieChart width={250} height={250}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={updatedData}
              dataKey="value"
              nameKey="route"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
            />
          </PieChart>
        </ChartContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col space-y-2">
        {updatedData.map((entry) => {
          const configKey = entry.route.toLowerCase().replace(/\s+/g, "_");
          const { label, color } = chartConfig[configKey];
          return (
            <div key={entry.route} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>
                {label}: {entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
