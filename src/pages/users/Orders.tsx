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
} from "react-icons/fi";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, isError, error } = useGetOrdersQuery(undefined, {
    skip: !token,
  });

  // State to manage collapsed items for each order
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-600 font-medium">
            Failed to load orders:{" "}
            {(error as any)?.data?.detail || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const ordersArray = Array.isArray(data?.results) ? data.results : [];

  if (ordersArray.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <FiPackage className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-2xl font-semibold text-gray-900">
            No orders yet
          </h3>
          <p className="mt-2 text-gray-500">
            Your order history will appear here once you make purchases.
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <FiXCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FiClock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Order History
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Showing {ordersArray.length} order
          {ordersArray.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-8">
        {ordersArray.map((order: Order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
                    <FiPackage className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span
                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-2">
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Items
                  </h4>
                  <button
                    onClick={() => toggleCollapse(order.id)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 E
                    rounded-md"
                    aria-expanded={!collapsedOrders[order.id]}
                    aria-controls={`items-${order.id}`}
                  >
                    {collapsedOrders[order.id] ? (
                      <>
                        <FiChevronDown className="h-5 w-5 mr-1" />
                        Show Items
                      </>
                    ) : (
                      <>
                        <FiChevronUp className="h-5 w-5 mr-1" />
                        Hide Items
                      </>
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {!collapsedOrders[order.id] && (
                    <motion.div
                      id={`items-${order.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                {item.product.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <FiPackage className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} × KSh{" "}
                                  {parseFloat(item.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900">
                              KSh{" "}
                              {(parseFloat(item.price) * item.quantity).toFixed(
                                2
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Payment
                    </h4>
                    <div className="flex items-center">
                      <FiDollarSign className="h-4 w-4 text-gray-400 mr-1.5" />
                      <span
                        className={`text-sm font-medium ${
                          order.payment_status === "paid"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {order.payment_status.charAt(0).toUpperCase() +
                          order.payment_status.slice(1)}
                      </span>
                    </div>
                    {order.payment_phone_number && (
                      <div className="flex items-center mt-1.5">
                        <FiPhone className="h-4 w-4 text-gray-400 mr-1.5" />
                        <span className="text-xs text-gray-600">
                          {order.payment_phone_number}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Order Total
                    </h4>
                    <p className="text-xl font-bold text-gray-900">
                      KSh {parseFloat(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
