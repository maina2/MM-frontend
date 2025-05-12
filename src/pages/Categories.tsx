import React from 'react';
import { Link } from 'react-router-dom';
import { useGetCategoriesQuery } from '../api/apiSlice';

const Categories: React.FC = () => {
  const { data: categories, error, isLoading } = useGetCategoriesQuery();

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-dark mb-6">Categories</h1>
      {isLoading ? (
        <p className="text-dark/60 text-center">Loading categories...</p>
      ) : error ? (
        <p className="text-error text-center">Error loading categories: {JSON.stringify(error)}</p>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-dark mb-2">{category.name}</h2>
              <p className="text-dark/60 line-clamp-2">{category.description}</p>
              <p className="text-primary mt-2 font-medium">View Products →</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-dark/60 text-center">No categories found.</p>
      )}
    </div>
  );
};

export default Categories;