"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiUser,
  FiUserPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import axios from "axios";
import { Customer } from "@/types";

const UsersPage = () => {
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/users");

      setUsers(res.data.users);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // At the top of your component, add data validation
  useEffect(() => {
    if (users.length > 0) {
      // Check for missing properties and log warnings
      const invalidUsers = users.filter((user) => !user.name || !user.email);
      if (invalidUsers.length > 0) {
        console.warn(
          `Found ${invalidUsers.length} users with missing name or email properties`
        );
      }
    }
  }, [users]);

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    // Add null checks with optional chaining and fallback to empty string
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && user.isAdmin) ||
      (roleFilter === "user" && !user.isAdmin);

    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Toggle all users selection
  const toggleAllSelection = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user._id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!selectedUsers.length) return;

    if (
      confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)
    ) {
      // Implement bulk delete API call here
      console.log("Deleting users:", selectedUsers);
      // After delete refresh the list
      fetchUsers();
      setSelectedUsers([]);
    }
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    if (!name) return "??";

    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Date formatter
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Skeleton loader component
  const UserSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="ml-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-36"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <div className="h-8 bg-gray-200 rounded w-16 ml-auto"></div>
          </td>
        </tr>
      ))}
    </>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-300 mb-4">
        <FiUser size={64} />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No users found</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        {searchTerm || roleFilter !== "all"
          ? "Try adjusting your search or filter criteria"
          : "Get started by adding users to your system"}
      </p>
      <Link
        href="/admin/users/new"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
      >
        <FiUserPlus className="mr-2" />
        Add New User
      </Link>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <p className="text-gray-600 mt-1">Manage your user accounts</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/admin/users/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm flex items-center"
            >
              <FiUserPlus className="mr-2" />
              Add New User
            </Link>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 pb-6">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          {/* Role filter */}
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>

          {/* Reset filters */}
          <button
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
            }}
            className="flex items-center text-gray-600 hover:text-blue-600 py-2"
          >
            <FiRefreshCw className="mr-2" size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Bulk actions bar (visible when users are selected) */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-medium text-blue-700">
              {selectedUsers.length} users
            </span>
            <span className="text-blue-600"> selected</span>
          </div>
          <div className="space-x-2">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
              Assign Role
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <UserSkeleton />
            </tbody>
          </table>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block">
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-2 text-sm text-red-600 underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={
                          selectedUsers.length === currentUsers.length &&
                          currentUsers.length > 0
                        }
                        onChange={toggleAllSelection}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full text-white flex items-center justify-center ${
                            user.isAdmin ? "bg-purple-500" : "bg-blue-500"
                          }`}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName || "No Name"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <FiMail className="mr-2 text-gray-400" size={14} />
                        {user.email || "No Email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAdmin
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="mr-2 text-gray-400" size={14} />
                        {formatDate(user.registeredAt.toString())}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                          title="Edit User"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this user?"
                              )
                            ) {
                              // Handle delete
                              console.log("Delete user:", user._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete User"
                        >
                          <FiTrash2 size={18} />
                        </button>
                        <div className="relative group">
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                            title="More Options"
                          >
                            <FiMoreVertical size={18} />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            <a
                              href="#"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Details
                            </a>
                            <a
                              href="#"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Reset Password
                            </a>
                            <a
                              href="#"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Disable Account
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastUser, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium">{filteredUsers.length}</span>{" "}
                users
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === i + 1
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                    } text-sm font-medium`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersPage;
