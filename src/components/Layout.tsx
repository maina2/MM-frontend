import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  // Calculate and set a CSS variable for the navbar height
  useEffect(() => {
    const updateNavHeight = () => {
      // Get desktop navbar height
      const desktopNav = document.querySelector('.desktop-navbar');
      const mobileTopNav = document.querySelector('.mobile-top-navbar');
      
      if (desktopNav) {
        const desktopNavHeight = desktopNav.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--desktop-nav-height', `${desktopNavHeight}px`);
      }
      
      if (mobileTopNav) {
        const mobileNavHeight = mobileTopNav.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--mobile-nav-height', `${mobileNavHeight}px`);
      }
    };

    // Run once on mount and add resize listener
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    
    return () => window.removeEventListener('resize', updateNavHeight);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Content - Dynamic padding using CSS variables */}
        <main className="flex-1 md:pt-[var(--desktop-nav-height)] pt-[var(--mobile-nav-height)] pb-16 md:pb-0 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-8 px-6 md:block hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Muindi Mweusi Supermarket</h3>
                <p className="text-gray-600">Your one-stop shop for quality products at affordable prices.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-600 hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="/contact" className="text-gray-600 hover:text-primary transition-colors">Contact Us</a></li>
                  <li><a href="/faq" className="text-gray-600 hover:text-primary transition-colors">FAQs</a></li>
                  <li><a href="/terms" className="text-gray-600 hover:text-primary transition-colors">Terms & Conditions</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact</h3>
                <address className="not-italic text-gray-600">
                  <p>123 Market Street</p>
                  <p>Nairobi, Kenya</p>
                  <p className="mt-2">Email: info@muindimweusi.com</p>
                  <p>Phone: +254 700 123 456</p>
                </address>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Muindi Mweusi Supermarket. Simon Chanzu.
            </div>
          </div>
        </footer>
        
        {/* Mobile Footer - Simplified */}
        <footer className="bg-white border-t border-gray-100 py-4 px-4 md:hidden block mb-14">
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Muindi Mweusi Supermarket
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;