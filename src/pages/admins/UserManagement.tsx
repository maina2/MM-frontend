// src/pages/admins/UserManagement.tsx
import React, { useState } from "react";
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "../../api/apiSlice";
import { User, Role } from "../../types";

const UserManagement: React.FC = () => {
  const { data: users, isLoading, error } = useGetAdminUsersQuery();
  const [createAdminUser] = useCreateAdminUserMutation();
  const [updateAdminUser] = useUpdateAdminUserMutation();
  const [deleteAdminUser] = useDeleteAdminUserMutation();

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer" as Role,
    phone_number: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreate = async () => {
    try {
      await createAdminUser(newUser).unwrap();
      setNewUser({ username: "", email: "", password: "", role: "customer", phone_number: "" });
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  const handleUpdate = async (user: User) => {
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

  if (isLoading) return <div className="flex justify-center items-center h-full">Loading users...</div>;
  if (error) return <div className="text-red-500 text-center">Error loading users: {JSON.stringify(error)}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">User Management</h2>

      {/* Create User Form */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Create New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="delivery">Delivery</option>
          </select>
          <input
            type="text"
            placeholder="Phone Number"
            value={newUser.phone_number}
            onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
            className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
        >
          Create User
        </button>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border p-3 text-left">ID</th>
              <th className="border p-3 text-left">Username</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Role</th>
              <th className="border p-3 text-left">Phone</th>
              <th className="border p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.results?.map((user) => ( // Changed from users?.map to users?.results?.map
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border p-3">{user.id}</td>
                <td className="border p-3">{user.username}</td>
                <td className="border p-3">{user.email}</td>
                <td className="border p-3">{user.role}</td>
                <td className="border p-3">{user.phone_number || "N/A"}</td>
                <td className="border p-3">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="bg-yellow-500 text-white p-2 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
                className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value as Role })
                }
                className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="delivery">Delivery</option>
              </select>
              <input
                type="text"
                value={editingUser.phone_number || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, phone_number: e.target.value })
                }
                className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleUpdate(editingUser)}
                className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-500 text-white p-3 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;