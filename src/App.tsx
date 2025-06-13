import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/shared/Home";
import Login from "./pages/shared/Login";
import Register from "./pages/shared/Register";
import Unauthorized from "./pages/shared/Unauthorized";
import ErrorBoundary from "./components/ErrorBoundary";
import GoogleCallback from "./pages/shared/GoogleCallback";

// Create MUI theme
const theme = createTheme();

// Lazy-loaded Delivery Routes
const DeliveryTasks = lazy(() => import("./pages/delivery/DeliveryTasks"));
const DeliveryDetail = lazy(() => import("./pages/delivery/DeliveryDetails"));
const DeliveryRoute = lazy(() => import("./pages/delivery/DeliveryRoute"));

// Lazy-loaded Admin Routes
const AdminDashboard = lazy(() => import("./pages/admins/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admins/UserManagement"));
const ProductManagement = lazy(() => import("./pages/admins/ProductManagement"));
const CategoryManagement = lazy(() => import("./pages/admins/CategoryManagement"));
const OrderManagement = lazy(() => import("./pages/admins/OrderManagement"));
const PaymentManagement = lazy(() => import("./pages/admins/PaymentManagement"));
const DeliveryManagement = lazy(() => import("./pages/admins/DeliveryManagement"));
const Settings = lazy(() => import("./pages/admins/Settings"));

// Lazy-loaded Customer Routes
const Cart = lazy(() => import("./pages/customers/Cart"));
const Payment = lazy(() => import("./pages/customers/Payment"));
const Products = lazy(() => import("./pages/customers/Products"));
const ProductDetail = lazy(() => import("./pages/customers/ProductDetail"));
const Categories = lazy(() => import("./pages/customers/Categories"));
const CategoryDetail = lazy(() => import("./pages/customers/CategoryDetail"));
const OrderConfirmation = lazy(() => import("./pages/customers/OrderConfirmation"));
const Checkout = lazy(() => import("./pages/customers/Checkout"));
const SearchResults = lazy(() => import("./pages/customers/SearchResults"));
const Offers = lazy(() => import("./pages/customers/Offers"));
const Orders = lazy(() => import("./pages/customers/Orders"));

// Lazy-loaded Profile Route
const Profile = lazy(() => import("./pages/shared/Profile"));

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route element={<Layout />}>
            {/* Truly Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<div>Discover Page</div>} />
            <Route path="/wallet" element={<div>Wallet Page</div>} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Customer-Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
              <Route
                path="/cart"
                element={
                  <Suspense fallback={<div>Loading Cart...</div>}>
                    <Cart />
                  </Suspense>
                }
              />
              <Route
                path="/payment/:orderId"
                element={
                  <Suspense fallback={<div>Loading Payment...</div>}>
                    <Payment />
                  </Suspense>
                }
              />
              <Route
                path="/checkout"
                element={
                  <Suspense fallback={<div>Loading Checkout...</div>}>
                    <Checkout />
                  </Suspense>
                }
              />
              <Route
                path="/order-confirmation/:orderId"
                element={
                  <Suspense fallback={<div>Loading Order Confirmation...</div>}>
                    <OrderConfirmation />
                  </Suspense>
                }
              />
              <Route
                path="/orders"
                element={
                  <Suspense fallback={<div>Loading Orders...</div>}>
                    <Orders />
                  </Suspense>
                }
              />
              <Route
                path="/products"
                element={
                  <Suspense fallback={<div>Loading Products...</div>}>
                    <Products />
                  </Suspense>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <Suspense fallback={<div>Loading Product Detail...</div>}>
                    <ProductDetail />
                  </Suspense>
                }
              />
              <Route
                path="/categories"
                element={
                  <Suspense fallback={<div>Loading Categories...</div>}>
                    <Categories />
                  </Suspense>
                }
              />
              <Route
                path="/categories/:id"
                element={
                  <Suspense fallback={<div>Loading Category Detail...</div>}>
                    <CategoryDetail />
                  </Suspense>
                }
              />
              <Route
                path="/search"
                element={
                  <Suspense fallback={<div>Loading Search Results...</div>}>
                    <SearchResults />
                  </Suspense>
                }
              />
              <Route
                path="/offers"
                element={
                  <Suspense fallback={<div>Loading Offers...</div>}>
                    <Offers />
                  </Suspense>
                }
              />
            </Route>

            {/* Profile Route */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["customer", "admin", "delivery"]} />
              }
            >
              <Route
                path="/profile"
                element={
                  <Suspense fallback={<div>Loading Profile...</div>}>
                    <Profile />
                  </Suspense>
                }
              />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<div>Loading Admin Dashboard...</div>}>
                    <ErrorBoundary>
                      <AdminDashboard />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <Suspense fallback={<div>Loading User Management...</div>}>
                    <ErrorBoundary>
                      <UserManagement />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <Suspense fallback={<div>Loading Product Management...</div>}>
                    <ErrorBoundary>
                      <ProductManagement />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <Suspense fallback={<div>Loading Category Management...</div>}>
                    <ErrorBoundary>
                      <CategoryManagement />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <Suspense fallback={<div>Loading Order Management...</div>}>
                    <ErrorBoundary>
                      <OrderManagement />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <Suspense fallback={<div>Loading Payment Management...</div>}>
                    <ErrorBoundary>
                      <PaymentManagement />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/admin/deliveries"
                element={
                  <Suspense fallback={<div>Loading Delivery Management...</div>}>
                    <ErrorBoundary>
                      <DeliveryManagement />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <Suspense fallback={<div>Loading Settings...</div>}>
                    <ErrorBoundary>
                      <Settings />
                    </ErrorBoundary>
                  </Suspense>
                }
              />
            </Route>

            {/* Protected Delivery Routes */}
            <Route element={<ProtectedRoute allowedRoles={["delivery"]} />}>
              <Route
                path="/delivery/tasks"
                element={
                  <Suspense fallback={<div>Loading Delivery Tasks...</div>}>
                    <DeliveryTasks />
                  </Suspense>
                }
              />
              <Route
                path="/delivery/tasks/:id"
                element={
                  <Suspense fallback={<div>Loading Delivery Detail...</div>}>
                    <DeliveryDetail />
                  </Suspense>
                }
              />
              <Route
                path="/delivery/route"
                element={
                  <Suspense fallback={<div>Loading Delivery Route...</div>}>
                    <DeliveryRoute />
                  </Suspense>
                }
              />
            </Route>
          </Route>
          {/* Routes without Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;