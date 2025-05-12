import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../api/apiSlice';
import { motion } from 'framer-motion';

// Animation variants for category cards
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
    y: -5,
    transition: { duration: 0.3 }
  }
};

const Categories: React.FC = () => {
  const { data: categories, error, isLoading } = useGetCategoriesQuery();
  const [searchTerm, setSearchTerm] = useState('');

  // Debug the response
  console.log('Categories data:', categories);
  console.log('Error:', error);
  console.log('Is Loading:', isLoading);

  if (isLoading) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-32 md:h-40 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
        <p className="text-red-500 text-lg font-medium text-center">
          Unable to load categories
        </p>
        <p className="text-red-400 text-center mt-2">
          {JSON.stringify(error)}
        </p>
      </div>
    );
  }

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">No categories found.</p>
        <p className="text-gray-400 mt-2">Check back later for new categories!</p>
      </div>
    );
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-dark mb-6">Categories</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {filteredCategories.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">No matching categories found.</p>
          <p className="text-gray-400 mt-2">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Link
                to={`/categories/${category.id}`}
                className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-32 md:h-40 overflow-hidden bg-gray-100">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 font-medium text-xs">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-dark mb-2">{category.name}</h2>
                  <p className="text-gray-500 line-clamp-2">{category.description}</p>
                  <p className="text-primary mt-2 font-medium">View Products →</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;