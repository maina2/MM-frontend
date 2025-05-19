// src/pages/DeliveryTasks.tsx
import React from 'react';

const DeliveryTasks: React.FC = () => {
  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Delivery Tasks</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Welcome, Delivery Person! View and manage your assigned deliveries here.</p>
        <p className="text-gray-600 mt-2">Features coming soon: delivery list, status updates, map integration.</p>
      </div>
    </div>
  );
};

export default DeliveryTasks;