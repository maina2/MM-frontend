import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaHome, 
  FaBell, 
  FaUser, 
  FaThLarge, 
  FaHeart,
  FaTags 
} from 'react-icons/fa';

const Navbar: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart?.items?.length || 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Navbar (Top) */}
      <nav className="hidden md:block bg-white text-gray-800 shadow-md py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Muindi Mweusi
          </Link>
          <div className="flex space-x-6">
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
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <FaSearch className="text-gray-500" />
              </button>
            </form>
            <Link to="/favorites" className="relative hover:text-primary transition-colors">
              <FaHeart size={20} />
            </Link>
            <Link to="/cart" className="relative hover:text-primary transition-colors">
              <FaShoppingCart size={20} />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <FaUser size={20} />
                  <span className="text-sm">{user?.name?.split(' ')[0] || 'Account'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
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

      {/* Mobile Top Bar with Logo, Cart, and Notifications */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white text-gray-800 shadow-sm z-40 px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            Muindi Mweusi
          </Link>
          <div className="flex items-center space-x-5">
            <Link to="/cart" className="relative">
              <FaShoppingCart size={22} />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Link>
            <Link to="/notifications" className="relative">
              <FaBell size={22} />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
            </Link>
          </div>
        </div>
        
        {/* Full Width Search Bar */}
        <div className="mt-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaSearch className="text-gray-500" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white text-gray-700 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-40">
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
          
          <Link to="/favorites" className={`flex flex-col items-center py-2 ${location.pathname === '/favorites' ? 'text-primary' : ''}`}>
            <FaHeart size={20} />
            <span className="text-xs mt-1">Favorites</span>
          </Link>
          
          <Link to="/profile" className={`flex flex-col items-center py-2 ${location.pathname === '/profile' ? 'text-primary' : ''}`}>
            <FaUser size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;