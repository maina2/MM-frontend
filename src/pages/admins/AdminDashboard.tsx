// src/pages/AdminDashboard.tsx
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Welcome, Admin! This is your dashboard for managing products, orders, and more.</p>
        <p className="text-gray-600 mt-2">Features coming soon: inventory management, order tracking, user management.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;