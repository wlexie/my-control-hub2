import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Chart from "../components/Chart";
import Table from "../components/Table";
import AreaChart from "../components/AreaGraph";
import PieChart from "../components/PieGraph";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import api from "../../../hooks/useApi";

interface RevenueBreakdown {
  transactionTypeName: string;
  totalAmount: number;
  percentage: number;
}

interface TopTransaction {
  transactionReference: string;
  senderAmount: number;
  receiverAmount: number;
  createdAt: string;
}

interface AnalyticsData {
  uniqueCustomers: number;
  revenueBreakdown: RevenueBreakdown[];
  transactionVolume: never[];
  totalAmountTransacted: number;
  transactionCount: number;
  topTransactions: TopTransaction[];
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const Card = ({ icon, title, value }: CardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm text-lg">
      <div className="p-2 rounded-md text-xl">{icon}</div>
      <div>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
        <p className="text-lg text-gray-500">{title}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const { get } = api();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    uniqueCustomers: 0,
    revenueBreakdown: [],
    transactionVolume: [],
    totalAmountTransacted: 0,
    transactionCount: 0,
    topTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const handleDateFilterChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
  };

  const handleClearDateFilter = () => {
    setDateRange({ startDate: null, endDate: null });
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        let url = "/transfer/get-partner-analytics";

        if (dateRange.startDate && dateRange.endDate) {
          const start = dateRange.startDate.toISOString().split("T")[0];
          const end = dateRange.endDate.toISOString().split("T")[0];
          url += `?startDate=${start}&endDate=${end}`;
        }

        const data = await get<AnalyticsData>(url);
        setAnalyticsData(data);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 space-y-8 ml-80 ">
          <Header
            dateRange={dateRange}
            onDateChange={handleDateFilterChange}
            onClearDateFilter={handleClearDateFilter}
          />
          <div className="gap-4 grid grid-cols-3 text-lg">
            <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
            <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
            <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
            <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
            <div className="animate-pulse bg-gray-200 rounded-lg h-80"></div>
          </div>
          <div className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
          <div className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 space-y-8 ml-80">
          <Header
            dateRange={dateRange}
            onDateChange={handleDateFilterChange}
            onClearDateFilter={handleClearDateFilter}
          />
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">
            Error loading analytics: {error}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AreaChart dateRange={dateRange} />
            <Chart dateRange={dateRange} />
            <PieChart />
          </div>
          <Table />
          <Footer />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 ml-80 bg-gray-50 text-black">
        <Header
          dateRange={dateRange}
          onDateChange={handleDateFilterChange}
          onClearDateFilter={handleClearDateFilter}
        />
        <div className="gap-4 grid grid-cols-3 text-lg text-black">
          <Card
            icon={
              <img
                src="/promitto/icon1.svg"
                alt="Icon1"
                className="w-12 h-12"
              />
            }
            title="Total Amount Transacted"
            value={`KES ${analyticsData.totalAmountTransacted.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
          />
          <Card
            icon={
              <img
                src="/promitto/icon2.svg"
                alt="Icon2"
                className="w-12 h-12"
              />
            }
            title="Count of Transactions"
            value={analyticsData.transactionCount.toString()}
          />
          <Card
            icon={
              <img
                src="/promitto/icon3.svg"
                alt="Icon3"
                className="w-12 h-12"
              />
            }
            title="Total Unique Customers"
            value={analyticsData.uniqueCustomers.toString()}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <AreaChart dateRange={dateRange} />
          <Chart dateRange={dateRange} />
          <PieChart />
        </div>
        <Table />
        <Footer />
      </main>
    </div>
  );
}
