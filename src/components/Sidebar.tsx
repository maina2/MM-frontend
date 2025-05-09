import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaShoppingBag, FaBox, FaTruck, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div
      className={`fixed md:pt-16 top-0 left-0 h-full w-64 bg-dark text-white transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:top-16 z-30`}
    >
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-accent">Categories</h2>
        <button className="md:hidden" onClick={toggleSidebar}>
          <FaTimes size={24} />
        </button>
      </div>
      <nav className="space-y-2 p-4">
        <Link
          to="/products?category=groceries"
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaShoppingBag className="text-accent" /> Groceries
        </Link>
        <Link
          to="/products?category=beverages"
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaShoppingBag className="text-accent" /> Beverages
        </Link>
        <Link
          to="/orders"
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaBox className="text-accent" /> Orders
        </Link>
        <Link
          to="/delivery"
          className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary/20 transition-colors"
          onClick={toggleSidebar}
        >
          <FaTruck className="text-accent" /> Delivery Status
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;