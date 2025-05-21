// src/components/Navbar.tsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import {
  FaShoppingCart,
  FaHome,
  FaUser,
  FaThLarge,
  FaTags,
  FaUsers,
  FaBox,
  FaShoppingBag,
  FaCreditCard,
  FaTruck,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { FiTruck } from 'react-icons/fi';
import SearchBar from './SearchBar';

const Navbar: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const cartItems = useSelector((state: RootState) => state.cart?.items?.length || 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block bg-white text-gray-800 shadow-md py-4 fixed top-0 left-0 w-full z-[1200] desktop-navbar">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Muindi Mweusi
          </Link>
          <div className="flex space-x-6">
            {role === 'customer' && (
              <>
                <Link to="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/products" className="hover:text-primary transition-colors">
                  Products
                </Link>
                <Link to="/categories" className="hover:text-primary transition-colors">
                  Categories
                </Link>
                <Link to="/offers" className="hover:text-primary transition-colors">
                  Offers
                </Link>
              </>
            )}
            {role === 'admin' && (
              <Link to="/admin" className="hover:text-primary transition-colors">
                Admin Dashboard
              </Link>
            )}
            {role === 'delivery' && (
              <Link to="/delivery/tasks" className="hover:text-primary transition-colors">
                Delivery Tasks
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <SearchBar />
            {role === 'customer' && (
              <Link to="/cart" className="relative hover:text-primary transition-colors">
                <FaShoppingCart size={20} />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartItems}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <FaUser size={20} />
                  <span className="text-sm">{user?.username || 'Account'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[1300] hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-sm hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary text-white text-sm px-3 py-1 rounded-md hover:bg-primary/90 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white text-gray-800 shadow-sm z-[1200] px-4 py-3 mobile-top-navbar">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            Muindi Mweusi
          </Link>
          <div className="flex items-center space-x-5">
            {role === 'customer' && (
              <Link to="/cart" className="relative">
                <FaShoppingCart size={22} />
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
            )}
            <Link to="/profile" className="relative">
              <FaUser size={22} />
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white text-gray-700 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-[1200]">
        {role === 'admin' ? (
          <div className="grid grid-cols-5 items-center">
            <Link to="/admin/users" className={`flex flex-col items-center py-2 ${location.pathname === '/admin/users' ? 'text-primary' : ''}`}>
              <FaUsers size={20} />
              <span className="text-xs mt-1">Users</span>
            </Link>
            <Link to="/admin/products" className={`flex flex-col items-center py-2 ${location.pathname === '/admin/products' ? 'text-primary' : ''}`}>
              <FaBox size={20} />
              <span className="text-xs mt-1">Products</span>
            </Link>
            <Link to="/admin/orders" className={`flex flex-col items-center py-2 ${location.pathname === '/admin/orders' ? 'text-primary' : ''}`}>
              <FaShoppingBag size={20} />
              <span className="text-xs mt-1">Orders</span>
            </Link>
            <Link to="/admin/payments" className={`flex flex-col items-center py-2 ${location.pathname === '/admin/payments' ? 'text-primary' : ''}`}>
              <FaCreditCard size={20} />
              <span className="text-xs mt-1">Payments</span>
            </Link>
            <Link to="/admin/deliveries" className={`flex flex-col items-center py-2 ${location.pathname === '/admin/deliveries' ? 'text-primary' : ''}`}>
              <FaTruck size={20} />
              <span className="text-xs mt-1">Deliveries</span>
            </Link>
          </div>
        ) : role === 'delivery' ? (
          <div className="grid grid-cols-3 items-center">
            <Link to="/delivery/tasks" className={`flex flex-col items-center py-2 ${location.pathname === '/delivery/tasks' ? 'text-primary' : ''}`}>
              <FaMapMarkerAlt size={20} />
              <span className="text-xs mt-1">Tasks</span>
            </Link>
            <Link to="/orders" className={`flex flex-col items-center py-2 ${location.pathname === '/orders' ? 'text-primary' : ''}`}>
              <FiTruck size={20} />
              <span className="text-xs mt-1">Orders</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center py-2 ${location.pathname === '/profile' ? 'text-primary' : ''}`}>
              <FaUser size={20} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-5 items-center">
            <Link to="/" className={`flex flex-col items-center py-2 ${location.pathname === '/' ? 'text-primary' : ''}`}>
              <FaHome size={20} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/categories" className={`flex flex-col items-center py-2 ${location.pathname === '/categories' ? 'text-primary' : ''}`}>
              <FaThLarge size={20} />
              <span className="text-xs mt-1">Categories</span>
            </Link>
            <Link to="/offers" className={`flex flex-col items-center py-2 ${location.pathname === '/offers' ? 'text-primary' : ''}`}>
              <FaTags size={20} />
              <span className="text-xs mt-1">Offers</span>
            </Link>
            <Link to="/orders" className={`flex flex-col items-center py-2 ${location.pathname === '/orders' ? 'text-primary' : ''}`}>
              <FiTruck size={20} />
              <span className="text-xs mt-1">Orders</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center py-2 ${location.pathname === '/profile' ? 'text-primary' : ''}`}>
              <FaUser size={20} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;