"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import {
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

type Influencer = {
  id: number;
  name: string;
  handle: string;
  idNumber: string;
  phone: string;
  email: string;
  country: string;
  status: "Active" | "Inactive";
  avatar: string;
  createdOn: string;
  socials: string[];
};

const COUNTRIES = [
  "All Countries",
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Ethiopia",
  "Malawi",
  "Burundi",
  "South Sudan",
];

export default function InfluencerProfiles() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState("Kenya");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("influencers") || "[]");
    if (stored.length > 0) {
      setInfluencers(stored);
    } else {
      setInfluencers([
        {
          id: 1,
          name: "Khaligraph Jones",
          handle: "@khaligraph_jones",
          idNumber: "2725529",
          phone: "+254 7852413",
          email: "khalijones@gmail.com",
          country: "Kenya",
          status: "Active",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          createdOn: "08:41am 24/03/25",
          socials: ["linkedin", "twitter", "instagram"],
        },
        {
          id: 2,
          name: "Azziad Nasenya",
          handle: "@azzi_ad",
          idNumber: "2725529",
          phone: "+254 7852413",
          email: "azziadnas@gmail.com",
          country: "Kenya",
          status: "Inactive",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          createdOn: "08:41am 24/03/25",
          socials: ["facebook", "instagram"],
        },
        {
          id: 3,
          name: "Kabi Wa Jesus",
          handle: "@kabiwajesus",
          idNumber: "2725529",
          phone: "+254 7852413",
          email: "kabiwajes@gmail.com",
          country: "Kenya",
          status: "Active",
          avatar: "https://randomuser.me/api/portraits/men/29.jpg",
          createdOn: "08:41am 24/03/25",
          socials: ["instagram", "twitter"],
        },
        {
          id: 4,
          name: "Rue Baby",
          handle: "@rue.baby",
          idNumber: "2725529",
          phone: "+254 7852413",
          email: "rue@gmail.com",
          country: "Kenya",
          status: "Active",
          avatar: "https://randomuser.me/api/portraits/women/32.jpg",
          createdOn: "08:41am 24/03/25",
          socials: ["instagram", "twitter", "tiktok"],
        },
        {
          id: 5,
          name: "King Kaka",
          handle: "@kakaking",
          idNumber: "2725529",
          phone: "+254 7852413",
          email: "kaka@gmail.com",
          country: "Kenya",
          status: "Active",
          avatar: "https://randomuser.me/api/portraits/men/29.jpg",
          createdOn: "08:41am 24/03/25",
          socials: ["instagram", "twitter"],
        },
        {
          id: 6,
          name: "Ajib Gathoni",
          handle: "@ajibgathoni",
          idNumber: "2725529",
          phone: "+254 7852413",
          email: "ajib@gmail.com",
          country: "Kenya",
          status: "Active",
          avatar: "https://randomuser.me/api/portraits/women/21.jpg",
          createdOn: "08:41am 24/03/25",
          socials: ["instagram", "twitter", "linkendin"],
        },
        {
          id: 7,
          name: "Millie Wa Jesus",
          handle: "@milliewajesus",
          idNumber: "2725529",
          phone: "+254 7852413",
          email: "milliewajes@gmail.com",
          country: "Kenya",
          status: "Active",
          avatar: "https://randomuser.me/api/portraits/women/29.jpg",
          createdOn: "08:41am 24/03/25",
          socials: ["instagram", "twitter", "facebook"],
        },
      ]);
    }
  }, []);

  const filtered = influencers.filter((i) => {
    if (selectedCountry !== "All Countries" && i.country !== selectedCountry)
      return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      i.handle.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q)
    );
  });

  const goToAdd = () =>
    router.push("/campaign-manager/influencer-attribution/add-influencer");

  const flagSrc = (country: string) => {
    const map: Record<string, string> = {
      Kenya: "/backoffice/kenya.png",
      Uganda: "/backoffice/uganda.png",
      Tanzania: "/backoffice/tz.png",
      Rwanda: "/backoffice/rwanda.png",
      Ethiopia: "/backoffice/ethiopia.png",
      Malawi: "/backoffice/malawi.png",
      Burundi: "/backoffice/burundi.png",
      "South Sudan": "/backoffice/ss.png",
    };
    return map[country] || "/backoffice/default.png";
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <h1 className="sm:text-xl font-semibold text-gray-900 text-center lg:text-left text-2xl">
          Influencer Profiles
        </h1>

        {/* Centered Search Bar and Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full lg:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by influencer name or handle"
            className="w-full sm:w-96 md:w-[600px] bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center sm:text-left"
          />
          <div className="flex gap-3">
            <button
              onClick={goToAdd}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Influencer
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-lg text-md shadow-sm w-full sm:w-auto">
              Export CSV <span className="text-xs">▾</span>
            </button>
          </div>
        </div>
      </div>

      {/* Country Tabs */}
      <div className="bg-white border border-gray-100 rounded-xl px-3 py-3 mb-6 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-3">
          {COUNTRIES.map((c) => {
            const active = selectedCountry === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                {c !== "All Countries" && (
                  <img
                    src={flagSrc(c)}
                    alt={c}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Influencer Cards */}
      <div className="space-y-4">
        {filtered.map((inf) => (
          <div
            key={inf.id}
            className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            {/* Left - Avatar and Name */}
            <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
              <img
                src={inf.avatar}
                alt={inf.name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {inf.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{inf.handle}</p>
                <div className="flex gap-3 mt-2 text-gray-400 text-sm flex-wrap">
                  {inf.socials?.includes("linkedin") && <FaLinkedin />}
                  {inf.socials?.includes("twitter") && <FaTwitter />}
                  {inf.socials?.includes("instagram") && <FaInstagram />}
                  {inf.socials?.includes("tiktok") && <FaTiktok />}
                  {inf.socials?.includes("youtube") && <FaYoutube />}
                  {inf.socials?.includes("facebook") && <FaFacebook />}
                </div>
              </div>
            </div>

            {/* Center - Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 flex-1 w-full">
              <div>
                <p className="text-xs text-gray-400">ID Number</p>
                <p className="text-sm font-medium text-gray-800">
                  {inf.idNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone Number</p>
                <p className="text-sm font-medium text-gray-800">{inf.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {inf.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm font-medium text-gray-800">
                  {inf.country}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Created On</p>
                <p className="text-sm font-medium text-gray-800">
                  {inf.createdOn}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <p
                  className={`text-sm font-semibold ${
                    inf.status === "Active" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {inf.status}
                </p>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="ml-auto">
              <MoreHorizontal className="text-gray-500" />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No influencers found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 text-sm text-gray-600 gap-3">
        <div>
          Showing 1 to {filtered.length} of {influencers.length}
        </div>
        <div className="flex gap-2">
          <button className="border rounded-lg px-3 py-1 text-md">‹</button>
          <button className="bg-blue-600 text-white border rounded-lg px-3 py-1">
            1
          </button>
          <button className="border rounded-lg px-3 py-1">2</button>
          <button className="border rounded-lg px-3 py-1">3</button>
          <button className="border rounded-lg px-3 py-1 text-md">›</button>
        </div>
      </div>
    </div>
  );
}
