import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Clock } from 'lucide-react';

// Animation variants for product cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    } 
  },
  hover: {
    y: -8,
    transition: { duration: 0.3 }
  }
};

const Products: React.FC = () => {
  const dispatch = useDispatch();
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  
  // Fetch products using RTK Query
  const { data: products, error, isLoading } = useGetProductsQuery();
  
  // Handle Add to Cart
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem({ product, quantity: 1 }));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Implement wishlist functionality
  };
  
  // Generate random ratings for demo purposes
  const getRandomRating = () => (Math.random() * 2 + 3).toFixed(1);
  
  return (
    <div className="flex-1">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative w-20 h-20">
            <div className="absolute border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full w-20 h-20 animate-spin"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <p className="text-red-500 text-lg font-medium text-center">
            Unable to load products
          </p>
          <p className="text-red-400 text-center mt-2">
            Please try again later
          </p>
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product: Product) => (
            <motion.div
              key={product.id}
              className="group"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link to={`/products/${product.id}`} className="block h-full">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Product Image with gradient overlay */}
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 font-medium">No Image</span>
                      </div>
                    )}
                    
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Quick actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={handleWishlist}
                        className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                      >
                        <Heart size={18} className="text-gray-600" />
                      </button>
                    </div>
                    
                    {/* Category tag */}
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-medium bg-white/90 text-primary px-3 py-1 rounded-full shadow-sm">
                        {product.category.name}
                      </span>
                    </div>
                    
                    {/* Stock badge */}
                    {product.stock <= 5 && (
                      <div className="absolute bottom-3 left-3">
                        {product.stock === 0 ? (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-red-500 text-white px-3 py-1 rounded-full">
                            <Clock size={12} />
                            Out of Stock
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-amber-500 text-white px-3 py-1 rounded-full">
                            <Clock size={12} />
                            Low Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-700">{getRandomRating()}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-grow">
                      {product.description || "Shop quality products at unbeatable prices."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-lg font-bold text-primary">
                        KSh {Number(product.price).toLocaleString()}
                      </p>
                      
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock === 0}
                        className={`flex items-center justify-center rounded-full w-10 h-10 transition-all duration-300 ${
                          product.stock === 0
                            ? 'bg-gray-200 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
                        }`}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Add to cart button that appears on hover */}
                  {product.stock > 0 && hoveredProduct === product.id && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={(e) => e.preventDefault()}
                    >
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-full transform transition-transform duration-300 flex items-center gap-2 shadow-lg"
                      >
                        <ShoppingCart size={18} />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">No products found.</p>
          <p className="text-gray-400 mt-2">Check back later for new arrivals!</p>
        </div>
      )}
    </div>
  );
};

export default Products;