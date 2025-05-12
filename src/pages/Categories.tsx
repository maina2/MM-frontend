import React from 'react';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../api/apiSlice';
import { motion } from 'framer-motion';

// Animation variants for category cards (similar to Products.tsx)
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

  // Debug the response
  console.log('Categories data:', categories);
  console.log('Error:', error);
  console.log('Is Loading:', isLoading);

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
          Unable to load categories
        </p>
        <p className="text-red-400 text-center mt-2">
          {JSON.stringify(error)}
        </p>
      </div>
    );
  }

  // Ensure categories is an array before mapping
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center">
        <p className="text-gray-500 text-lg">No categories found.</p>
        <p className="text-gray-400 mt-2">Check back later for new categories!</p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-dark mb-6">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Link
              to={`/categories/${category.id}`}
              className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-dark mb-2">{category.name}</h2>
              <p className="text-gray-500 line-clamp-2">{category.description}</p>
              <p className="text-primary mt-2 font-medium">View Products →</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Categories;