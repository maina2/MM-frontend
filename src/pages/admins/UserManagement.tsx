import React, { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  Shield,
  Truck,
  User as UserIcon, // Aliased to avoid conflict
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "../../api/apiSlice"; 
import type { User } from "../../types"; 

const UserManagement = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<{
    id?: number;
    username: string;
    email: string;
    password?: string;
    role: string;
    phone_number?: string;
  }>({
    username: "",
    email: "",
    password: "",
    role: "customer",
    phone_number: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});

  // Fetch users with pagination
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useGetAdminUsersQuery({ page, page_size: pageSize });

  // Mutations
  const [createUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();

  const roleConfig: Record<
    string,
    { icon: React.ElementType; color: string; bg: string; border: string; label: string }
  > = {
    admin: {
      icon: Shield,
      color: "text-purple-700",
      bg: "bg-purple-100",
      border: "border-purple-200",
      label: "Admin",
    },
    delivery: {
      icon: Truck,
      color: "text-blue-700",
      bg: "bg-blue-100",
      border: "border-blue-200",
      label: "Delivery",
    },
    customer: {
      icon: UserIcon, 
      color: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-200",
      label: "Customer",
    },
  };

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.username.trim()) errors.username = "Username is required";
    else if (formData.username.length < 3)
      errors.username = "Username must be at least 3 characters";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!isEditMode && !formData.password) {
      errors.password = "Password is required for new users";
    } else if (formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (
      formData.phone_number &&
      !/^\+?[0-9\s-]{10,15}$/.test(formData.phone_number)
    ) {
      errors.phone_number = "Enter a valid phone number";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "customer",
      phone_number: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setIsEditMode(true);
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      phone_number: user.phone_number || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && formData.id) {
        const updatePayload: Partial<User> & { id: number } = {
          id: formData.id,
          username: formData.username,
          email: formData.email,
          role: formData.role as "admin" | "delivery" | "customer",
          phone_number: formData.phone_number || null,
        };
        if (formData.password) updatePayload.password = formData.password;
        await updateUser(updatePayload).unwrap();
        showNotification("User updated successfully!");
      } else {
        const createPayload = {
          username: formData.username,
          email: formData.email,
          password: formData.password!,
          role: formData.role as "admin" | "delivery" | "customer",
          phone_number: formData.phone_number || null,
        };
        await createUser(createPayload).unwrap();
        showNotification("User created successfully!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const message =
        error?.data?.detail ||
        (isEditMode ? "Failed to update user" : "Failed to create user");
      showNotification(message, "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
        showNotification("User deleted successfully!");
      } catch (error: any) {
        showNotification(error?.data?.detail || "Failed to delete user", "error");
      }
    }
  };

  const filteredUsers = (usersData?.results || []).filter((user: User) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const RoleBadge = ({ role }: { role: string }) => {
    const config = roleConfig[role] || roleConfig.customer;
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color} ${config.border} border`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
          <div
            className={`flex items-center px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="text-gray-500 w-5 h-5" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="delivery">Delivery</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isUsersLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        )}

        {/* Error State */}
        {isUsersError && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Failed to load users
            </h3>
            <p className="text-gray-500">
              {(usersError as any)?.data?.detail || "An error occurred. Please try again."}
            </p>
          </div>
        )}

        {/* User List */}
        {!isUsersLoading && !isUsersError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user: User) => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-4">
                    {/* Header Section: Initials, Username, ID, and Role */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1">
                            <h3 className="font-bold text-gray-900 text-base">
                              {user.username}
                            </h3>
                            <span className="text-xs text-gray-500">
                              #{user.id}
                            </span>
                          </div>
                          <div className="mt-1">
                            <RoleBadge role={user.role} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Section: Email and Phone */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">
                          {user.phone_number || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                        disabled={isDeleting || isCreating || isUpdating}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                        disabled={isDeleting || isCreating || isUpdating}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {/* Pagination */}
            {usersData && usersData.count > 0 && (
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || isUsersLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <span className="text-gray-600">
                  Page {page} of {Math.ceil(usersData.count / pageSize)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={
                    !usersData.next || isUsersLoading || filteredUsers.length < pageSize
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-auto"
            style={{ marginTop: "8.6rem" }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? "Edit User" : "Create New User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                disabled={isCreating || isUpdating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[50vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.username
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Enter username"
                  disabled={isCreating || isUpdating}
                />
                {formErrors.username && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Enter email address"
                  disabled={isCreating || isUpdating}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEditMode
                    ? "New Password (leave blank to keep current)"
                    : "Password *"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                      formErrors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Enter password"
                    disabled={isCreating || isUpdating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isCreating || isUpdating}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isCreating || isUpdating}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.phone_number
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="+1234567890"
                  disabled={isCreating || isUpdating}
                />
                {formErrors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.phone_number}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isCreating || isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                {(isCreating || isUpdating) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? "Save Changes" : "Create User"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;