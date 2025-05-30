import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  User, 
  Truck, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useGetDeliveryTasksQuery } from '../../api/apiSlice';
import { Delivery } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const DeliveryTasks = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1); // 1-based for backend
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Get user from Redux store and redirect if not a delivery user
  const user = useSelector((state: RootState) => state.auth.user);
  if (!user || user.role !== 'delivery') {
    navigate('/unauthorized');
    return null;
  }

  // Fetch delivery tasks with pagination parameters
  const { data, isLoading, isError, error } = useGetDeliveryTasksQuery({
    page,
    page_size: rowsPerPage,
  });

  // Extract deliveries and total count from API response
  const deliveries = data?.results || [];
  const totalCount = data?.count || 0;

  // Filter deliveries by status
  const filteredDeliveries = statusFilter === 'all'
    ? deliveries
    : deliveries.filter((delivery: Delivery) => delivery.status === statusFilter);

  // Status configuration
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

  // Handle pagination
  const handleChangePage = (newPage: number) => {
    setPage(newPage + 1); // Convert to 1-based for backend
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1); // Reset pagination
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your delivery tasks...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = (error as any)?.data?.error || 'Failed to load deliveries. Please try again.';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Tasks</h2>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);
  const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">My Delivery Tasks</h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome back, <span className="font-semibold text-gray-900">{user?.username}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Filter Tasks</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {['all', 'pending', 'assigned', 'in_transit', 'delivered', 'cancelled'].map((status) => {
              const isActive = statusFilter === status;
              const config = status === 'all' ? null : statusConfig[status];
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all transform hover:scale-105 ${
                    isActive
                      ? status === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : `${config?.bgColor} ${config?.color} ${config?.borderColor} border-2 shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Tasks' : config?.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks Grid */}
        {paginatedDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Delivery Tasks Found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? "You don't have any delivery tasks yet." 
                : `No ${statusConfig[statusFilter]?.label?.toLowerCase()} tasks found.`}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedDeliveries.map((delivery: Delivery) => {
                const statusInfo = statusConfig[delivery.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={delivery.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Status Header */}
                    <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-b-2 p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`${statusInfo.color} p-2 rounded-full bg-white shadow-sm`}>
                            <StatusIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Order</p>
                            <p className="text-lg font-bold text-gray-900">#{delivery.order.id}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color} bg-white`}>
                          {statusInfo.label}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {delivery.delivery_address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {formatDate(delivery.estimated_delivery_time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Customer</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {delivery.order.customer?.username || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => navigate(`/delivery/${delivery.id}`)}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
                  <span className="font-semibold text-gray-900">{totalCount}</span> tasks
                </div>

                <div className="flex items-center space-x-4">
                  {/* Rows per page selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => handleChangeRowsPerPage(parseInt(e.target.value, 10))}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={3}>3</option>
                      <option value={6}>6</option>
                      <option value={9}>9</option>
                    </select>
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleChangePage(page - 2)} // Convert to 0-based for previous page
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        const isActive = pageNum === page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleChangePage(pageNum - 1)} // Convert to 0-based
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleChangePage(page)} // Convert to 0-based for next page
                      disabled={page >= totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryTasks;