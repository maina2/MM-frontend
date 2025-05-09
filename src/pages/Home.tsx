import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag } from 'react-icons/fa';

const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary/80 text-white rounded-lg p-8 text-center animate-fadeIn">
        <h1 className="text-4xl font-bold mb-4">Welcome to Muindi Mweusi</h1>
        <p className="text-lg mb-6">Discover the best groceries at unbeatable prices.</p>
        <Link
          to="/products"
          className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-all"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      <section className="animate-fadeIn">
        <h2 className="text-2xl font-bold text-dark mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="h-40 bg-neutral rounded-md mb-4"></div>
              <h3 className="text-lg font-semibold text-dark">Product {item}</h3>
              <p className="text-dark/60">KSh 500</p>
              <button className="mt-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-all">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="animate-fadeIn">
        <h2 className="text-2xl font-bold text-dark mb-4">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Groceries', 'Beverages'].map((category) => (
            <Link
              key={category}
              to={`/products?category=${category.toLowerCase()}`}
              className="bg-primary/10 rounded-lg p-4 flex items-center gap-4 hover:bg-primary/20 transition-colors"
            >
              <FaShoppingBag className="text-primary" size={24} />
              <span className="text-lg font-semibold text-dark">{category}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;