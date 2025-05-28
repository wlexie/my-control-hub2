"use client";
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Search } from "lucide-react";
import { FaCalendarAlt, FaFileExport } from "react-icons/fa";
import DateFilter from "../components/DateFilter";
import * as XLSX from "xlsx";
import UserDetailsModal from "./components/UserDetailsModal";
import {
  getInitials,
  getPastelColor,
  statusStyles,
} from "./components/constants";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

interface User {
  accountId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string | null;
  registrationDate: string;
  accountStatus: string;
  step: string;
  userId: number | null;
}

export default function UserAccounts() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const updateUserStatus = (userId: number, newStatus: Partial<User>) => {
    setAllUsers((prev) =>
      prev.map((user) =>
        user.accountId === userId ? { ...user, ...newStatus } : user
      )
    );
  };
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  const usersPerPage = 10;

  const fetchAllUsers = async () => {
    let page = 1;
    const size = 100;
    let results: User[] = [];

    while (true) {
      const res = await fetch(
        `https://api.tuma-app.com/api/account/clients?page=${page}&size=${size}`
      );
      if (!res.ok) break;

      const data = await res.json();
      const users = Array.isArray(data.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];

      if (!users.length) break;

      results = [...results, ...users];
      page++;
    }

    setAllUsers(results);
    setFilteredUsers(results);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = allUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const status = user.accountStatus.toLowerCase();
      const userIdMatch = user.userId?.toString().includes(query);
      const date = new Date(user.registrationDate).getTime();
      const inDateRange =
        !dateRange.startDate ||
        !dateRange.endDate ||
        (date >= dateRange.startDate.getTime() &&
          date <= dateRange.endDate.getTime());

      return (
        (fullName.includes(query) || status.includes(query) || userIdMatch) &&
        inDateRange
      );
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, dateRange, allUsers]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleExport = () => {
    const data = filteredUsers.map((u) => ({
      "User ID": u.userId ?? "N/A",
      "Full Name": `${u.firstName} ${u.lastName}`,
      Email: u.email,
      Phone: u.phone,
      Country: u.country === "KEN" ? "Kenya" : u.country || "—",
      "Account Status": u.accountStatus,
      "Registration Date": new Date(u.registrationDate).toLocaleString(
        "en-GB",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      ),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "user_accounts.xlsx", { compression: true });
  };

  const getCountryDisplay = (code: string | null) => {
    if (code === "Kenya") {
      return (
        <>
          <img
            src="/backoffice/kenya-flag.png"
            className="w-5 h-5 inline-block mr-1"
            alt="Kenya flag"
          />
          Kenya
        </>
      );
    } else if (code === "United Kingdom" || code === "GBR") {
      return (
        <>
          <img
            src="/backoffice/uk-flag.png"
            className="w-5 h-5 inline-block mr-1"
            alt="UK flag"
          />
          United Kingdom
        </>
      );
    } else if (code === "Tanzania") {
      return (
        <>
          <img
            src="/backoffice/tz-flag.png"
            className="w-5 h-5 inline-block mr-1"
            alt="Tanzania flag"
          />
          Tanzania
        </>
      );
    } else {
      return <span className="text-gray-400">N/A</span>;
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 flex-shrink-0">
        <Toaster position="top-right" />
        <Sidebar />
      </div>
      <div className="flex-1 p-6 bg-white overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-black">User & Accounts</h2>
          <div className="flex gap-4">
            <div className="relative w-[470px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name and account status "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-md shadow-sm"
              />
            </div>
            <div className="relative" ref={dateFilterRef}>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm"
              >
                <FaCalendarAlt />
                {dateRange.startDate && dateRange.endDate ? (
                  <span className="text-sm">
                    {dateRange.startDate.toLocaleDateString("en-GB")} -{" "}
                    {dateRange.endDate.toLocaleDateString("en-GB")}
                  </span>
                ) : (
                  "Filter by date"
                )}
              </button>
              {showDateFilter && (
                <div className="absolute z-50 top-12 right-0">
                  <DateFilter
                    onChange={(start, end) => {
                      setDateRange({ startDate: start, endDate: end });
                      setShowDateFilter(false);
                    }}
                    onClear={() =>
                      setDateRange({ startDate: null, endDate: null })
                    }
                    initialStartDate={dateRange.startDate}
                    initialEndDate={dateRange.endDate}
                    isOpen={showDateFilter}
                    onClose={() => setShowDateFilter(false)}
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm"
            >
              <FaFileExport /> Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">USER ID</th>
                <th className="px-4 py-3">USER</th>
                <th className="px-4 py-3">PHONE</th>
                <th className="px-4 py-3">EMAIL</th>
                <th className="px-4 py-3">COUNTRY</th>
                <th className="px-4 py-3">REGISTRATION DATE</th>
                <th className="px-4 py-3">ACCOUNT STATUS</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.accountId}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowModal(true);
                    }}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {user.userId ?? "N/A"}
                    </td>

                    <td className="px-4 py-3 flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${getPastelColor(
                          user.firstName + user.lastName
                        )}`}
                      >
                        {getInitials(user.firstName + " " + user.lastName)}
                      </div>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.phone}</td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 flex items-center gap-2 text-gray-500">
                      {getCountryDisplay(user.country)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.registrationDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          statusStyles[user.accountStatus]?.bg || "bg-gray-100"
                        } ${
                          statusStyles[user.accountStatus]?.text ||
                          "text-gray-600"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            statusStyles[user.accountStatus]?.dot ||
                            "bg-gray-400"
                          }`}
                        />
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">⋯</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center mt-6 gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 bg-blue-400"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages} — {allUsers.length} customer
            {allUsers.length !== 1 && "s"}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 bg-blue-400"
          >
            Next
          </button>
        </div>

        <AnimatePresence>
          {showModal && selectedUser && (
            <UserDetailsModal
              userId={selectedUser.accountId}
              open={showModal}
              onClose={() => setShowModal(false)}
              onUserUpdated={updateUserStatus}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
