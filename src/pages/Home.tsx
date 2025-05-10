import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { useGetCategoriesQuery } from '../api/apiSlice';
import { Category } from '../types';
import { ShoppingBag, TrendingUp, Gift, ArrowRight } from 'lucide-react';

// Import the updated Products component
import Products from './Products';

// Ensure react-slick CSS is imported (add this to index.tsx or App.tsx if not already done)
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Carousel settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 700,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: true,
  pauseOnHover: true,
  fade: true,
  cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
  dotsClass: 'slick-dots custom-dots',
  customPaging: () => (
    <div className="custom-dot"></div>
  ),
};

const Home: React.FC = () => {
  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const heroSlides = [
    {
      title: "Welcome to Muindi Mweusi Supermarket",
      subtitle: "Discover a wide range of products at unbeatable prices",
      cta: "Shop Now",
      bgClass: "from-primary to-secondary",
    },
    {
      title: "Fresh Arrivals Every Week",
      subtitle: "Be the first to discover our latest products and offers",
      cta: "New Arrivals",
      bgClass: "from-indigo-600 to-purple-600",
    },
    {
      title: "Free Delivery on Orders Over KSh 1,000",
      subtitle: "Shop from the comfort of your home and get it delivered",
      cta: "Learn More",
      bgClass: "from-amber-500 to-orange-600",
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section with Carousel */}
      <section className="relative -mx-6 overflow-hidden rounded-b-3xl shadow-xl">
        <Slider {...carouselSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div className={`relative bg-gradient-to-r ${slide.bgClass} text-white py-20 px-6`}>
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 opacity-90 font-light">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg group"
                  >
                    {slide.cta} 
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Express Delivery</h3>
          <p className="text-gray-600">Get your orders delivered to your doorstep within 24 hours.</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Best Prices</h3>
          <p className="text-gray-600">We offer competitive prices on our 100,000+ products range.</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Gift size={24} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Special Offers</h3>
          <p className="text-gray-600">Discounts up to 25% on your first order and daily flash sales.</p>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
          <Link 
            to="/products" 
            className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all duration-300"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-white p-8 rounded-2xl shadow-sm">
          <Products />
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
          <Link 
            to="/categories" 
            className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all duration-300"
          >
            All Categories <ArrowRight size={16} />
          </Link>
        </div>
        
        {categoriesLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="relative w-16 h-16">
              <div className="absolute border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full w-16 h-16 animate-spin"></div>
            </div>
          </div>
        ) : categoriesError ? (
          <div className="bg-red-50 p-6 rounded-xl border border-red-100">
            <p className="text-red-500 text-lg font-medium text-center">Unable to load categories</p>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <div className="relative bg-white rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-all duration-300 aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <ShoppingBag size={20} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {category.description.substring(0, 50)}
                        {category.description.length > 50 ? '...' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-12 rounded-xl border border-gray-100 text-center">
            <p className="text-gray-500 text-lg">No categories available.</p>
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-16 px-8 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg mb-8 opacity-90">
            Subscribe to our newsletter and be the first to know about new products, special offers, and exclusive discounts.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="bg-white text-primary font-semibold px-6 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;