import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { Product } from '../types';

const Products: React.FC = () => {
  const dispatch = useDispatch();

  // Fetch products using RTK Query (no query params)
  const { data: products, error, isLoading } = useGetProductsQuery();

  // Handle Add to Cart
  const handleAddToCart = (product: Product) => {
    dispatch(addItem({ product, quantity: 1 }));
  };

  return (
    <div className="flex-1">
      {isLoading ? (
        <p className="text-dark/60">Loading products...</p>
      ) : error ? (
        <p className="text-error">Error: {JSON.stringify(error)}</p>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product: Product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <Link to={`/products/${product.id}`}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-40 w-full object-cover rounded-md mb-4"
                  />
                ) : (
                  <div className="h-40 bg-neutral rounded-md mb-4 flex items-center justify-center">
                    <span className="text-dark/60">No Image</span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-dark">{product.name}</h2>
                <p className="text-dark/60">{product.category.name}</p>
                <p className="text-dark/60">KSh {product.price}</p>
                <p className="text-dark/60">In Stock: {product.stock}</p>
              </Link>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className={`mt-2 w-full py-2 rounded-lg text-white transition-all ${
                  product.stock === 0
                    ? 'bg-dark/60 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-dark/60">No products found.</p>
      )}
    </div>
  );
};

export default Products;