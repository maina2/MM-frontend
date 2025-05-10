import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import Products from './Products';
import { useGetCategoriesQuery } from '../api/apiSlice';
import { Category } from '../types';

// Ensure react-slick CSS is imported (add this to index.tsx or App.tsx if not already done)
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Carousel settings
const carouselSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
};

const Home: React.FC = () => {
  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useGetCategoriesQuery();

  return (
    <div className="space-y-12">
      {/* Hero Section with Gradient Overlay */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-16 px-6 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Welcome to Muindi Mweusi Supermarket
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Discover a wide range of products at unbeatable prices. Shop now and enjoy fast delivery!
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products Section with Carousel */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold text-dark mb-8">Featured Products</h2>
        <Slider {...carouselSettings}>
          <div>
            <div className="relative bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
              <Products />
            </div>
          </div>
          <div>
            <div className="relative bg-gradient-to-r from-secondary/10 to-primary/10 p-6 rounded-xl text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-dark mb-4">Special Offers</h3>
              <p className="text-dark/70 mb-6">Get up to 20% off on selected items this week!</p>
              <Link
                to="/products"
                className="inline-block bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-all"
              >
                View Deals
              </Link>
            </div>
          </div>
        </Slider>
      </section>

      {/* Categories Section */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold text-dark mb-8">Shop by Category</h2>
        {categoriesLoading ? (
          <p className="text-dark/60">Loading categories...</p>
        ) : categoriesError ? (
          <p className="text-error">Error loading categories: {JSON.stringify(categoriesError)}</p>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category: Category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="relative bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 bg-neutral flex items-center justify-center">
                  <span className="text-dark/60 text-lg font-semibold">{category.name}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="absolute bottom-4 left-4 text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-dark/60">No categories available.</p>
        )}
      </section>
    </div>
  );
};

export default Home;