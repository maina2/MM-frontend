// src/pages/Unauthorized.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
      <p className="text-gray-600 mb-6">You don’t have permission to access this page.</p>
      <Link to="/" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;