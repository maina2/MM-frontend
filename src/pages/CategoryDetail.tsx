import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetCategoryDetailQuery } from '../api/apiSlice';

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, error, isLoading } = useGetCategoryDetailQuery(Number(id));

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      {isLoading ? (
        <p className="text-dark/60 text-center">Loading category details...</p>
      ) : error ? (
        <p className="text-error text-center">Error loading category: {JSON.stringify(error)}</p>
      ) : data ? (
        <div>
          {/* Category Details */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark mb-2">{data.category.name}</h1>
            <p className="text-dark/80">{data.category.description}</p>
          </div>

          {/* Products in this Category */}
          <h2 className="text-2xl font-semibold text-dark mb-4">Products in {data.category.name}</h2>
          {data.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-neutral flex items-center justify-center">
                      <span className="text-dark/60">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-dark mb-1">{product.name}</h3>
                    <p className="text-primary font-medium mb-1">KSh {product.price}</p>
                    <p className={product.stock > 0 ? 'text-green-600' : 'text-error'}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </p>
                    <p className="text-dark/60 text-sm">Branch: {product.branch.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-dark/60">No products found in this category.</p>
          )}

          {/* Back to Categories Link */}
          <div className="mt-6">
            <Link to="/categories" className="text-primary hover:underline">
              ← Back to Categories
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-dark/60 text-center">Category not found.</p>
      )}
    </div>
  );
};

export default CategoryDetail;