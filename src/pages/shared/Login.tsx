import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const generateCryptoRandomState = () => {
  const randomValues = new Uint8Array(16);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const callbackError = location.state?.error;
  const state = generateCryptoRandomState();
  sessionStorage.setItem("oauth_state", state);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/login/",
        {
          username,
          password,
        }
      );
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.access,
        })
      );
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid username or password");
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    redirect_uri: "http://localhost:5173/auth/google/callback",
    scope: "openid email profile",
    ux_mode: "redirect",
    state: state,
    onSuccess: (response) => {
      console.log("Google login success:", response);
    },
    onError: () => {
      console.log("Google login failed");
      setError("Google login failed");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-neutral p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-dark text-center mb-6">
          Welcome Back
        </h1>
        {(error || callbackError) && (
          <div className="bg-error/10 text-error p-3 rounded-lg mb-4 text-center">
            {error || callbackError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-dark"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-dark"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-dark/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg transition-all duration-300"
          >
            Log In
          </button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-dark/60">
                Or continue with
              </span>
            </div>
          </div>
          <button
            onClick={() => googleLogin()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-neutral text-dark py-3 rounded-lg border border-dark/20 hover:bg-neutral/80 hover:shadow-md transition-all duration-300"
          >
            <FcGoogle size={24} />
            Sign in with Google
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-dark/60">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
