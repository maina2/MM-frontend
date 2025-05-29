// src/components/admin/DeliveryManagement.tsx
import { useState, useCallback } from 'react';
import {
  useGetAdminDeliveriesQuery,
  useCreateAdminDeliveryMutation,
  useAssignDeliveryPersonMutation,
  useUpdateDeliveryStatusMutation,
  useDeleteAdminDeliveryMutation,
  useGetAdminUsersQuery,
} from '../../api/apiSlice';
import { Delivery, User } from '../../types';
import { format } from 'date-fns';
import {
  Plus, // Lucide icon for Add
  Trash2, // Lucide icon for Delete
  UserPlus, // Lucide icon for PersonAdd
  RefreshCw, // Lucide icon for Sync
  X, // Lucide icon for Close
  Save // Lucide icon for Save
} from 'lucide-react'; // Import Lucide icons

const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_transit':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const shortenAddress = (address: string): string => {
  const words = address.trim().split(' ');
  // Take first 3 words or full address if shorter, to ensure enough context
  const shortAddress = words.slice(0, 3).join(' ');
  return words.length > 3 ? `${shortAddress}...` : shortAddress;
};

const DeliveryManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortModel, setSortModel] = useState<any>([]); // Simplified for Tailwind UI, as DataGrid's sortModel is specific
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<number | null>(null);

  const [newDelivery, setNewDelivery] = useState({
    order_id: '',
    delivery_person_id: '',
    delivery_address: '',
    latitude: '',
    longitude: '',
  });

  // State to manage selected values for assignment/status update modals
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');


  const {
    data: deliveriesData,
    isLoading: isDeliveriesLoading,
    error: deliveriesError,
  } = useGetAdminDeliveriesQuery({
    page,
    page_size: pageSize,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    ordering: sortModel[0] ? `${sortModel[0].sort === 'desc' ? '-' : ''}${sortModel[0].field}` : undefined,
  });

  const { data: deliveryPersonsData } = useGetAdminUsersQuery({
    page: 1,
    page_size: 100,
    role: 'delivery'
  });

  // Corrected RTK Query hook destructuring
  const [createDelivery, { isLoading: isCreating }] = useCreateAdminDeliveryMutation();
  const [deleteDelivery] = useDeleteAdminDeliveryMutation(); // Corrected destructuring
  const [assignDeliveryPerson, { isLoading: isAssigning }] = useAssignDeliveryPersonMutation(); // Corrected destructuring
  const [updateDeliveryStatus, { isLoading: isStatusUpdating }] = useUpdateDeliveryStatusMutation(); // Corrected destructuring

  const availableDeliveryPersons = deliveryPersonsData?.results || [];

  const handleCreateDeliveryChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDelivery((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCreateDeliverySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        order_id: parseInt(newDelivery.order_id),
        delivery_person_id: newDelivery.delivery_person_id
          ? parseInt(newDelivery.delivery_person_id)
          : undefined,
        delivery_address: newDelivery.delivery_address,
        latitude: newDelivery.latitude ? parseFloat(newDelivery.latitude) : undefined,
        longitude: newDelivery.longitude ? parseFloat(newDelivery.longitude) : undefined,
      };
      await createDelivery(payload).unwrap();
      alert('Delivery created successfully!'); // Replaced toast with alert for consistency with refactored components
      setShowCreateModal(false);
      setNewDelivery({ order_id: '', delivery_person_id: '', delivery_address: '', latitude: '', longitude: '' });
    } catch (error: any) {
      alert(`Failed to create delivery: ${error?.data?.detail || 'Unknown error'}`);
    }
  }, [newDelivery, createDelivery]);

  const handleAssignDeliveryPersonSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal || !selectedDeliveryPersonId) return;

    try {
      await assignDeliveryPerson({ id: showAssignModal, delivery_person_id: parseInt(selectedDeliveryPersonId) }).unwrap();
      alert('Delivery person assigned successfully!');
      setShowAssignModal(null);
      setSelectedDeliveryPersonId(''); // Clear selection
    } catch (error: any) {
      alert(`Failed to assign delivery person: ${error?.data?.detail || 'Unknown error'}`);
    }
  }, [showAssignModal, selectedDeliveryPersonId, assignDeliveryPerson]);

  const handleUpdateStatusSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStatusModal || !selectedStatus) return;

    try {
      await updateDeliveryStatus({ id: showStatusModal, status: selectedStatus }).unwrap();
      alert('Delivery status updated successfully!');
      setShowStatusModal(null);
      setSelectedStatus(''); // Clear selection
    } catch (error: any) {
      alert(`Failed to update status: ${error?.data?.detail || 'Unknown error'}`);
    }
  }, [showStatusModal, selectedStatus, updateDeliveryStatus]);

  const handleDeleteDelivery = useCallback(async (deliveryId: number, currentStatus: string) => {
    if (currentStatus !== 'pending' && currentStatus !== 'cancelled') {
      alert('Only deliveries with "pending" or "cancelled" status can be deleted.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
      try {
        await deleteDelivery(deliveryId).unwrap();
        alert('Delivery deleted successfully!');
      } catch (error: any) {
        alert(`Failed to delete delivery: ${error?.data?.detail || 'Unknown error'}`);
      }
    }
  }, [deleteDelivery]);

  const handleSortChange = useCallback((field: string) => {
    setSortModel((prevModel: any) => {
      const isAsc = prevModel.length > 0 && prevModel[0].field === field && prevModel[0].sort === 'asc';
      return isAsc ? [{ field, sort: 'desc' }] : [{ field, sort: 'asc' }];
    });
    setPage(1); // Reset page on sort change
  }, []);


  if (isDeliveriesLoading && !deliveriesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define table columns based on the original DataGrid structure
  const tableColumns = [
    { name: 'ID', field: 'id', sortable: true },
    { name: 'Order ID', field: 'order.id', sortable: false, render: (row: Delivery) => row.order.id },
    { name: 'Delivery Person', field: 'delivery_person.username', sortable: false, render: (row: Delivery) => row.delivery_person ? row.delivery_person.username : 'Unassigned' },
    { name: 'Status', field: 'status', sortable: true, render: (row: Delivery) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColorClass(row.status)}`}>
        {row.status.replace(/_/g, ' ')}
      </span>
    )},
    { name: 'Address', field: 'delivery_address', sortable: true, render: (row: Delivery) => (
      <span title={row.delivery_address} className="truncate max-w-[200px] inline-block">
        {shortenAddress(row.delivery_address)}
      </span>
    )},
    { name: 'Est. Delivery', field: 'estimated_delivery_time', sortable: true, render: (row: Delivery) => (
      <span>
        {row.estimated_delivery_time ? format(new Date(row.estimated_delivery_time), 'PPp') : 'N/A'}
      </span>
    )},
    { name: 'Actions', field: 'actions', sortable: false, render: (row: Delivery) => (
      <div className="flex space-x-2">
        <button
          onClick={() => { setShowAssignModal(row.id); setSelectedDeliveryPersonId(row.delivery_person?.id?.toString() || ''); }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Assign Delivery Person"
          disabled={isAssigning}
        >
          <UserPlus className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setShowStatusModal(row.id); setSelectedStatus(row.status); }}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Update Status"
          disabled={isStatusUpdating}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteDelivery(row.id, row.status)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete Delivery"
          disabled={row.status !== 'pending' && row.status !== 'cancelled'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )},
  ];


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
                    d="M9 17v-2m3 2v-4m3 4v-6m2 2h2m-2-2h2m-2 4h2M12 6V4m0 2a2 2 0 100 4 2 2 0 000-4zM19 12a7 7 0 10-14 0 7 7 0 0014 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar (Filters and Create Button) */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
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
            placeholder="Search by Address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Create Delivery</span>
        </button>
      </div>

      {/* Deliveries Table (using a custom table structure) */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {deliveriesError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg m-4">
            {(deliveriesError as any).data?.detail || 'Failed to fetch deliveries'}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                {tableColumns.map((col) => (
                  <th
                    key={col.field}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:bg-indigo-700' : ''}`}
                    onClick={() => col.sortable && handleSortChange(col.field)}
                  >
                    <div className="flex items-center">
                      {col.name}
                      {sortModel[0]?.field === col.field && (
                        <span className="ml-2">
                          {sortModel[0]?.sort === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isDeliveriesLoading ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : deliveriesData?.results.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="px-6 py-4 text-center text-gray-500">
                    No deliveries found.
                  </td>
                </tr>
              ) : (
                deliveriesData?.results.map((delivery: Delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                    {tableColumns.map((col) => (
                      <td key={col.field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {col.render ? col.render(delivery) : (delivery as any)[col.field]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {deliveriesData && deliveriesData.count > pageSize && (
          <div className="flex justify-center items-center py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 mx-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 mx-1 bg-blue-600 text-white rounded-lg text-sm">
              {page}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page * pageSize >= deliveriesData.count}
              className="px-4 py-2 mx-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>


      {/* Create Delivery Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            style={{ marginTop: "10vh" }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Create New Delivery</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDeliverySubmit} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <input
                type="number"
                name="order_id"
                placeholder="Order ID"
                value={newDelivery.order_id}
                onChange={handleCreateDeliveryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
              <select
                name="delivery_person_id"
                value={newDelivery.delivery_person_id}
                onChange={handleCreateDeliveryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Unassigned Delivery Person</option>
                {availableDeliveryPersons.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="delivery_address"
                placeholder="Delivery Address"
                value={newDelivery.delivery_address}
                onChange={handleCreateDeliveryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              />
              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="Latitude (Optional)"
                value={newDelivery.latitude}
                onChange={handleCreateDeliveryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="Longitude (Optional)"
                value={newDelivery.longitude}
                onChange={handleCreateDeliveryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <div className="flex justify-end space-x-3 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Delivery Person Dialog */}
      {!!showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            style={{ marginTop: "10vh" }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Assign Delivery Person</h2>
              <button
                onClick={() => setShowAssignModal(null)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignDeliveryPersonSubmit} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <select
                name="delivery_person_id"
                value={selectedDeliveryPersonId}
                onChange={(e) => setSelectedDeliveryPersonId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              >
                <option value="">Select Delivery Person</option>
                {availableDeliveryPersons.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-3 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  {isAssigning ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Assign</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      {!!showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            style={{ marginTop: "10vh" }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Update Delivery Status</h2>
              <button
                onClick={() => setShowStatusModal(null)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatusSubmit} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <select
                name="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              >
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex justify-end space-x-3 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStatusUpdating}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  {isStatusUpdating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update</span>
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

export default DeliveryManagement;