import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Filter,
} from "lucide-react";

const mockData = [
  {
    avatar: "/backoffice/avatar.png",
    name: "Jason Sterling",
    memberId: "61-70-425529",
    status: "Active",
    revenue: "8,000.25",
    referrals: 153,
    fees: "1,002.97",
    dateJoined: "24/03/25",
    country: "UK",
    flag: "/backoffice/uk-flag.png",
  },
  {
    avatar: "/backoffice/avatar.png",
    name: "Kevin Mwangi",
    memberId: "61-70-425529",
    status: "Churned",
    revenue: "6,800.65",
    referrals: 140,
    fees: "988.37",
    dateJoined: "24/06/23",
    country: "KEN",
    flag: "/backoffice/uk-flag.png",
  },
  {
    avatar: "/backoffice/avatar.png",
    name: "Kevin Mwiki",
    memberId: "61-70-425528",
    status: "Churned",
    revenue: "6,800.65",
    referrals: 140,
    fees: "988.37",
    dateJoined: "24/06/23",
    country: "KEN",
    flag: "/backoffice/kenya-flag.png",
  },
  {
    avatar: "/backoffice/avatar.png",
    name: "Kevin Maina",
    memberId: "61-70-425530",
    status: "Churned",
    revenue: "6,800.65",
    referrals: 140,
    fees: "988.37",
    dateJoined: "24/06/23",
    country: "KEN",
    flag: "/backoffice/kenya-flag.png",
  },
];

export default function ReferralTable() {
  return (
    <div className="p-6 bg-white rounded-2xl border-0">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold">
          Latest Top Referrers & Referral Program Impact
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search by Customer Name,Transaction code..."
              className="pl-8 pr-4 py-2 border rounded-full text-sm bg-gray-50 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-1 px-4 py-1 border rounded-full text-sm bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
            See all
          </button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="text-gray-500 text-left">
            <tr className="border-b">
              <th className="py-2">Customer Name</th>
              <th>Member ID</th>
              <th>Status</th>
              <th>Revenue Contribution (GBP)</th>
              <th>No. of Referrals</th>
              <th>Fees Earned</th>
              <th>Date Joined</th>
              <th>Country</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 flex items-center gap-3 whitespace-nowrap">
                  <img
                    src={r.avatar}
                    className="w-8 h-8 rounded-full"
                    alt="avatar"
                  />
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.memberId}</div>
                  </div>
                </td>
                <td className="whitespace-nowrap">{r.memberId}</td>
                <td className="whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      r.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap">£{r.revenue}</td>
                <td className="whitespace-nowrap">{r.referrals}</td>
                <td className="whitespace-nowrap">£{r.fees}</td>
                <td className="whitespace-nowrap">{r.dateJoined}</td>
                <td className="whitespace-nowrap flex items-center gap-2">
                  <img
                    src={r.flag}
                    className="w-5 h-5 rounded-full"
                    alt="flag"
                  />
                  <span>{r.country}</span>
                </td>
                <td>
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>Showing 1 to 06 of 20</span>
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4 cursor-pointer" />
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-center text-xs leading-6">
            1
          </div>
          <ChevronRight className="w-4 h-4 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
