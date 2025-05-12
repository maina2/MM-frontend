import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../store/store';
import { CartItem } from '../types';
import { removeItem, updateQuantity, clearCart } from '../store/cartSlice';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

// Animation variants for cart items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
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
  const cartItems = useSelector((state: RootState) => state.cart.items) as CartItem[];

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.16; // Assuming 16% tax rate
  const total = subtotal + tax;

  return (
    <motion.div
      className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-dark mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Your Shopping Cart
      </motion.h1>

      {cartItems.length === 0 ? (
        <motion.div
          className="min-h-[50vh] flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-600 mb-2">Your Cart is Empty</p>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any items yet. Start shopping now!
          </p>
          <Link to="/categories">
            <motion.button
              className="px-6 py-3 bg-primary text-white rounded-full font-semibold shadow-md hover:bg-primary-dark transition-colors"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Browse Products
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-dark">
                Items ({cartItems.length})
              </h2>
              <motion.button
                onClick={() => dispatch(clearCart())}
                className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <X className="h-5 w-5" /> Clear Cart
              </motion.button>
            </div>
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-100"
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-dark">{item.product.name}</h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.product.description}
                    </p>
                    <p className="text-primary font-medium mt-1">
                      KSh {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className="flex items-center gap-4">
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
                        <Minus className="h-4 w-4 text-gray-600" />
                      </motion.button>
                      <span className="text-dark font-medium w-8 text-center">
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
                        <Plus className="h-4 w-4 text-gray-600" />
                      </motion.button>
                    </div>
                    <motion.button
                      onClick={() => dispatch(removeItem(item.product.id))}
                      className="text-red-500 hover:text-red-600"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-4 border border-gray-100">
              <h2 className="text-2xl font-semibold text-dark mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-dark font-medium">KSh {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (16%)</span>
                  <span className="text-dark font-medium">KSh {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-dark">Total</span>
                  <span className="text-primary">KSh {total.toFixed(2)}</span>
                </div>
              </div>
              <motion.button
                className="w-full mt-6 px-6 py-3 bg-primary text-white rounded-full font-semibold shadow-md hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={cartItems.length === 0}
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