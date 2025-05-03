import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-dark">Home Page</h1>
      <p className="text-dark">Welcome to Muindi Mweusi Supermarket! Browse products here.</p>
      <div className="w-32 h-32 bg-primary"></div> {/* Test block */}
    </div>
  );
};

export default Home;