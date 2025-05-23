import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const Layout: React.FC = () => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const isAdmin = role === "admin";
  const [sidebarWidth, setSidebarWidth] = useState("14rem"); // 56 = 14rem

  useEffect(() => {
    const updateNavHeight = () => {
      const desktopNav = document.querySelector(".desktop-navbar");
      const mobileTopNav = document.querySelector(".mobile-top-navbar");

      if (desktopNav) {
        const desktopNavHeight = desktopNav.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--desktop-nav-height", `${desktopNavHeight}px`);
      }

      if (mobileTopNav) {
        const mobileNavHeight = mobileTopNav.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--mobile-nav-height", `${mobileNavHeight}px`);
      }
    };

    const updateSidebarWidth = () => {
      const sidebar = document.querySelector(".sidebar-container > div");
      if (sidebar && isAdmin) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarWidth(`${width}px`);
      } else if (!isAdmin) {
        setSidebarWidth("0px");
      }
    };

    updateNavHeight();
    // Small delay to ensure sidebar is rendered
    setTimeout(updateSidebarWidth, 100);
    
    window.addEventListener("resize", updateNavHeight);
    window.addEventListener("resize", updateSidebarWidth);

    // Use MutationObserver to detect sidebar width changes
    const sidebar = document.querySelector(".sidebar-container");
    let observer: MutationObserver | null = null;
    
    if (sidebar) {
      observer = new MutationObserver(() => {
        setTimeout(updateSidebarWidth, 50);
      });
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['class', 'style'],
        subtree: true,
        childList: true
      });
    }

    return () => {
      window.removeEventListener("resize", updateNavHeight);
      window.removeEventListener("resize", updateSidebarWidth);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden w-full">
      {/* Main Content Area with Sidebar and Content */}
      <div className={`flex flex-1 w-full`}>
        {/* Sidebar for Admins - Fixed position */}
        {isAdmin && (
          <div className="sidebar-container fixed left-0 top-0 h-full z-30 md:block hidden">
            <Sidebar />
          </div>
        )}

        {/* Content Container */}
        <div 
          className="flex-1 flex flex-col w-full transition-all duration-300 ease-in-out"
          style={{ 
            marginLeft: isAdmin ? sidebarWidth : '0',
            width: isAdmin ? `calc(100% - ${sidebarWidth})` : '100%'
          }}
        >
          <Navbar />
          <main className="flex-1 pt-[var(--mobile-nav-height)] md:pt-[var(--desktop-nav-height)] pb-16 md:pb-0 p-4 sm:p-6 w-full box-border">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Footer - Full Width */}
      <footer className="w-full bg-white border-t border-gray-100 py-8 px-6 md:block hidden">
        <div 
          className="max-w-7xl mx-auto transition-all duration-300 ease-in-out"
          style={{ 
            marginLeft: isAdmin ? sidebarWidth : '0',
            width: isAdmin ? `calc(100% - ${sidebarWidth})` : '100%'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Muindi Mweusi Supermarket</h3>
              <p className="text-gray-600">Your one-stop shop for quality products at affordable prices.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-600 hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-600 hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-gray-600 hover:text-primary transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                    Terms & Conditions
                  </a>
                </li>
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
            © {new Date().getFullYear()} Muindi Mweusi Supermarket. Simon Maina Chanzu.
          </div>
        </div>
      </footer>

      {/* Mobile Footer */}
      <footer className="w-full bg-white border-t border-gray-100 py-4 px-4 md:hidden block mb-16">
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Muindi Mweusi Supermarket
        </div>
      </footer>
    </div>
  );
};

export default Layout;