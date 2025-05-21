// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/shared/Home";
import Login from "./pages/shared/Login";
import Register from "./pages/shared/Register";
import Cart from "./pages/customers/Cart";
import Payment from "./pages/customers/Payment";
import Delivery from "./pages/delivery/DeliveryTasks";
import GoogleCallback from "./pages/shared/GoogleCallback";
import Products from "./pages/customers/Products";
import ProductDetail from "./pages/customers/ProductDetail";
import Categories from "./pages/customers/Categories";
import CategoryDetail from "./pages/customers/CategoryDetail";
import OrderConfirmation from "./pages/customers/OrderConfirmation";
import Checkout from "./pages/customers/Checkout";
import SearchResults from "./pages/customers/SearchResults";
import Offers from "./pages/customers/Offers";
import Profile from "./pages/shared/Profile";
import Orders from "./pages/customers/Orders";
import AdminDashboard from "./pages/admins/AdminDashboard";
import UserManagement from "./pages/admins/UserManagement";
import ProductManagement from "./pages/admins/ProductManagement"; 
import OrderManagement from "./pages/admins/OrderManagement"; 
import PaymentManagement from "./pages/admins/PaymentManagement"; 
import DeliveryManagement from "./pages/admins/DeliveryManagement"; 
import Settings from "./pages/admins/Settings"; 
import DeliveryTasks from "./pages/delivery/DeliveryTasks";
import Unauthorized from "./pages/shared/Unauthorized";
import ErrorBoundary from "./components/ErrorBoundary";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/delivery/:orderId" element={<Delivery />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/discover" element={<div>Discover Page</div>} />
          <Route path="/wallet" element={<div>Wallet Page</div>} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<div />} /> {/* Handled in AdminDashboard.tsx */}
              <Route path="users" element={<ErrorBoundary><UserManagement /></ErrorBoundary>} />
              <Route path="products" element={<ErrorBoundary><ProductManagement /></ErrorBoundary>} />
              <Route path="orders" element={<ErrorBoundary><OrderManagement /></ErrorBoundary>} />
              <Route path="payments" element={<ErrorBoundary><PaymentManagement /></ErrorBoundary>} />
              <Route path="deliveries" element={<ErrorBoundary><DeliveryManagement /></ErrorBoundary>} />
              <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["delivery"]} />}>
            <Route path="/delivery/tasks" element={<DeliveryTasks />} />
          </Route>
        </Route>
        {/* Routes without Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
      </Routes>
    </Router>
  );
};

export default App;