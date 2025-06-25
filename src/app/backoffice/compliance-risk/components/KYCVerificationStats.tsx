export default function KYCVerificationStats() {
  const stats = [
    {
      label: "Document Verification",
      value: 74,
      total: 95,
      color: "bg-rose-400",
    },
    {
      label: "Credit Rating Check",
      value: 89,
      total: 105,
      color: "bg-yellow-400",
    },
    {
      label: "Fraud Check",
      value: 12,
      total: 48,
      color: "bg-green-600",
    },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border-0 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h2 className="font-semibold text-lg sm:text-xl text-gray-800">
          Customers Verified at each KYC level.
        </h2>
        <button className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md w-max">
          Yearly 
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-14">
        {stats.map((item, idx) => {
          const percentage = Math.round((item.value / item.total) * 100);
          return (
            <div key={idx}>
              <div className="flex justify-between text-sm sm:text-md text-gray-600 font-medium mb-1">
                <span className="truncate">{item.label}</span>
                <span className="whitespace-nowrap">
                  {`${item.value} out of ${item.total} - ${percentage}%`}
                </span>
              </div>
              <div className="w-full h-6 sm:h-5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`${item.color} h-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
