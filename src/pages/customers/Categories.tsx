import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../api/apiSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

// Animation variants for category cards
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
  hover: {
    y: -10,
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.2 },
  },
};

// Animation for the search bar
const searchBarVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Animation for the container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Categories: React.FC = () => {
  const { data: categories, error, isLoading } = useGetCategoriesQuery();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-8 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-2xl border border-red-100 shadow-lg max-w-md w-full text-center">
          <p className="text-red-600 text-xl font-semibold mb-2">
            Oops, something went wrong!
          </p>
          <p className="text-red-500">
            Unable to load categories. Please try again later.
          </p>
          <p className="text-red-400 text-sm mt-3 font-mono">
            {JSON.stringify(error)}
          </p>
        </div>
      </div>
    );
  }

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="bg-gray-50 p-12 rounded-2xl border border-gray-100 shadow-lg max-w-md w-full text-center">
          <p className="text-gray-600 text-xl font-semibold mb-2">
            No Categories Available
          </p>
          <p className="text-gray-500">
            It looks like there are no categories to display. Check back later!
          </p>
        </div>
      </div>
    );
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ... Header and Search Bar ... */}

      {/* Categories Grid */}
      <AnimatePresence>
        {filteredCategories.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="min-h-[50vh] flex items-center justify-center"
          >
            <div className="bg-gray-50 p-12 rounded-2xl border border-gray-100 shadow-lg max-w-md w-full text-center">
              <p className="text-gray-600 text-xl font-semibold mb-2">
                No Matches Found
              </p>
              <p className="text-gray-500">
                Try a different search term to find the category you're looking
                for.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                custom={index}
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to={`/categories/${category.id}`}
                  className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100"
                >
                  {/* Image Section */}
                  <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100">
                    {category.image ? (
                      <motion.img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 font-medium text-sm">
                          No Image
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <motion.div
                      className="absolute top-4 right-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      New
                    </motion.div>
                  </div>

                  {/* Content Section */}
                  <div className="p-3 sm:p-5">
                    <h2 className="text-lg sm:text-xl font-semibold text-dark mb-2 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3">
                      {category.description}
                    </p>
                    <motion.p
                      className="text-primary font-medium flex items-center gap-1"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      View Products
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        →
                      </motion.span>
                    </motion.p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Categories;
