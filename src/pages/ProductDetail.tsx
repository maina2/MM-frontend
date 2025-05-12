import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductByIdQuery } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';
import { type ProductDetail } from '../types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, error, isLoading } = useGetProductByIdQuery(Number(id));

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (product) {
      dispatch(addItem({ product, quantity }));
    }
  };

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + change;
      if (newQuantity < 1) return 1;
      if (product && newQuantity > product.stock) return product.stock;
      return newQuantity;
    });
  };

  return (
    <div className="py-8">
      {isLoading ? (
        <p className="text-dark/60 text-center">Loading product details...</p>
      ) : error ? (
        <p className="text-error text-center">Error loading product: {JSON.stringify(error)}</p>
      ) : product ? (
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 p-6">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-neutral flex items-center justify-center rounded-lg">
                  <span className="text-dark/60">No Image Available</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-dark mb-2">{product.name}</h1>
                <p className="text-lg font-semibold text-primary mb-2">KSh {product.price}</p>
                <p className="text-dark/80 mb-4">{product.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-dark/60">
                    <span className="font-medium">Category:</span> {product.category.name}
                  </p>
                  <p className={product.stock > 0 ? 'text-green-600' : 'text-error'}>
                    <span className="font-medium">Stock:</span>{' '}
                    {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                  </p>
                </div>
              </div>

              {/* Quantity Selector and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="text-dark font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="px-3 py-1 text-dark hover:bg-gray-100 rounded-l-lg"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-dark">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="px-3 py-1 text-dark hover:bg-gray-100 rounded-r-lg"
                      disabled={product.stock === 0 || quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                    product.stock === 0
                      ? 'bg-dark/60 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                  }`}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>

          {/* Back to Products Link */}
          <div className="p-6">
            <Link to="/products" className="text-primary hover:underline">
              ← Back to Products
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-dark/60 text-center">Product not found.</p>
      )}
    </div>
  );
};

export default ProductDetail;