import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Delivery from './pages/Delivery';
import GoogleCallback from './pages/GoogleCallback';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/delivery/:orderId" element={<Delivery />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<div>Profile Page</div>} />
          <Route path="/orders" element={<div>Orders Page</div>} />
          <Route path="/discover" element={<div>Discover Page</div>} />
          <Route path="/wallet" element={<div>Wallet Page</div>} />
          <Route path="/notifications" element={<div>Notifications Page</div>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
      </Routes>
    </Router>
  );
};

export default App;