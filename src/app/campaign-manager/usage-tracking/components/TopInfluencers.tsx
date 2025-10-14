"use client";

import { MoreHorizontal } from "lucide-react";

const influencers = [
  {
    id: 1,
    name: "Khaligraph Jones",
    handle: "@khaligraph_jones",
    redemptions: 204,
    earnings: 8800.25,
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Azziad Nasenya",
    handle: "@azzi_od",
    redemptions: 185,
    earnings: 1420.65,
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Kabi wa Jesus",
    handle: "@kabiwajesus",
    redemptions: 177,
    earnings: 1200.21,
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 4,
    name: "Ombachi Dennis",
    handle: "@the_roamingchef",
    redemptions: 163,
    earnings: 1010.35,
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=4",
  },
  {
    id: 5,
    name: "Baby Rue",
    handle: "@rue.baby",
    redemptions: 160,
    earnings: 800.0,
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: 6,
    name: "Joy Kendi",
    handle: "@justjoykendi",
    redemptions: 159,
    earnings: 478.56,
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=6",
  },
];

export default function InfluencersTable() {
  return (
    <div className="p-4 bg-white rounded-xl ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold">Top Influencers</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:flex-1 sm:justify-center">
          <input
            type="text"
            placeholder="Search by Influencer name or @tag_name"
            className="px-3 py-2 text-md border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-96"
          />
        </div>

        <div className="flex flex-row gap-2 sm:items-center sm:ml-auto">
          <button className="px-3 py-2 border rounded-lg text-md bg-gray-50 hover:bg-gray-100">
            Export PDF
          </button>
          <button className="px-3 py-2 border rounded-lg text-md bg-blue-50 text-blue-600 hover:bg-blue-100">
            Monthly
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-md border-collapse">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Redemptions</th>
              <th className="px-4 py-3">Earnings (GBP)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {influencers.map((inf) => (
              <tr
                key={inf.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3 flex items-center gap-3">
                  <span className="text-gray-400 font-semibold">{inf.id}.</span>
                  <img
                    src={inf.avatar}
                    alt={inf.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{inf.name}</p>
                    <p className="text-gray-400 text-sm">{inf.handle}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{inf.redemptions}</td>
                <td className="px-4 py-3 font-medium">
                  {inf.earnings.toLocaleString("en-GB", {
                    style: "currency",
                    currency: "GBP",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      inf.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {inf.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
