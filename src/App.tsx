import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import Delivery from './pages/Delivery';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-neutral">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/delivery/:orderId" element={<Delivery />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;