import React from 'react';
import { useGetProductsQuery } from '../api/apiSlice';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/cartSlice';

const ProductsTest: React.FC = () => {
  const dispatch = useDispatch();
  const { data: products, error, isLoading } = useGetProductsQuery({ search: 'apple', category: 'groceries' });

  const handleAddToCart = (product: Product) => {
    dispatch(addItem({ product, quantity: 1 }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark mb-6">Test Products</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-error">Error: {JSON.stringify(error)}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products?.map((product: Product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="h-40 bg-neutral rounded-md mb-4"></div>
              <h2 className="text-lg font-semibold text-dark">{product.name}</h2>
              <p className="text-dark/60">KSh {product.price}</p>
              <p className="text-dark/60">Stock: {product.stock}</p>
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsTest;