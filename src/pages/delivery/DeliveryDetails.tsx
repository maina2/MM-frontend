import React, { useState } from 'react';
import { ArrowLeft, MapPin, Package, Clock, User, DollarSign, Truck, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

// Mock data for demonstration
const mockDelivery = {
  id: 1,
  status: 'in_transit',
  delivery_address: '123 Main Street, Downtown City, NY 10001',
  estimated_delivery_time: '2024-12-15T14:30:00Z',
  actual_delivery_time: null,
  latitude: 40.7128,
  longitude: -74.0060,
  order: {
    id: 12345,
    total_amount: 89.97,
    customer: {
      username: 'john_doe'
    },
    items: [
      {
        product: {
          id: 1,
          name: 'Premium Wireless Headphones',
          price: 59.99
        },
        quantity: 1
      },
      {
        product: {
          id: 2,
          name: 'Phone Case',
          price: 14.99
        },
        quantity: 2
      }
    ]
  }
};

const DeliveryDetails = () => {
  const [newStatus, setNewStatus] = useState('');
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const delivery = mockDelivery;

  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50', 
      borderColor: 'border-yellow-200',
      label: 'Pending'
    },
    assigned: { 
      icon: User, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      label: 'Assigned'
    },
    in_transit: { 
      icon: Truck, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50', 
      borderColor: 'border-purple-200',
      label: 'In Transit'
    },
    delivered: { 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-200',
      label: 'Delivered'
    },
    cancelled: { 
      icon: XCircle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      label: 'Cancelled'
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', disabled: true },
    { value: 'assigned', label: 'Assigned', disabled: delivery?.status !== 'pending' },
    { value: 'in_transit', label: 'In Transit', disabled: delivery?.status !== 'assigned' },
    { value: 'delivered', label: 'Delivered', disabled: delivery?.status !== 'in_transit' },
    { value: 'cancelled', label: 'Cancelled', disabled: !['pending', 'assigned', 'in_transit'].includes(delivery?.status || '') },
  ];

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === delivery?.status) {
      setUpdateError('Please select a different status.');
      return;
    }
    
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUpdateSuccess('Status updated successfully.');
      setNewStatus('');
    } catch (err) {
      setUpdateError('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatPrice = (value) => {
    if (value == null) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
  };

  const currentStatus = statusConfig[delivery.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Tasks</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Delivery Details</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`${currentStatus.bgColor} ${currentStatus.borderColor} border-2 rounded-2xl p-6 mb-8 shadow-sm`}>
          <div className="flex items-center space-x-4">
            <div className={`${currentStatus.color} p-3 rounded-full bg-white shadow-sm`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order #{delivery.order.id}</h2>
              <p className={`text-lg font-semibold ${currentStatus.color}`}>
                Status: {currentStatus.label}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Order Information</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-500">Order ID</span>
                      <span className="font-bold text-gray-900">#{delivery.order.id}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-sm font-medium text-gray-500">Customer</span>
                      <span className="font-bold text-gray-900">{delivery.order.customer?.username || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="text-center">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-green-700 font-medium">Total Amount</p>
                      <p className="text-3xl font-bold text-green-800">{formatPrice(delivery.order.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <h4 className="text-lg font-bold text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {delivery.order.items?.length ? (
                    delivery.order.items.map((item) => {
                      const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
                      const subtotal = isNaN(price) ? 0 : price * item.quantity;
                      return (
                        <div key={item.product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{item.product.name}</h5>
                            <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatPrice(item.product.price)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">{formatPrice(subtotal)}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No items found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Delivery Information</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Delivery Address</p>
                    <p className="font-semibold text-gray-900">{delivery.delivery_address}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-700">Estimated Delivery</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(delivery.estimated_delivery_time)}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-green-700">Actual Delivery</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatDate(delivery.actual_delivery_time)}</p>
                  </div>
                </div>

                {/* Map placeholder */}
                {delivery.latitude != null && delivery.longitude != null && (
                  <div className="mt-6">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-8 text-center border border-blue-200">
                      <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Delivery Location</h4>
                      <p className="text-gray-600 mb-4">Coordinates: {delivery.latitude.toFixed(4)}, {delivery.longitude.toFixed(4)}</p>
                      <div className="text-sm text-gray-500 bg-white/50 rounded-lg p-3">
                        Interactive map would be displayed here with delivery location marker
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status Update */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Update Status</h3>
              </div>
              
              <div className="p-6">
                {updateError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-800 font-medium">{updateError}</p>
                    </div>
                  </div>
                )}
                
                {updateSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 font-medium">{updateSuccess}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={handleStatusChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Choose status...</option>
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || !newStatus}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update Status'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Items</span>
                  <span className="font-semibold">{delivery.order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Weight</span>
                  <span className="font-semibold">2.1 kg</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-semibold">12.5 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetails;