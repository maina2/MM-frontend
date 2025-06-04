import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetOrdersQuery } from "../../api/apiSlice";
import { RootState } from "../../store/store";
import { motion, AnimatePresence } from "framer-motion";
import { Order } from "../../types";
import {
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiDollarSign,
  FiPhone,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiShoppingBag,
} from "react-icons/fi";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, isError, error } = useGetOrdersQuery(undefined, {
    skip: !token,
  });

  // Debug the raw data
  useEffect(() => {
    console.log("Raw orders data:", JSON.stringify(data, null, 2));
  }, [data]);

  const [collapsedOrders, setCollapsedOrders] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const toggleCollapse = (orderId: number) => {
    setCollapsedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      }),
      time: date.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    };
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-32 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <FiXCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Error loading orders</h3>
              <p className="text-sm text-red-600 mt-1">
                {(error as any)?.data?.detail || "Something went wrong"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle paginated response
  const ordersArray = Array.isArray(data) ? data : (data as any)?.results || [];

  if (ordersArray.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
            <FiShoppingBag className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">
            No orders yet
          </h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            Your order history will appear here once you make your first purchase.
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <FiCheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <FiXCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FiClock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Order History
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {ordersArray.length} order{ordersArray.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ordersArray.map((order: Order, index: number) => {
          const { date, time } = formatDate(order.created_at);
          const isCollapsed = collapsedOrders[order.id];
          
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeOut",
                delay: index * 0.1 
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FiPackage className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Order #{order.id}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <FiCalendar className="h-3 w-3 mr-1" />
                        {date} • {time}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1.5">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </span>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      KSh {formatPrice(order.total_amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="p-5">
                <button
                  onClick={() => toggleCollapse(order.id)}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg p-2 -m-2 transition-colors"
                  aria-expanded={!isCollapsed}
                >
                  <span>Order Items</span>
                  {isCollapsed ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronUp className="h-4 w-4" />
                  )}
                </button>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {order.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                {item.product.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <FiPackage className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.quantity} × KSh {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm ml-2">
                              KSh {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <FiDollarSign className="h-3 w-3 mr-1" />
                      <span className={`font-medium ${
                        order.payment_status === "successful" 
                          ? "text-green-700" 
                          : "text-amber-700"
                      }`}>
                        {order.payment_status.charAt(0).toUpperCase() + 
                         order.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {order.payment_phone_number && (
                    <div className="flex items-center text-xs text-gray-600">
                      <FiPhone className="h-3 w-3 mr-1" />
                      <span>{order.payment_phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;