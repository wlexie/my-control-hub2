import { ChevronLeft, ChevronRight, MoreVertical, Search } from "lucide-react";

const mockData = [
  {
    influencer: {
      name: "Khaligraph Jones",
      handle: "@khaligraph_jones",
      avatar: "/backoffice/avatar.png",
    },
    customer: "Karen Fischer",
    transaction: "61-70-425529",
    amount: "960.25",
    reward: { label: "Cashback 10% off", color: "bg-blue-100 text-blue-600" },
    time: "08:41am 24/03/25",
    location: "Kenya",
  },
  {
    influencer: {
      name: "Azziad Nasenya",
      handle: "@azzi_ad",
      avatar: "/backoffice/avatar.png",
    },
    customer: "Shelly Ouma",
    transaction: "61-70-425529",
    amount: "14.65",
    reward: { label: "Discount 2.5% off", color: "bg-blue-100 text-blue-600" },
    time: "08:41am 24/03/25",
    location: "Uganda",
  },
  {
    influencer: {
      name: "Kabi wa Jesus",
      handle: "@kabiwajesus",
      avatar: "/backoffice/avatar.png",
    },
    customer: "Morris Wanjohi",
    transaction: "61-70-425529",
    amount: "1,200.21",
    reward: { label: "Gift Vouchers", color: "bg-purple-100 text-purple-600" },
    time: "08:41am 24/03/25",
    location: "United Kingdom",
  },
  {
    influencer: {
      name: "Ombachi Dennis",
      handle: "@the_roamingchef",
      avatar: "/backoffice/avatar.png",
    },
    customer: "Jonson Jogan",
    transaction: "61-70-425529",
    amount: "1,410.35",
    reward: { label: "Tiered Rewards", color: "bg-green-100 text-green-600" },
    time: "08:41am 24/03/25",
    location: "Rwanda",
  },
  {
    influencer: {
      name: "Baby Rue",
      handle: "@rue.baby",
      avatar: "/backoffice/avatar.png",
    },
    customer: "Ken Wanjala",
    transaction: "61-70-425529",
    amount: "200.00",
    reward: { label: "Merchandise", color: "bg-yellow-100 text-yellow-600" },
    time: "08:41am 24/03/25",
    location: "Kenya",
  },
  {
    influencer: {
      name: "Joy Kendi",
      handle: "@justjoykendi",
      avatar: "/backoffice/avatar.png",
    },
    customer: "Lucas Njenga",
    transaction: "61-70-425529",
    amount: "478.56",
    reward: { label: "Cashback 5% off", color: "bg-blue-100 text-blue-600" },
    time: "08:41am 24/03/25",
    location: "Kenya",
  },
];

export default function CampaignTable() {
  return (
    <div className="p-6 bg-white rounded-2xl border-0">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold">
          Campaign Usage & Expiry Tracking
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search by Customer Name, Transaction code..."
              className="pl-8 pr-4 py-2 border rounded-full text-sm bg-gray-50 focus:outline-none"
            />
          </div>
          <button className="px-3 py-1 text-sm rounded-full bg-gray-50 border">
            Export CSV
          </button>
          <button className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
            See all
          </button>
        </div>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="text-gray-500 text-left">
            <tr className="border-b">
              <th className="py-2">Influencer ID</th>
              <th>Customer ID</th>
              <th>Transaction Code</th>
              <th>Amount (GBP)</th>
              <th>Reward Type</th>
              <th>Time (GMT)</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 flex items-center gap-3 whitespace-nowrap">
                  <img
                    src={r.influencer.avatar}
                    className="w-8 h-8 rounded-full"
                    alt="avatar"
                  />
                  <div>
                    <div className="font-medium">{r.influencer.name}</div>
                    <div className="text-xs text-gray-500">
                      {r.influencer.handle}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap">{r.customer}</td>
                <td className="whitespace-nowrap">{r.transaction}</td>
                <td className="whitespace-nowrap">£{r.amount}</td>
                <td className="whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${r.reward.color}`}
                  >
                    {r.reward.label}
                  </span>
                </td>
                <td className="whitespace-nowrap">{r.time}</td>
                <td className="whitespace-nowrap">{r.location}</td>
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
