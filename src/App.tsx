import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/shared/Home";
import Login from "./pages/shared/Login";
import Register from "./pages/shared/Register";
import Cart from "./pages/customers/Cart";
import Payment from "./pages/customers/Payment";
import DeliveryTasks from "./pages/delivery/DeliveryTasks";
import DeliveryDetail from "./pages/delivery/DeliveryDetails";
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
import Unauthorized from "./pages/shared/Unauthorized";
import ErrorBoundary from "./components/ErrorBoundary";
import DeliveryRoute from "./pages/delivery/DeliveryRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Truly Public Routes (accessible by all, including unauthenticated users) */}
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<div>Discover Page</div>} />
          <Route path="/wallet" element={<div>Wallet Page</div>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/offers" element={<Offers />} />

          {/* Customer-Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment/:orderId" element={<Payment />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/order-confirmation/:orderId"
              element={<OrderConfirmation />}
            />
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* Profile Route (accessible by all authenticated users) */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["customer", "admin", "delivery"]}
              />
            }
          >
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin"
              element={
                <ErrorBoundary>
                  <AdminDashboard />
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ErrorBoundary>
                  <UserManagement />
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ErrorBoundary>
                  <ProductManagement />
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ErrorBoundary>
                  <OrderManagement />
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ErrorBoundary>
                  <PaymentManagement />
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/deliveries"
              element={
                <ErrorBoundary>
                  <DeliveryManagement />
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              }
            />
          </Route>

          {/* Protected Delivery Routes */}
          <Route element={<ProtectedRoute allowedRoles={["delivery"]} />}>
            <Route path="/delivery/tasks" element={<DeliveryTasks />} />
            <Route path="/delivery/tasks/:id" element={<DeliveryDetail />} />
            <Route path="/delivery/route" element={<DeliveryRoute />} />
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
