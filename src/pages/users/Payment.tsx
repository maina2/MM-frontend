import React from 'react';
import { useParams } from 'react-router-dom';

const Payment: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Payment Page</h1>
      <p>Payment form for order ID {orderId} will go here.</p>
    </div>
  );
};

export default Payment;