import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetCategoryDetailQuery } from "../../api/apiSlice";
import { addItem } from "../../store/cartSlice";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Clock, Grid3X3, List } from "lucide-react";

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

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const { data, error, isLoading } = useGetCategoryDetailQuery(Number(id));

  // Handle Add to Cart
  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem({ product, quantity: 1 }));
  };

  // Generate random ratings for demo purposes
  const getRandomRating = () => (Math.random() * 2 + 3).toFixed(1);

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "compact" : "grid");
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
          Unable to load category
        </p>
        <p className="text-red-400 text-center mt-2">Please try again later</p>
      </div>
    );
  }

  if (!data || !data.category) {
    return (
      <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">Category not found.</p>
        <p className="text-gray-400 mt-2">
          Please check the category ID or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      {/* Category Details */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">
          {data.category.name}
        </h1>
        <p className="text-dark/80">{data.category.description}</p>
      </div>

      {/* Products in this Category */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-semibold text-dark">
          Products in {data.category.name}
        </h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
          <button
            className={`flex items-center justify-center p-2 ${
              viewMode === "grid"
                ? "bg-primary text-white rounded-lg"
                : "text-gray-700"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            className={`flex items-center justify-center p-2 ${
              viewMode === "compact"
                ? "bg-primary text-white rounded-lg"
                : "text-gray-700"
            }`}
            onClick={() => setViewMode("compact")}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          {data.products.map((product: any) => (
            <motion.div
              key={product.id}
              className="group"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Link to={`/products/${product.id}`} className="block h-full">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  {/* Product Image with gradient overlay */}
                  <div className="relative h-36 md:h-64 overflow-hidden bg-gray-100">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Category tag */}
                    <div className="absolute top-2 left-2">
                      <span className="text-xs font-medium bg-white/90 text-primary px-2 py-0.5 rounded-full shadow-sm truncate max-w-24">
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
                  </div>

                  {/* Product Details */}
                  <div className="p-3 md:p-4 flex flex-col flex-grow">
                    <div className="flex items-center gap-1 mb-1">
                      <Star
                        size={12}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {getRandomRating()}
                      </span>
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-gray-800 line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-500 mb-2 line-clamp-1 md:line-clamp-2">
                      {product.description ||
                        "Quality products at great prices."}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-sm md:text-base font-bold text-primary truncate">
                        KSh {Number(product.price).toLocaleString()}
                      </p>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock === 0}
                        className={`flex items-center justify-center rounded-full w-8 h-8 md:w-10 md:h-10 transition-all duration-300 ${
                          product.stock === 0
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary/90"
                        }`}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Compact View */}
      {viewMode === "compact" && (
        <div className="flex flex-col gap-3">
          {data.products.map((product: any) => (
            <motion.div
              key={product.id}
              className="group"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Link to={`/products/${product.id}`} className="block h-full">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden bg-gray-100">
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
                      <span className="text-xs font-medium bg-white/90 text-primary px-2 py-0.5 rounded-full shadow-sm">
                        {product.category.name.substring(0, 10)}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-2 md:p-3 flex flex-col flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="text-yellow-400 fill-yellow-400"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {getRandomRating()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-1 line-clamp-1">
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
                      <p className="text-sm font-bold text-primary">
                        KSh {Number(product.price).toLocaleString()}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Add wishlist functionality here
                          }}
                          className="flex items-center justify-center rounded-full w-8 h-8 bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Star size={14} />
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock === 0}
                          className={`flex items-center justify-center rounded-full w-8 h-8 transition-all duration-300 ${
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
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Back to Categories Link */}
      <div className="mt-6">
        <Link to="/categories" className="text-primary hover:underline">
          ← Back to Categories
        </Link>
      </div>
    </div>
  );
};

export default CategoryDetail;
