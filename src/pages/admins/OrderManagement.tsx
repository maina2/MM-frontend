
import React, { useState, useCallback } from 'react';
import {
  useGetAdminOrdersQuery,
  useCreateAdminOrderMutation,
  useUpdateAdminOrderMutation,
  useDeleteAdminOrderMutation,
  useGetAdminProductsQuery,
  useGetAdminBranchesQuery,
} from '../../api/apiSlice';
import { Edit3, Trash2, Plus, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { Order, Product, Branch } from '../../types';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const pageSize = 12;

const OrderManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<{
    status: string;
    payment_phone_number: string;
    items: { id?: string; product_id: string; quantity: string }[];
    branch_name: string;
  }>({
    status: '',
    payment_phone_number: '',
    items: [{ product_id: '', quantity: '' }],
    branch_name: '',
  });
  const [formError, setFormError] = useState<string | { [key: string]: string[] }>('');

  const { data: ordersData, isLoading, error } = useGetAdminOrdersQuery({
    page,
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const { data: productsData, isLoading: areProductsLoading } = useGetAdminProductsQuery({});
  const { data: branchesData, isLoading: areBranchesLoading } = useGetAdminBranchesQuery({});
  const [createOrder, { isLoading: isCreating }] = useCreateAdminOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateAdminOrderMutation();
  const [deleteOrder] = useDeleteAdminOrderMutation();

  const handleEdit = useCallback((order: Order) => {
    setEditOrder(order);
    setIsCreate(false);
    setFormData({
      status: order.status,
      payment_phone_number: order.payment_phone_number || '',
      items: order.items.map((item) => ({
        id: item.id.toString(),
        product_id: item.product.id.toString(),
        quantity: item.quantity.toString(),
      })),
      branch_name: order.branch, // branch is now string
    });
    setOpenModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (window.confirm('Delete this order?')) {
        try {
          await deleteOrder(id).unwrap();
          alert('Order deleted successfully!');
        } catch (err) {
          console.error('Delete error:', err);
          alert('Failed to delete order');
        }
      }
    },
    [deleteOrder]
  );

  const handleModalOpen = useCallback((create = false) => {
    setIsCreate(create);
    setEditOrder(null);
    setFormData({
      status: 'pending',
      payment_phone_number: '',
      items: [{ product_id: '', quantity: '' }],
      branch_name: '',
    });
    setOpenModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpenModal(false);
    setFormError('');
  }, []);

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
      const { name, value } = e.target;
      if (index !== undefined && name) {
        setFormData((prev) => {
          const newItems = [...prev.items];
          newItems[index] = { ...newItems[index], [name]: value };
          return { ...prev, items: newItems };
        });
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    },
    []
  );

  const handleAddItem = useCallback(() => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, { product_id: '', quantity: '' }] }));
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');

      if (!formData.status) {
        setFormError('Status is required');
        return;
      }
      if (formData.payment_phone_number && !/^\+2547[0-9]{8}$/.test(formData.payment_phone_number)) {
        setFormError('Phone number must be in format +2547XXXXXXXX');
        return;
      }
      if (formData.items.some((item) => !item.product_id || !item.quantity || Number(item.quantity) <= 0)) {
        setFormError('All items must have a valid product and quantity');
        return;
      }
      if (!formData.branch_name) {
        setFormError('Branch is required');
        return;
      }

      const selectedBranch = branchesData?.results.find((branch: Branch) => branch.name === formData.branch_name);
      if (!selectedBranch) {
        setFormError('Invalid branch selected');
        return;
      }

      try {
        if (isCreate) {
          const createPayload = {
            status: formData.status,
            payment_phone_number: formData.payment_phone_number || undefined,
            items: formData.items.map((item) => ({
              product_id: Number(item.product_id),
              quantity: Number(item.quantity),
            })),
            branch_id: selectedBranch.id,
          };
          await createOrder(createPayload).unwrap();
          alert('Order created successfully!');
        } else if (editOrder) {
          const updatePayload = {
            id: editOrder.id,
            status: formData.status,
            payment_phone_number: formData.payment_phone_number || undefined,
            items: formData.items.map((item) => ({
              id: item.id ? Number(item.id) : undefined,
              product_id: Number(item.product_id),
              quantity: Number(item.quantity),
            })),
            branch_id: selectedBranch.id,
          };
          await updateOrder(updatePayload).unwrap();
          alert('Order updated successfully!');
        }
        handleModalClose();
      } catch (err: any) {
        console.error('Submit error:', err);
        if (err.data && typeof err.data === 'object') {
          setFormError(err.data);
        } else {
          setFormError(err.data?.detail || 'Failed to save order');
        }
      }
    },
    [formData, isCreate, editOrder, createOrder, updateOrder, handleModalClose, branchesData]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value || '');
    setPage(1);
  }, []);

  if (isLoading || areProductsLoading || areBranchesLoading || !ordersData || !productsData || !branchesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            </div>
            <button
              onClick={() => handleModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Order</span>
            </button>
          </div>
        </div>
      </div>

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
              placeholder="Search orders..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-3">
            <svg className="text-gray-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {(error as any).data?.detail || 'Failed to fetch orders'}
          </div>
        )}
        {ordersData?.results?.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordersData?.results?.map((order: Order) => {
            const customerName =
              typeof order.customer?.username === 'string' && order.customer.username
                ? order.customer.username
                : 'Unknown';
            const initials =
              typeof order.customer?.username === 'string' && order.customer.username.length > 0
                ? order.customer.username.charAt(0).toUpperCase()
                : '?';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <h3 className="font-bold text-gray-900 text-base">{customerName}</h3>
                          <span className="text-xs text-gray-500">#{order.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-gray-600">
                    <p className="text-sm font-medium">
                      Total: <span className="font-normal">{Number(order.total_amount).toFixed(2)}</span>
                    </p>
                    <p className="text-sm font-medium">
                      Status: <span className="font-normal capitalize">{order.status}</span>
                    </p>
                    <p className="text-sm font-medium">
                      Date: <span className="font-normal">{format(new Date(order.created_at), 'MM/dd/yyyy')}</span>
                    </p>
                    {order.payment_phone_number && (
                      <p className="text-sm font-medium">
                        Phone: <span className="font-normal">{order.payment_phone_number}</span>
                      </p>
                    )}
                    {order.items?.length > 0 ? (
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">Items:</p>
                        <ul className="list-disc list-inside text-sm pl-2">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.product?.name || 'Unknown Product'} x {item.quantity} @ {Number(item.price).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-500">No items</p>
                    )}
                    <p className="text-sm font-medium">
                      Branch: <span className="font-normal">{order.branch || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Order"
                      disabled={isCreating || isUpdating}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Order"
                      disabled={isCreating || isUpdating}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {ordersData?.count > pageSize && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 mx-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-lg">{page}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page * pageSize >= ordersData.count}
              className="px-4 py-2 mx-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            style={{ marginTop: '10vh' }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{isCreate ? 'Create Order' : 'Edit Order'}</h2>
              <button
                onClick={handleModalClose}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                disabled={isCreating || isUpdating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {formError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg">
                    {typeof formError === 'string' ? (
                      formError
                    ) : (
                      Object.entries(formError).map(([key, errors]) => (
                        <p key={key}>{`${key}: ${errors.join(', ')}`}</p>
                      ))
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                    disabled={isCreating || isUpdating}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="payment_phone_number"
                    value={formData.payment_phone_number}
                    onChange={handleFormChange}
                    placeholder="Phone Number (+2547XXXXXXXX)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                  <select
                    name="branch_name"
                    value={formData.branch_name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                    disabled={isCreating || isUpdating}
                  >
                    <option value="">Select Branch</option>
                    {branchesData?.results?.map((branch: Branch) => (
                      <option key={branch.id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-800 mb-2">Order Items</p>
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 items-center mb-2 p-2 border border-gray-200 rounded-lg"
                    >
                      <select
                        name="product_id"
                        value={item.product_id}
                        onChange={(e) => handleFormChange(e, index)}
                        className="flex-1 w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                        required
                        disabled={isCreating || isUpdating}
                      >
                        <option value="">Select Product</option>
                        {productsData?.results?.map((product: Product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleFormChange(e, index)}
                        className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                        min="1"
                        required
                        disabled={isCreating || isUpdating}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={formData.items.length === 1 || isCreating || isUpdating}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center justify-end space-x-2 px-2 py-2 text-gray-600 rounded-lg transition-colors hover:bg-gray-50"
                    disabled={isCreating || isUpdating}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-2 py-2 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isCreate ? 'Create' : 'Update'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
