import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // Add this

  // Check for errors passed from GoogleCallback
  const callbackError = location.state?.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        username,
        password,
      });
      dispatch(setCredentials({ user: response.data.user, token: response.data.access }));
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-4 text-dark">Login</h1>
      {error && <p className="text-accent">{error}</p>}
      {callbackError && <p className="text-accent">{callbackError}</p>} {/* Display callback errors */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-dark mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-dark mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-green-700"
        >
          Login
        </button>
      </form>
      <div className="mt-4">
        <GoogleLogin
          onSuccess={(response) => {
            console.log('Google login success:', response);
          }}
          onError={() => {
            console.log('Google login failed');
            setError('Google login failed');
          }}
          flow="auth-code"
          redirect_uri="http://localhost:5173/auth/google/callback"
          scope="openid email profile"
          ux_mode="redirect"
        />
      </div>
    </div>
  );
};

export default Login;