import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/authSlice";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi";
import { Mail, Lock, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
// Configure axios for credentials
axios.defaults.withCredentials = true;

const generateCryptoRandomState = () => {
  const randomValues = new Uint8Array(16);
  window.crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const callbackError = location.state?.error;

  // Generate and store OAuth state
  const [oauthState] = useState(() => {
    let storedState = sessionStorage.getItem("oauth_state");
    if (!storedState) {
      storedState = generateCryptoRandomState();
      sessionStorage.setItem("oauth_state", storedState);
    }
    return storedState;
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://mm-backend-8rp8.onrender.com/api/users/login/",
        { username, password }
      );
      const user = response.data.user;
      dispatch(
        setCredentials({
          user,
          token: response.data.access,
        })
      );
      if (user.role === "customer") navigate("/home");
      else if (user.role === "admin") navigate("/admin");
      else if (user.role === "delivery") navigate("/delivery/tasks");
      else navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data?.detail ||
            err.response.data?.error ||
            "Invalid username or password."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    redirect_uri: "https://mm-backend-8rp8.onrender.com/auth/google/callback/",
    scope: "openid email profile",
    ux_mode: "redirect",
    state: oauthState,
    onSuccess: () => {
      console.log("Google login initiated");
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      setError("Google login failed. Please try again.");
    },
  });

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      console.log("Storing OAuth state:", oauthState);

      // Store state in backend session
      const stateResponse = await axios.post(
        "https://mm-backend-8rp8.onrender.com/store-state/",
        { state: oauthState },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("State stored successfully:", stateResponse.data);

      // Small delay to ensure state is stored
      setTimeout(() => {
        googleLogin(); // Initiate OAuth flow
      }, 100);
    } catch (error) {
      console.error("Failed to store state:", error);
      setError("Failed to initiate Google login. Please try again.");
      setIsLoading(false);
    }
  };

  // Animation variants
  const formContainerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeInOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginBottom: "1rem",
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      transition: { duration: 0.2 },
    },
  };

  const decorativeSideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 },
    },
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Left Column: Form Area */}
      <motion.div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6"
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 max-h-full overflow-y-auto">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center mb-4"
          >
            <LogIn className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          </motion.div>

          <AnimatePresence>
            {(error || callbackError) && (
              <motion.div
                key="error-message"
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2"
              >
                <FiAlertTriangle className="text-red-600" size={16} />
                <span>{error || callbackError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants} className="relative">
              <label
                htmlFor="username"
                className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-600 transition-all duration-200"
              >
                Username
              </label>
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <label
                htmlFor="password"
                className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-gray-600 transition-all duration-200"
              >
                Password
              </label>
              <div className="flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-sm"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-right text-xs">
              <a
                href="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
              >
                Forgot Password?
              </a>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={
                !isLoading
                  ? {
                      scale: 1.01,
                      boxShadow: "0px 8px 20px rgba(59, 130, 246, 0.25)",
                    }
                  : {}
              }
              whileTap={!isLoading ? { scale: 0.99 } : {}}
            >
              <LogIn size={16} />
              {isLoading ? "Signing In..." : "Log In"}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-6">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">
                  Or sign in with
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2 rounded-xl font-semibold text-gray-900 hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={
                !isLoading
                  ? {
                      scale: 1.01,
                      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.05)",
                    }
                  : {}
              }
              whileTap={!isLoading ? { scale: 0.99 } : {}}
            >
              <FcGoogle size={18} />
              {isLoading ? "Connecting..." : "Sign in with Google"}
            </motion.button>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-4 text-center text-xs text-gray-600"
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200"
            >
              Sign up
            </Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Right side decoration */}
      <motion.div
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-600 items-center justify-center p-8 text-white relative overflow-hidden max-h-full"
        variants={decorativeSideVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center z-10">
          <motion.h2
            className="text-3xl font-bold mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Shop Smart with Muhindi Mweusi
          </motion.h2>
          <motion.p
            className="text-base text-white/80 mb-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Discover unbeatable prices and a wide range of products at Muhindi
            Mweusi Supermarkets, Nairobi's trusted retailer. From Embakasi to
            Mukuru kwa Njenga, our 13 stores offer quality household goods,
            fresh bakery items, electronics, and more, empowering
            budget-conscious shoppers every day.
          </motion.p>
          <motion.div
            className="mt-6 space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-white/50"></span>
            <span className="inline-block h-2 w-2 rounded-full bg-white/70"></span>
            <span className="inline-block h-2 w-2 rounded-full bg-white"></span>
          </motion.div>
        </div>
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full filter blur-xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        ></motion.div>
        <motion.div
          className="absolute -bottom-20 -right-10 w-80 h-80 bg-white/10 rounded-lg transform rotate-45 filter blur-xl"
          animate={{ scale: [1, 1.05, 1], rotate: [0, -10, 0] }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5,
          }}
        ></motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
