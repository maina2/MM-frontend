import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { FaShoppingCart, FaUserCircle, FaSearch, FaHome, FaShoppingBag, FaWallet, FaCompass } from 'react-icons/fa';

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
      <nav className="hidden md:block fixed top-0 left-0 w-full bg-primary text-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold animate-fadeIn">
            Muindi Mweusi
          </Link>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-secondary transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-secondary transition-colors">
              Products
            </Link>
            <Link to="/cart" className="hover:text-secondary transition-colors">
              Cart
            </Link>
            {isAuthenticated && (
              <Link to="/profile" className="hover:text-secondary transition-colors">
                Profile
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 rounded-lg bg-primary/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <FaSearch className="text-white/60" />
              </button>
            </form>
            <Link to="/cart" className="relative">
              <FaShoppingCart size={24} />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-accent px-4 py-2 rounded-lg hover:bg-accent/90 active:bg-accent/70 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-secondary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/90 active:bg-secondary/80 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Header (Top: Logo, Cart, Profile, Search Bar) */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-primary text-white shadow-md z-40">
        <div className="flex justify-between items-center px-4 py-3">
          <Link to="/" className="text-xl font-bold">
            Muindi Mweusi
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <FaShoppingCart size={24} />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItems}
                </span>
              )}
            </Link>
            <Link to="/profile">
              <FaUserCircle size={24} />
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-primary/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:scale-105 transition-transform"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <FaSearch className="text-white/60" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Navbar (Bottom: Home, Shop, Discover, Wallet, Profile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-primary text-white shadow-t-md z-40 animate-slideUp">
        <div className="flex justify-around items-center py-2">
          <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-secondary' : ''}`}>
            <FaHome size={24} />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/products" className={`flex flex-col items-center ${location.pathname === '/products' ? 'text-secondary' : ''}`}>
            <FaShoppingBag size={24} />
            <span className="text-xs">Shop</span>
          </Link>
          <Link to="/discover" className={`flex flex-col items-center ${location.pathname === '/discover' ? 'text-secondary' : ''}`}>
            <FaCompass size={24} />
            <span className="text-xs">Discover</span>
          </Link>
          <Link to="/wallet" className={`flex flex-col items-center ${location.pathname === '/wallet' ? 'text-secondary' : ''}`}>
            <FaWallet size={24} />
            <span className="text-xs">Wallet</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-secondary' : ''}`}>
            <FaUserCircle size={24} />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;