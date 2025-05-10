import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { useGetCategoriesQuery } from '../api/apiSlice';
import { Category } from '../types';
import { ShoppingBag, TrendingUp, Gift, ArrowRight } from 'lucide-react';

// Import the updated Products component
import Products from './Products';

// Ensure react-slick CSS is imported
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Mobile-optimized carousel settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 700,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: false, // Remove arrows on mobile for more space
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
      title: "Muindi Mweusi Supermarket",
      subtitle: "Quality products, unbeatable prices",
      cta: "Shop Now",
      bgClass: "from-primary to-secondary",
    },
    {
      title: "Fresh Arrivals Weekly",
      subtitle: "Discover our latest products",
      cta: "New Arrivals",
      bgClass: "from-indigo-600 to-purple-600",
    },
    {
      title: "Free Delivery Over KSh 1,000",
      subtitle: "Shop from home with ease",
      cta: "Learn More",
      bgClass: "from-amber-500 to-orange-600",
    }
  ];

  return (
    <div className="space-y-8 md:space-y-16">
      {/* Hero Section with Carousel - MOBILE OPTIMIZED */}
      <section className="relative -mx-6 overflow-hidden rounded-b-xl md:rounded-b-3xl shadow-md">
        <Slider {...carouselSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div className={`relative bg-gradient-to-r ${slide.bgClass} text-white py-10 md:py-20 px-4 md:px-6`}>
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                  <h1 className="text-2xl md:text-6xl font-extrabold mb-2 md:mb-4 tracking-tight leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-sm md:text-xl mb-4 md:mb-8 opacity-90 font-light">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-2 md:px-8 md:py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg group text-sm md:text-base"
                  >
                    {slide.cta} 
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Featured Products Section - MOVED UP FOR MOBILE */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
          <Link 
            to="/products" 
            className="text-primary text-sm md:text-base font-medium flex items-center gap-1 hover:gap-2 transition-all duration-300"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 md:p-8 rounded-xl md:rounded-2xl shadow-sm">
          <Products />
        </div>
      </section>

      {/* Features Section - SIMPLIFIED FOR MOBILE */}
      <section className="flex overflow-x-auto py-2 md:py-0 md:grid md:grid-cols-3 gap-3 md:gap-8 no-scrollbar">
        <div className="flex-shrink-0 w-40 md:w-auto bg-white rounded-lg md:rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex md:block items-center">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-0 md:mb-4 mr-3 md:mr-0">
              <ShoppingBag size={16} className="text-primary md:hidden" />
              <ShoppingBag size={24} className="text-primary hidden md:block" />
            </div>
            <div>
              <h3 className="text-sm md:text-xl font-bold text-gray-800 md:mb-2">Express Delivery</h3>
              <p className="text-xs text-gray-600 hidden md:block">Get your orders within 24 hours.</p>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-40 md:w-auto bg-white rounded-lg md:rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex md:block items-center">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-0 md:mb-4 mr-3 md:mr-0">
              <TrendingUp size={16} className="text-primary md:hidden" />
              <TrendingUp size={24} className="text-primary hidden md:block" />
            </div>
            <div>
              <h3 className="text-sm md:text-xl font-bold text-gray-800 md:mb-2">Best Prices</h3>
              <p className="text-xs text-gray-600 hidden md:block">Competitive prices on 100,000+ products.</p>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 w-40 md:w-auto bg-white rounded-lg md:rounded-2xl shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex md:block items-center">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-0 md:mb-4 mr-3 md:mr-0">
              <Gift size={16} className="text-primary md:hidden" />
              <Gift size={24} className="text-primary hidden md:block" />
            </div>
            <div>
              <h3 className="text-sm md:text-xl font-bold text-gray-800 md:mb-2">Special Offers</h3>
              <p className="text-xs text-gray-600 hidden md:block">Up to 25% off on your first order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Shop by Category</h2>
          <Link 
            to="/categories" 
            className="text-primary text-sm md:text-base font-medium flex items-center gap-1 hover:gap-2 transition-all duration-300"
          >
            All Categories <ArrowRight size={14} />
          </Link>
        </div>
        
        {categoriesLoading ? (
          <div className="flex justify-center items-center h-32 md:h-40">
            <div className="relative w-12 h-12 md:w-16 md:h-16">
              <div className="absolute border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full w-12 h-12 md:w-16 md:h-16 animate-spin"></div>
            </div>
          </div>
        ) : categoriesError ? (
          <div className="bg-red-50 p-4 md:p-6 rounded-xl border border-red-100">
            <p className="text-red-500 text-base md:text-lg font-medium text-center">Unable to load categories</p>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <div className="relative bg-white rounded-lg md:rounded-xl shadow-sm overflow-hidden group-hover:shadow-md transition-all duration-300 aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 md:p-4 text-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">
                      <ShoppingBag size={14} className="text-primary md:hidden" />
                      <ShoppingBag size={20} className="text-primary hidden md:block" />
                    </div>
                    <h3 className="text-sm md:text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs md:text-sm text-gray-500 mt-1 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
          <div className="bg-gray-50 p-8 md:p-12 rounded-xl border border-gray-100 text-center">
            <p className="text-gray-500 text-base md:text-lg">No categories available.</p>
          </div>
        )}
      </section>

      {/* Call to Action Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-8 md:py-16 px-4 md:px-8 rounded-xl md:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Join Our Community</h2>
          <p className="text-sm md:text-lg mb-4 md:mb-8 opacity-90">
            Subscribe for exclusive offers and discounts.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-2 md:py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white text-sm md:text-base"
            />
            <button
              type="submit"
              className="bg-white text-primary font-semibold px-4 py-2 md:px-6 md:py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg text-sm md:text-base"
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