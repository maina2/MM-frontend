import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { FaShoppingCart, FaUser, FaSearch, FaBars } from 'react-icons/fa';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const isAuthenticated = useSelector((state: RootState) => !!state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart?.items?.length || 0); // Adjust based on your cart slice
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Navbar (Top) */}
      <nav className="hidden md:block fixed top-0 left-0 w-full bg-primary text-white shadow-md z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="px-3 py-1 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60" />
            </div>
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
                className="bg-accent px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:text-secondary transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-primary text-white shadow-t-md z-40">
        <div className="flex justify-around items-center py-2">
          <Link to="/" className="flex flex-col items-center">
            <FaHome size={24} />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center">
            <FaShoppingBag size={24} />
            <span className="text-xs">Products</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center relative">
            <FaShoppingCart size={24} />
            {cartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {cartItems}
              </span>
            )}
            <span className="text-xs">Cart</span>
          </Link>
          <button onClick={toggleSidebar} className="flex flex-col items-center">
            <FaBars size={24} />
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;