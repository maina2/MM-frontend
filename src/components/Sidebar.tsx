import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="hidden lg:block w-64 bg-dark text-white fixed top-0 left-0 h-screen z-20">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">Muindi Mweusi</h2>
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className="block px-4 py-2 rounded-lg hover:bg-primary/20 transition-all"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className="block px-4 py-2 rounded-lg hover:bg-primary/20 transition-all"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/cart"
              className="block px-4 py-2 rounded-lg hover:bg-primary/20 transition-all"
            >
              Cart
            </Link>
          </li>
          <li>
            <Link
              to="/orders"
              className="block px-4 py-2 rounded-lg hover:bg-primary/20 transition-all"
            >
              Orders
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;