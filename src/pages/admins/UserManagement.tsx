import React, { useState } from "react";
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "../../api/apiSlice";
import { User, Role } from "../../types";
import { FaUserPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSpinner } from "react-icons/fa";

const UserManagement: React.FC = () => {
  const { data: users, isLoading, error } = useGetAdminUsersQuery();
  const [createAdminUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [updateAdminUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
  const [deleteAdminUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer" as Role,
    phone_number: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
  });

  const validateForm = (user: typeof newUser) => {
    const errors = {
      username: "",
      email: "",
      password: "",
      phone_number: "",
    };

    if (!user.username.trim()) {
      errors.username = "Username is required";
    }

    if (!user.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      errors.email = "Email is invalid";
    }

    if (!user.password && !editingUser) {
      errors.password = "Password is required";
    } else if (user.password && user.password.length < 6 && !editingUser) {
      errors.password = "Password must be at least 6 characters";
    }

    if (user.phone_number && !/^\+?[0-9\s-]{10,15}$/.test(user.phone_number)) {
      errors.phone_number = "Enter a valid phone number";
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleCreate = async () => {
    if (!validateForm(newUser)) {
      return;
    }

    try {
      await createAdminUser(newUser).unwrap();
      setNewUser({ username: "", email: "", password: "", role: "customer", phone_number: "" });
      setIsCreateFormVisible(false);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  const handleUpdate = async (user: User) => {
    if (!validateForm(user as typeof newUser)) {
      return;
    }

    try {
      await updateAdminUser({ id: user.id, ...user }).unwrap();
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteAdminUser(id).unwrap();
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  const roleColorClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "delivery":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const renderCreateForm = () => (
    <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden w-full">
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Create New User</h3>
        <button
          onClick={() => setIsCreateFormVisible(false)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close form"
        >
          <FaTimes />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className={`border ${formErrors.username ? "border-red-500" : "border-gray-300"} p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {formErrors.username && <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className={`border ${formErrors.email ? "border-red-500" : "border-gray-300"} p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className={`border ${formErrors.password ? "border-red-500" : "border-gray-300"} p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {formErrors.password && <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              placeholder="Phone Number"
              value={newUser.phone_number}
              onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
              className={`border ${formErrors.phone_number ? "border-red-500" : "border-gray-300"} p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {formErrors.phone_number && (
              <p className="mt-1 text-sm text-red-500">{formErrors.phone_number}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 w-full sm:w-auto"
          >
            {isCreating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2" />
                Create User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p className="font-medium">Error loading users</p>
        <p className="text-sm">{JSON.stringify(error)}</p>
      </div>
    );

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => setIsCreateFormVisible(!isCreateFormVisible)}
          className="mt-3 sm:mt-0 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <FaUserPlus className="mr-2" />
          {isCreateFormVisible ? "Hide Form" : "Add New User"}
        </button>
      </div>

      {isCreateFormVisible && renderCreateForm()}

      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.results?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users?.results?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.username}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColorClass(
                          user.role
                        )}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.phone_number || "N/A"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        aria-label={`Edit ${user.username}`}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete ${user.username}`}
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl transform transition-all">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className={`border ${
                      formErrors.username ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {formErrors.username && <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className={`border ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                    className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingUser.phone_number || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone_number: e.target.value })}
                    className={`border ${
                      formErrors.phone_number ? "border-red-500" : "border-gray-300"
                    } p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {formErrors.phone_number && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.phone_number}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editingUser)}
                  disabled={isUpdating}
                  className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;