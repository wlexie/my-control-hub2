import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaEllipsisV, FaArrowUp } from 'react-icons/fa';
import { BiDollarCircle } from "react-icons/bi";
import { RiCheckDoubleFill } from "react-icons/ri";
import { LuUsers } from "react-icons/lu";
import { CiBullhorn } from "react-icons/ci";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store'; // Adjust path if needed

// Interface for the raw data received from the API
interface CampaignMetric {
  id: number;
  campaignName: string;
  totalContactsSent: number;
  deliveredCount: number;
  estimatedCost: number;
  failedCount: number;
  pendingCount: number;
  deliveryStatus: string;
  sentAt: string | null;
  completedAt: string | null;
}

// Interface for the transformed campaign data
interface Campaign {
  id: number;
  campaignName: string;
  target: number;
  status: 'Sent' | 'Pending' | 'Draft' | 'Mixed Delivery' | 'All Failed';
  date: string;
  sentBy: string;
  deliveryRate: number | 'Not sent' | 'Pending';
  estimatedCost: number;
}

const Details: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedDates, setSelectedDates] = useState('All Dates');
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const itemsPerPage = 5;

  // --- Fetch Data from API ---
  useEffect(() => {
    const fetchCampaignMetrics = async () => {
      if (!accessToken) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://com.tuma-app.com/api/sms-campaigns/metrics', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        // --- FIX APPLIED HERE ---
        // 1. Log the response to help with debugging the API output structure.
        console.log("API Response:", response.data);

        // 2. Safely check if the response data is an array. If not, default to an empty array.
        // This prevents the "campaignMetrics.map is not a function" error.
        const metricsData = Array.isArray(response.data) ? response.data : [];
        setCampaignMetrics(metricsData);
        // --- END OF FIX ---

        setError(null);
      } catch (err) {
        console.error("Error fetching campaign metrics:", err);
        setError('Failed to fetch campaign metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignMetrics();
  }, [accessToken]); // MODIFIED: Re-run the effect if the token changes


  // --- Transform API data into Campaign format ---
  const campaigns = useMemo<Campaign[]>(() => {
    // This check is now a safeguard, but the fix in useEffect should prevent this from being an issue.
    if (!Array.isArray(campaignMetrics)) {
        return [];
    }
    return campaignMetrics.map(metric => {
      let status: Campaign['status'];
      switch (metric.deliveryStatus) {
        case 'MIXED_DELIVERY':
          status = 'Mixed Delivery';
          break;
        case 'DRAFT':
          status = 'Draft';
          break;
        case 'SENT': 
          status = 'Sent';
          break;
        case 'PENDING':
          status = 'Pending';
          break;
        case 'ALL_FAILED':
          status = 'All Failed';
          break;
        default:
          status = 'Mixed Delivery';
      }

      const sentAtDate = metric.sentAt ? new Date(metric.sentAt) : null;
      const date = sentAtDate
        ? sentAtDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZone: 'Africa/Nairobi',
            timeZoneName: 'short',
          })
        : 'N/A';

      let deliveryRate: Campaign['deliveryRate'] = 'Not sent';
      if (metric.totalContactsSent > 0) {
        deliveryRate = (metric.deliveredCount / metric.totalContactsSent) * 100;
      } else if (status === 'Pending') {
        deliveryRate = 'Pending';
      }

      return {
        id: metric.id,
        campaignName: metric.campaignName,
        target: metric.totalContactsSent,
        status: status,
        date: date,
        sentBy: 'Admin',
        deliveryRate: deliveryRate,
        estimatedCost: metric.estimatedCost,
      };
    });
  }, [campaignMetrics]);

  // --- Filtering Logic ---
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All Status' || campaign.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, selectedStatus]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCampaigns.slice(startIndex, endIndex);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Helper functions for styling ---
  const getStatusClasses = (status: Campaign['status']) => {
    switch (status) {
      case 'Sent': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Mixed Delivery': return 'bg-purple-100 text-purple-700';
      case 'All Failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeliveryRateBarColor = (rate: Campaign['deliveryRate']) => {
    if (typeof rate === 'number') {
      if (rate >= 95) return 'bg-green-500';
      if (rate >= 90) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return 'bg-gray-300';
  };

  // --- Calculate Summary Card Data ---
  const totalCampaigns = campaigns.length;
  const totalRecipients = campaigns.reduce((acc, campaign) => acc + campaign.target, 0);
  const totalDelivered = campaignMetrics.reduce((acc, metric) => acc + metric.deliveredCount, 0);
  const totalSentForDeliveryRate = campaignMetrics.reduce((acc, metric) => acc + metric.totalContactsSent, 0);
  const overallDeliveryRate = totalSentForDeliveryRate > 0 ? (totalDelivered / totalSentForDeliveryRate) * 100 : 0;
  const totalSpend = useMemo(() => {
    return campaignMetrics.reduce((acc, metric) => {
      if (metric.deliveryStatus !== 'DRAFT') {
        return acc + metric.estimatedCost;
      }
      return acc;
    }, 0);
  }, [campaignMetrics]);

  if (loading) {
    return <div className="p-6 text-center text-gray-700">Loading campaigns data...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Sent</option>
            <option>Pending</option>
            <option>Draft</option>
            <option>Mixed Delivery</option>
            <option>All Failed</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedDates}
            onChange={(e) => setSelectedDates(e.target.value)}
          >
            <option>All Dates</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col items-left text-gray-500 text-sm">
              <div className="flex justify-between items-center">
                <span className="p-2 bg-blue-100 w-fit text-blue-600 rounded-full mr-2">
                  <CiBullhorn className="w-4 h-4" />
                </span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
              <span className='mt-2 text-xl font-semibold text-black'>{totalCampaigns}</span>
              <p className="text-lg mt-1 font-medium text-gray-600">Total Campaigns</p>
              <span className="text-green-500 mt-1 flex text-xs items-center ">
                <FaArrowUp className="w-3 h-3 mr-1" />
                12% from last month
              </span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col items-left text-gray-500 text-sm">
              <div className="flex justify-between items-center">
                <span className="p-2 bg-green-100 w-fit text-green-600 rounded-full mr-2">
                  <LuUsers className="w-4 h-4" />
                </span>
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              </div>
              <span className='mt-2 text-xl font-semibold text-black'>
                {totalRecipients > 999 ? (totalRecipients / 1000).toFixed(1) + 'K' : totalRecipients}
              </span>
              <p className="text-lg mt-1 font-medium text-gray-600">Total Recipients</p>
              <span className="text-green-500 mt-1 flex text-xs items-center ">
                <FaArrowUp className="w-3 h-3 mr-1" />
                +8.5% from last month
              </span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col text-gray-500 text-sm">
              <div className="flex justify-between items-center">
                <span className="p-2 bg-yellow-100 text-yellow-600 rounded-full mr-2">
                  <RiCheckDoubleFill className="w-4 h-4" />
                </span>
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              </div>
              <span className='mt-2 text-xl font-semibold text-black'>{overallDeliveryRate.toFixed(1)}%</span>
              <p className="text-lg mt-1 font-medium text-gray-600">Delivery Rate</p>
              <span className="text-green-500 text-xs mt-1 flex items-center">
                <FaArrowUp className="w-3 h-3 mr-1" />
                +2.3% from last month
              </span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col text-gray-500 text-sm">
              <div className="flex justify-between items-center">
                <span className="p-2 bg-red-100 text-red-600 rounded-full mr-2">
                  <BiDollarCircle className="w-4 h-4" />
                </span>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </div>
              <span className='mt-2 text-xl font-semibold text-black'>${totalSpend.toFixed(2)}</span>
              <p className="text-lg mt-1 font-medium text-gray-600">Total Spend</p>
              <span className="text-green-500 text-xs flex items-center">
                <FaArrowUp className="w-3 h-3 mr-1" />
                +15.2% from last month
              </span>
            </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Rate</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCampaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.campaignName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.target.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.sentBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {typeof campaign.deliveryRate === 'number' ? (
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`${getDeliveryRateBarColor(campaign.deliveryRate)} h-2 rounded-full`}
                          style={{ width: `${campaign.deliveryRate}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{campaign.deliveryRate.toFixed(1)}%</span>
                    </div>
                  ) : (
                    <span>{campaign.deliveryRate}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <FaEllipsisV className="text-gray-500 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} results
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;