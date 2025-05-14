import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../store/store';
import { CartItem } from '../types';
import { removeItem, updateQuantity, clearCart } from '../store/cartSlice';
import { X, Plus, Minus, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

// Animation variants for cart items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Animation for buttons
const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } },
};

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items) as CartItem[];
  const [itemsPerPage] = useState<number>(12);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, // Use Number() to ensure price is a number
    0
  );
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleItemExpand = (itemId: number) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
    }
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };

  // Compact cart item for grid view
  const CartItemCompact: React.FC<{ item: CartItem; index: number }> = ({ item, index }) => {
    const isExpanded = expandedItem === item.product.id;
    
    return (
      <motion.div
        key={item.product.id}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col"
        custom={index}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Image and basic info */}
        <div className="relative">
          <div className="aspect-square bg-gray-100 overflow-hidden">
            {item.product.image ? (
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          
          {/* Quantity badge */}
          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {item.quantity}
          </div>
        </div>
        
        {/* Product details */}
        <div className="p-2 flex-1 flex flex-col">
          <h3 className="font-medium text-sm text-dark line-clamp-1">{item.product.name}</h3>
          <p className="text-primary font-medium text-sm mt-auto">
            KSh {Number(item.product.price).toFixed(2)} {/* Parse price to number */}
          </p>
        </div>
        
        {/* Action row */}
        <div className="flex border-t border-gray-100">
          <button 
            onClick={() => toggleItemExpand(item.product.id)}
            className="flex-1 p-2 text-xs text-center text-gray-600 hover:bg-gray-50"
          >
            {isExpanded ? "Less" : "More"}
          </button>
          <button
            onClick={() => dispatch(removeItem(item.product.id))}
            className="flex-1 p-2 text-xs text-center text-red-500 border-l border-gray-100 hover:bg-gray-50"
          >
            Remove
          </button>
        </div>
        
        {/* Expanded view with quantity controls */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <div className="p-3 space-y-2">
                <p className="text-gray-600 text-xs line-clamp-2">
                  {item.product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.product.id,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3 text-gray-600" />
                    </motion.button>
                    <span className="text-dark text-sm font-medium w-6 text-center">
                      {item.quantity}
                    </span>
                    <motion.button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            productId: item.product.id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3 text-gray-600" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-600">
                    Total: <span className="text-primary">KSh {(Number(item.product.price) * item.quantity).toFixed(2)}</span> {/* Parse price */}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Original list view item (modified to be more compact)
  const CartItemList: React.FC<{ item: CartItem; index: number }> = ({ item, index }) => (
    <motion.div
      key={item.product.id}
      className="bg-white rounded-lg shadow-sm p-3 mb-2 flex items-center gap-3 border border-gray-100"
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Product Image */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.product.image ? (
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-medium text-dark line-clamp-1">{item.product.name}</h2>
        <p className="text-primary text-sm font-medium">
          KSh {Number(item.product.price).toFixed(2)} x {item.quantity} {/* Parse price */}
        </p>
      </div>

      {/* Quantity Controls & Remove */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() =>
              dispatch(
                updateQuantity({
                  productId: item.product.id,
                  quantity: item.quantity - 1,
                })
              )
            }
            className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3 text-gray-600" />
          </motion.button>
          <span className="text-dark text-xs font-medium w-5 text-center">
            {item.quantity}
          </span>
          <motion.button
            onClick={() =>
              dispatch(
                updateQuantity({
                  productId: item.product.id,
                  quantity: item.quantity + 1,
                })
              )
            }
            className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={item.quantity >= item.product.stock}
          >
            <Plus className="h-3 w-3 text-gray-600" />
          </motion.button>
        </div>
        <motion.button
          onClick={() => dispatch(removeItem(item.product.id))}
          className="text-red-500 hover:text-red-600"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.h1
        className="text-2xl md:text-3xl font-bold text-dark mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Your Shopping Cart
      </motion.h1>

      {cartItems.length === 0 ? (
        <motion.div
          className="min-h-[40vh] flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingBag className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-semibold text-gray-600 mb-2">Your Cart is Empty</p>
          <p className="text-gray-500 mb-4 text-sm">
            Looks like you haven't added any items yet.
          </p>
          <Link to="/categories">
            <motion.button
              className="px-5 py-2 bg-primary text-white rounded-full font-medium shadow-md hover:bg-primary-dark transition-colors text-sm"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Browse Products
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-dark">
                  Items ({cartItems.length})
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
                  <button 
                    className={`px-2 py-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </button>
                  <button 
                    className={`px-2 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </button>
                </div>
              </div>
              
              <motion.button
                onClick={() => dispatch(clearCart())}
                className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1 text-sm"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <X className="h-4 w-4" /> Clear
              </motion.button>
            </div>

            {/* Grid or List View based on viewMode */}
            <AnimatePresence>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {currentItems.map((item, index) => (
                    <CartItemCompact key={item.product.id} item={item} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {currentItems.map((item, index) => (
                    <CartItemList key={item.product.id} item={item} index={index} />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number + 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-dark mb-3">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-dark font-medium">KSh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (16%)</span>
                  <span className="text-dark font-medium">KSh {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 mt-2"></div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-dark">Total</span>
                  <span className="text-primary">KSh {total.toFixed(2)}</span>
                </div>
              </div>
              <motion.button
                className="w-full mt-4 px-4 py-3 bg-primary text-white rounded-lg font-semibold shadow-md hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={cartItems.length === 0}
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;