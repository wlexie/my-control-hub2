"use client";

import { useEffect, useState } from "react";
import SideNav from "../components/SideNav";
import { IoIosSearch, IoIosArrowForward } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import AssignRoleModal from "../components/AssignRole";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ConfirmDeactivateModal from "../components/ConfirmDeactivateModal"; // ADDED: Import the new modal
import auth from "../../../hooks/Auth";

type UserStatus = "active" | "pending";

interface User {
  id: number;
  userKey: string;
  accountKey: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  department: string;
  status: UserStatus;
  createdAt: number;
  modifiedAt: number;
}

interface ApiUser {
  id: number;
  userKey?: string;
  accountKey?: string | null;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  status?: boolean;
  createdAt?: string;
  modifiedAt?: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ADDED: State for the deactivate modal
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const { get, post /*, del, put */ } = auth();

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getInitialsColor = (initials: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-red-100 text-red-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600",
      "bg-teal-100 text-teal-600",
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await get<ApiUser[]>("/account/system-users-requests");
        const transformedUsers = data.map((user: ApiUser): User => ({
          id: user.id,
          userKey: user.userKey || `user_${user.id}`,
          accountKey: user.accountKey || null,
          firstName: user.firstName || "Unknown",
          lastName: user.lastName || "User",
          email: user.email,
          phoneNumber: user.phoneNumber || "N/A",
          department: user.department || "N/A",
          status: user.status === true ? "active" : "pending",
          createdAt: user.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
          modifiedAt: user.modifiedAt ? new Date(user.modifiedAt).getTime() : Date.now(),
        }));

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (openActionMenu !== null) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openActionMenu]);

  const handleApprove = async (userId: number, email: string) => {
    setOpenActionMenu(null);
    try {
      const data = await post<{ status: string; message: string; accountKey: string }>(
        "/account/approve-system-user",
        null,
        { params: { email } }
      );
  
      if (data.status === "approved") {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, status: "active", accountKey: data.accountKey } : user
          )
        );
        setMessage(data.message);
        setMessageType("success");
      } else {
        throw new Error(data.message || "Failed to approve user");
      }
    } catch (error: unknown) {
      console.error("Error approving user:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      setMessage(message);
      setMessageType("error");
    }
  };
  
  const handleDelete = (userToDelete: User) => {
    setOpenActionMenu(null); 
    setSelectedUser(userToDelete); 
    setIsDeleteModalOpen(true); 
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      console.log(`Simulating API call to delete user: ${selectedUser.firstName}`);
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setMessage(`User "${selectedUser.firstName} ${selectedUser.lastName}" was deleted.`);
      setMessageType("success");
    } catch (err) {
      console.error("Failed to delete user:", err);
      setMessage("Failed to delete user. Please try again.");
      setMessageType("error");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // ADDED: Handler to open the deactivate modal
  const handleDeactivate = (userToDeactivate: User) => {
    setOpenActionMenu(null);
    setSelectedUser(userToDeactivate);
    setIsDeactivateModalOpen(true);
  };

  // ADDED: Handler to confirm the deactivation
  const confirmDeactivateUser = async () => {
    if (!selectedUser) return;
    setIsDeactivating(true);
    try {
      // ** YOUR API CALL TO DEACTIVATE THE USER GOES HERE **
      // Example: await put(`/api/users/${selectedUser.userKey}/deactivate`);
      console.log(`Simulating API call to deactivate user: ${selectedUser.firstName}`);
      
      // For now, we'll just show a message.
      setMessage(`User "${selectedUser.firstName} ${selectedUser.lastName}" has been deactivated.`);
      setMessageType("success");

    } catch (err) {
      console.error("Failed to deactivate user:", err);
      setMessage("Failed to deactivate user. Please try again.");
      setMessageType("error");
    } finally {
      setIsDeactivating(false);
      setIsDeactivateModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleRowClick = (user: User) => {
    if (user.accountKey) {
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };
  
  if (isLoading) { /* (Your loading JSX) */ }
  if (error) { /* (Your error JSX) */ }

  return (
    <div className="flex h-screen relative">
      <div className="w-1/5">
        <SideNav />
      </div>

      <div className="w-4/5 p-8 overflow-auto">
        <div className="overflow-x-auto font-poppins">
          <div className="flex justify-between sticky items-center mb-6">
            <h1 className="text-[18px] font-[600]">User roles & access</h1>
            <div className="relative">
              <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="pl-10 pr-4 py-2 border-2 border-gray-400 rounded-lg text-sm w-64 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div
              className={`p-3 mb-4 rounded-md text-sm ${
                messageType === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <table className="w-full bg-white rounded-lg overflow-auto">
            <thead className="text-[#808A92] font-[600] text-[12px] uppercase border-y border-y-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">#</th>
                <th className="py-2 px-3 text-left">User</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Phone</th>
                <th className="py-2 px-3 text-left">Department</th>
                <th className="py-2 px-3 text-center">Actions</th>
                <th className="py-2 px-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {filteredUsers.map((user, index) => {
                const initials = getInitials(user.firstName, user.lastName);
                const initialsColor = getInitialsColor(initials);

                return (
                  <tr
                    key={user.id}
                    onClick={() => handleRowClick(user)}
                    className={`hover:bg-gray-50 ${user.accountKey ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <td className="py-3 px-3 text-[#808A92]">{index + 1}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${initialsColor.split(" ")[0]}`}>
                          <span className={`font-semibold ${initialsColor.split(" ")[1]}`}>
                            {initials}
                          </span>
                        </div>
                        <span>
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#808A92] font-[400]">{user.email}</td>
                    <td className="py-3 px-3 text-[#808A92] font-[400]">{user.phoneNumber}</td>
                    <td className="py-3 px-3">{user.department}</td>
                    
                    <td className="py-3 px-3 text-center relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenActionMenu(openActionMenu === user.id ? null : user.id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-200"
                      >
                        <BsThreeDotsVertical className="h-5 w-5 text-gray-600" />
                      </button>

                      {openActionMenu === user.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-8 top-full -mt-4 w-40 bg-white rounded-md shadow z-20 border border-gray-100"
                        >
                          <ul className="py-1 text-left">
                            {user.accountKey === null && (
                              <li>
                                <button
                                  onClick={() => handleApprove(user.id, user.email)}
                                  className="w-full text-left px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Approve
                                </button>
                              </li>
                            )}
                            {/* ADDED: Deactivate option for active users */}
                            {user.accountKey !== null && (
                              <li>
                                <button
                                  onClick={() => handleDeactivate(user)}
                                  className="w-full text-left px-4 py-1 text-sm font-medium text-amber-600 hover:bg-amber-50"                                >
                                  Deactivate User
                                </button>
                              </li>
                            )}
                            <li>
                              <button
                                onClick={() => handleDelete(user)}
                                className="w-full text-left px-4 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete User
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <IoIosArrowForward className="text-gray-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AssignRoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        isDeleting={isDeleting}
        user={selectedUser}
      />

      {/* ADDED: Render the new ConfirmDeactivateModal */}
      <ConfirmDeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={confirmDeactivateUser}
        isDeactivating={isDeactivating}
        user={selectedUser}
      />
    </div>
  );
}