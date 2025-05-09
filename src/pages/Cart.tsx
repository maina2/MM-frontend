import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { CartItem } from '../types';

const Cart: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items) as CartItem[];

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark mb-6">Cart Test</h1>
      {cartItems.length === 0 ? (
        <p className="text-dark/60">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item: CartItem) => (
            <div key={item.product.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-dark">{item.product.name}</h2>
              <p className="text-dark/60">Quantity: {item.quantity}</p>
              <p className="text-dark/60">Price: KSh {item.product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;