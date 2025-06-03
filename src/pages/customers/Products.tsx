import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetProductsQuery } from "../../api/apiSlice";
import { useDispatch } from "react-redux";
import { addItem } from "../../store/cartSlice";
import { Product } from "../../types";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Clock,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { Pagination, Box } from "@mui/material";

// Animation variants for product cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -5,
    transition: { duration: 0.3 },
  },
};

const Products: React.FC = () => {
  const dispatch = useDispatch();
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  // Fetch products using RTK Query
  const { data, error, isLoading } = useGetProductsQuery({
    page,
    page_size: 12,
  });

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

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", value.toString());
    setSearchParams(newParams);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full w-20 h-20 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
        <p className="text-red-500 text-lg font-medium text-center">
          Unable to load products
        </p>
        <p className="text-red-400 text-center mt-2">Please try again later</p>
      </div>
    );
  }

  if (!data?.results || data.results.length === 0) {
    return (
      <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">No products found.</p>
        <p className="text-gray-400 mt-2">Check back later for new arrivals!</p>
      </div>
    );
  }

  return (
    <Box sx={{ flex: 1, width: "100%", maxWidth: "100%", p: { xs: 1, sm: 2, md: 3 } }} className="overflow-x-hidden">
      {/* Mobile Filter and View toggle */}
      <div className="md:hidden flex justify-between items-center mb-4 px-2">
        <button className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1.5 text-gray-700">
          <Filter size={14} />
          <span className="text-xs font-medium">Filter</span>
        </button>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
          <button
            className={`flex items-center justify-center p-1.5 ${
              viewMode === "grid"
                ? "bg-primary text-white rounded-lg"
                : "text-gray-700"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            className={`flex items-center justify-center p-1.5 ${
              viewMode === "compact"
                ? "bg-primary text-white rounded-lg"
                : "text-gray-700"
            }`}
            onClick={() => setViewMode("compact")}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Product Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full max-w-full">
          {data.results.map((product: Product) => (
            <motion.div
              key={product.id}
              className="group w-full"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link to={`/products/${product.id}`} className="block h-full">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  {/* Product Image with gradient overlay */}
                  <div className="relative h-32 sm:h-36 md:h-48 overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 font-medium text-xs">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay on hover */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                        hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Category tag */}
                    <div className="absolute top-2 left-2">
                      <span className="text-xs font-medium bg-white/90 text-primary px-2 py-0.5 rounded-full shadow-sm truncate max-w-20 sm:max-w-24">
                        {product.category.name}
                      </span>
                    </div>

                    {/* Stock badge */}
                    {product.stock <= 5 && (
                      <div className="absolute bottom-2 left-2">
                        {product.stock === 0 ? (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-red-500 text-white px-2 py-0.5 rounded-full">
                            <Clock size={10} />
                            Out
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                            <Clock size={10} />
                            Low: {product.stock}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Wishlist button - only shown on hover */}
                    <div 
                      className={`absolute top-2 right-2 transition-opacity duration-300 ${
                        hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <button
                        onClick={(e) => handleWishlist(e)}
                        className="flex items-center justify-center rounded-full w-8 h-8 bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-sm"
                      >
                        <Heart size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow">
                    <h3 className="text-sm font-bold text-gray-800 truncate">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {product.description ||
                        "Quality products at great prices."}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-sm font-bold text-primary truncate">
                        KSh {Number(product.price).toLocaleString()}
                      </p>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock === 0}
                        className={`flex items-center justify-center rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 transition-all duration-300 ${
                          product.stock === 0
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Compact View */}
      {viewMode === "compact" && (
        <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-full">
          {data.results.map((product: Product) => (
            <motion.div
              key={product.id}
              className="group w-full"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link to={`/products/${product.id}`} className="block h-full">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex w-full">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 flex-shrink-0 overflow-hidden bg-gray-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 font-medium text-xs">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* Category tag */}
                    <div className="absolute top-1 left-1">
                      <span className="text-xs font-medium bg-white/90 text-primary px-1.5 py-0.5 rounded-full shadow-sm truncate max-w-16 sm:max-w-20">
                        {product.category.name}
                      </span>
                    </div>

                    {/* Wishlist button for compact view */}
                    <div 
                      className={`absolute top-1 right-1 transition-opacity duration-300 ${
                        hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <button
                        onClick={(e) => handleWishlist(e)}
                        className="flex items-center justify-center rounded-full w-6 h-6 bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-sm"
                      >
                        <Heart size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-2 sm:p-3 flex flex-col flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800 truncate">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-500 mb-1 truncate">
                      {product.description ||
                        "Quality products at great prices."}
                    </p>

                    {/* Stock badge */}
                    {product.stock <= 5 && (
                      <div className="mb-1">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                            <Clock size={10} />
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                            <Clock size={10} />
                            Low Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-sm font-bold text-primary truncate">
                        KSh {Number(product.price).toLocaleString()}
                      </p>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock === 0}
                        className={`flex items-center justify-center rounded-full w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                          product.stock === 0
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        <ShoppingCart size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.count > 12 && (
        <Pagination
          count={Math.ceil(data.count / 12)}
          page={page}
          onChange={handlePageChange}
          sx={{ mt: 4, display: "flex", justifyContent: "center" }}
        />
      )}
    </Box>
  );
};

export default Products;