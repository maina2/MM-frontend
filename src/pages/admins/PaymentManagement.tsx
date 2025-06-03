// src/components/admin/PaymentManagement.tsx
import { useState, useCallback } from 'react';
import {
  useGetAdminPaymentsQuery,
  useUpdateAdminPaymentMutation,
  useDeleteAdminPaymentMutation,
} from '../../api/apiSlice';
import {
  Edit3,// Lucide icon for Edit
  Trash2, // Lucide icon for Delete
  Save, // Lucide icon for Save
  X // Lucide icon for Close
} from 'lucide-react'; // Import Lucide icons
import { Payment } from '../../types';
import { format } from 'date-fns';

const statusOptions = ['pending', 'successful', 'failed', 'cancelled'];

const PaymentManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [sortModel, setSortModel] = useState<any>([]); // Simplified sort model type
  const [formData, setFormData] = useState({
    status: '',
    phone_number: '',
  });
  const [formError, setFormError] = useState('');

  const { data: paymentsData, isLoading, error } = useGetAdminPaymentsQuery({
    page,
    status: statusFilter || undefined,
    search: search || undefined,
    ordering: sortModel[0] ? `${sortModel[0].sort === 'desc' ? '-' : ''}${sortModel[0].field}` : undefined,
  });
  const [updatePayment, { isLoading: isUpdating }] = useUpdateAdminPaymentMutation();
  const [deletePayment] = useDeleteAdminPaymentMutation();

  const handleEdit = useCallback((payment: Payment) => {
    setEditPayment(payment);
    setFormData({
      status: payment.status,
      phone_number: payment.phone_number,
    });
    setOpenModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Delete this payment?')) {
      try {
        await deletePayment(id).unwrap();
        alert('Payment deleted successfully!');
      } catch {
        alert('Failed to delete payment');
      }
    }
  }, [deletePayment]);

  const handleModalClose = useCallback(() => {
    setOpenModal(false);
    setFormError('');
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');

      if (!formData.status) {
        setFormError('Status is required');
        return;
      }
      if (formData.phone_number && !/^\+2547[0-9]{8}$/.test(formData.phone_number)) {
        setFormError('Phone number must be in format +2547XXXXXXXX');
        return;
      }

      const payload = {
        status: formData.status,
        phone_number: formData.phone_number || undefined,
      };

      try {
        if (editPayment) {
          await updatePayment({ id: editPayment.id, ...payload }).unwrap();
          alert('Payment updated successfully!');
        }
        handleModalClose();
      } catch (err: any) {
        setFormError(err.data?.detail || 'Failed to update payment');
      }
    },
    [formData, editPayment, updatePayment, handleModalClose]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value || '');
    setPage(1);
  }, []);

  // Simplified sorting for demonstration; a full DataGrid replacement would be complex
  const handleSortModelChange = useCallback((model: any) => {
    setSortModel(model);
    setPage(1);
  }, []);

  if (isLoading || !paymentsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h.01M17 9h2a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-1M7 9h10"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by Order ID or Phone"
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-3">
            <svg
              className="text-gray-500 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
              />
            </svg>
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table/Grid */}
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {(error as any).data?.detail || 'Failed to fetch payments'}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentsData.results.map((payment: Payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  {/* Removed the circular amount display */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      Payment for Order ID: {payment.order.id}
                    </h3>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    ${Number(payment.amount).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2 mb-4 text-gray-600">
                  <p className="text-sm font-medium">
                    Phone: <span className="font-normal">{payment.phone_number}</span>
                  </p>
                  <p className="text-sm font-medium">
                    Status: <span className="font-normal capitalize">{payment.status}</span>
                  </p>
                  <p className="text-sm font-medium">
                    Date: <span className="font-normal">{format(new Date(payment.created_at), 'MM/dd/yyyy')}</span>
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(payment)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Payment"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(payment.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Payment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {paymentsData.count > 12 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 mx-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-lg">
              {page}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page * 12 >= paymentsData.count}
              className="px-4 py-2 mx-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            style={{ marginTop: "10vh" }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Payment</h2>
              <button
                onClick={handleModalClose}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              >
                <option value="">Select Status</option>
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Phone Number (+2547XXXXXXXX)"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUpdating}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;