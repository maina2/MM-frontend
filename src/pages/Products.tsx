import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { Product } from '../types';
import { motion } from 'framer-motion';

// Animation variants for product cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Products: React.FC = () => {
  const dispatch = useDispatch();

  // Fetch products using RTK Query
  const { data: products, error, isLoading } = useGetProductsQuery();

  // Debug: Log the fetch result
  console.log('Products Fetch Result:', { products, error, isLoading });

  // Handle Add to Cart
  const handleAddToCart = (product: Product) => {
    dispatch(addItem({ product, quantity: 1 }));
  };

  return (
    <div className="flex-1">
      {isLoading ? (
        <p className="text-dark/60 text-lg text-center">Loading products...</p>
      ) : error ? (
        <p className="text-error text-lg text-center">Error loading products: {JSON.stringify(error)}</p>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <motion.div
              key={product.id}
              className="relative bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Product Image */}
              <Link to={`/products/${product.id}`}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-48 bg-neutral flex items-center justify-center">
                    <span className="text-dark/60">No Image</span>
                  </div>
                )}
              </Link>

              {/* Out of Stock Badge */}
              {product.stock === 0 && (
                <span className="absolute top-4 left-4 bg-error text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}

              {/* Product Details */}
              <div className="p-4">
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-dark mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-dark/60 mb-2">{product.category.name}</p>
                  <p className="text-lg font-bold text-primary">KSh {product.price}</p>
                  <p className="text-sm text-dark/60">In Stock: {product.stock}</p>
                </Link>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className={`mt-4 w-full py-2 rounded-lg text-white font-semibold transition-all duration-300 ${
                    product.stock === 0
                      ? 'bg-dark/60 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-dark/60 text-lg text-center">No products found.</p>
      )}
    </div>
  );
};

export default Products;