import { useState, useCallback } from "react";
import {
  useGetAdminDeliveriesQuery,
  useCreateAdminDeliveryMutation,
  useAssignDeliveryPersonMutation,
  useUpdateDeliveryStatusMutation,
  useDeleteAdminDeliveryMutation,
  useGetAdminUsersQuery,
} from "../../api/apiSlice";
import { Delivery, User } from "../../types";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  UserPlus,
  RefreshCw,
  X,
  ArrowUpDown,
} from "lucide-react";

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "in_transit":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const shortenAddress = (address: string): string => {
  const words = address.trim().split(" ");
  const shortAddress = words.slice(0, 3).join(" ");
  return words.length > 3 ? `${shortAddress}...` : shortAddress;
};

const DeliveryManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortModel, setSortModel] = useState<
    { field: string; sort: "asc" | "desc" }[]
  >([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<number | null>(null);

  const [newDelivery, setNewDelivery] = useState({
    order_id: "",
    delivery_person_id: "",
    delivery_address: "",
    latitude: "",
    longitude: "",
  });

  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const {
    data: deliveriesData,
    isLoading: isDeliveriesLoading,
    error: deliveriesError,
  } = useGetAdminDeliveriesQuery({
    page,
    page_size: pageSize,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    ordering: sortModel[0]
      ? `${sortModel[0].sort === "desc" ? "-" : ""}${sortModel[0].field}`
      : undefined,
  });

  const {
    data: deliveryPersonsData,
    isLoading: isDeliveryPersonsLoading,
    error: deliveryPersonsError,
  } = useGetAdminUsersQuery({
    page: 1,
    page_size: 100,
    role: "delivery",
  });

  const [createDelivery, { isLoading: isCreating }] = useCreateAdminDeliveryMutation();
  const [deleteDelivery] = useDeleteAdminDeliveryMutation();
  const [assignDeliveryPerson, { isLoading: isAssigning }] = useAssignDeliveryPersonMutation();
  const [updateDeliveryStatus, { isLoading: isStatusUpdating }] = useUpdateDeliveryStatusMutation();

  const availableDeliveryPersons = deliveryPersonsData?.results.filter(user => user.role === "delivery") || [];

  const handleCreateDeliveryChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setNewDelivery((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleCreateDeliverySubmit = useCallback(
    async (e: React.FormEvent) => {
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
        alert("Delivery created successfully!");
        setShowCreateModal(false);
        setNewDelivery({
          order_id: "",
          delivery_person_id: "",
          delivery_address: "",
          latitude: "",
          longitude: "",
        });
      } catch (error: any) {
        alert(`Failed to create delivery: ${error?.data?.detail || "Unknown error"}`);
      }
    },
    [newDelivery, createDelivery]
  );

  const handleAssignDeliveryPersonSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!showAssignModal || !selectedDeliveryPersonId) {
        alert("Please select a delivery person.");
        return;
      }

      try {
        await assignDeliveryPerson({
          id: showAssignModal,
          delivery_person_id: parseInt(selectedDeliveryPersonId),
        }).unwrap();
        alert("Delivery person assigned successfully!");
        setShowAssignModal(null);
        setSelectedDeliveryPersonId("");
      } catch (error: any) {
        alert(
          `Failed to assign delivery person: ${
            error?.data?.error || error?.data?.detail || "Unknown error"
          }`
        );
      }
    },
    [showAssignModal, selectedDeliveryPersonId, assignDeliveryPerson]
  );

  const handleUpdateStatusSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!showStatusModal || !selectedStatus) {
        alert("Please select a status.");
        return;
      }

      try {
        await updateDeliveryStatus({
          id: showStatusModal,
          status: selectedStatus,
        }).unwrap();
        alert("Delivery status updated successfully!");
        setShowStatusModal(null);
        setSelectedStatus("");
      } catch (error: any) {
        alert(`Failed to update status: ${error?.data?.detail || "Unknown error"}`);
      }
    },
    [showStatusModal, selectedStatus, updateDeliveryStatus]
  );

  const handleDeleteDelivery = useCallback(
    async (deliveryId: number, currentStatus: string) => {
      if (currentStatus !== "pending" && currentStatus !== "cancelled") {
        alert('Only deliveries with "pending" or "cancelled" status can be deleted.');
        return;
      }
      if (window.confirm("Are you sure you want to delete this delivery? This action cannot be undone.")) {
        try {
          await deleteDelivery(deliveryId).unwrap();
          alert("Delivery deleted successfully!");
        } catch (error: any) {
          alert(
            `Failed to delete delivery: ${error?.data?.detail || "Unknown error"}`
          );
        }
      }
    },
    [deleteDelivery]
  );

  const handleSortChange = useCallback(
    (field: string) => {
      setSortModel((prevModel) => {
        const isAsc =
          prevModel.length > 0 &&
          prevModel[0].field === field &&
          prevModel[0].sort === "asc";
        return [{ field, sort: isAsc ? "desc" : "asc" }];
      });
      setPage(1);
    },
    []
  );

  if (isDeliveriesLoading && !deliveriesData) {
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-16 space-y-4 sm:space-y-0">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                Delivery Management
              </h1>
            </div>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Create Delivery</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
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
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Sort By:</span>
            <button
              onClick={() => handleSortChange("id")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <span>ID</span>
              {sortModel[0]?.field === "id" && (
                <ArrowUpDown
                  className={`w-4 h-4 ${sortModel[0].sort === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <button
              onClick={() => handleSortChange("status")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <span>Status</span>
              {sortModel[0]?.field === "status" && (
                <ArrowUpDown
                  className={`w-4 h-4 ${sortModel[0].sort === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <button
              onClick={() => handleSortChange("delivery_address")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <span>Address</span>
              {sortModel[0]?.field === "delivery_address" && (
                <ArrowUpDown
                  className={`w-4 h-4 ${sortModel[0].sort === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Deliveries Grid */}
      <div className="max-w-7xl mx-auto">
        {deliveriesError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {(deliveriesError as any).data?.detail || "Failed to fetch deliveries"}
          </div>
        )}
        {deliveryPersonsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {(deliveryPersonsError as any).data?.detail || "Failed to fetch delivery persons"}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveriesData?.results?.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-gray-500">
              No deliveries found.
            </div>
          ) : (
            deliveriesData?.results.map((delivery: Delivery) => {
              const deliveryPersonName = delivery.delivery_person?.username || "Unassigned";
              const deliveryPersonInitials = delivery.delivery_person?.username
                ? delivery.delivery_person.username.charAt(0).toUpperCase()
                : "?";

              return (
                <div
                  key={delivery.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {deliveryPersonInitials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1">
                            <h3 className="font-bold text-gray-900 text-base">
                              {deliveryPersonName}
                            </h3>
                            <span className="text-xs text-gray-500">#{delivery.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-gray-600">
                      <p className="text-sm font-medium">
                        Order ID: <span className="font-normal">{delivery.order.id}</span>
                      </p>
                      <p className="text-sm font-medium">
                        Status:{" "}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColorClass(
                            delivery.status
                          )}`}
                        >
                          {delivery.status.replace(/_/g, " ")}
                        </span>
                      </p>
                      <p className="text-sm font-medium">
                        Address:{" "}
                        <span className="font-normal" title={delivery.delivery_address}>
                          {shortenAddress(delivery.delivery_address)}
                        </span>
                      </p>
                      {delivery.estimated_delivery_time && (
                        <p className="text-sm font-medium">
                          Est. Delivery:{" "}
                          <span className="font-normal">
                            {format(new Date(delivery.estimated_delivery_time), "PPp")}
                          </span>
                        </p>
                      )}
                      {delivery.latitude && delivery.longitude && (
                        <p className="text-sm font-medium">
                          Coords:{" "}
                          <span className="font-normal">
                            Lat: {delivery.latitude}, Lng: {delivery.longitude}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowAssignModal(delivery.id);
                          setSelectedDeliveryPersonId(
                            delivery.delivery_person?.id?.toString() || ""
                          );
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Assign Delivery Person"
                        disabled={isAssigning}
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowStatusModal(delivery.id);
                          setSelectedStatus(delivery.status);
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Update Status"
                        disabled={isStatusUpdating}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDelivery(delivery.id, delivery.status)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Delivery"
                        disabled={delivery.status !== "pending" && delivery.status !== "cancelled"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {deliveriesData?.count !== undefined && deliveriesData.count > pageSize && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 mx-1 bg-white rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 mx-1 bg-blue-600 text-white rounded-lg">{page}</span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page * pageSize >= deliveriesData.count}
              className="px-4 py-2 mx-1 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleCreateDeliverySubmit}
              className="p-4 space-y-4 max-h-[60vh] overflow-y-auto"
            >
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
                disabled={isDeliveryPersonsLoading || availableDeliveryPersons.length === 0}
              >
                <option value="">Unassigned Delivery Person</option>
                {isDeliveryPersonsLoading ? (
                  <option disabled>Loading delivery persons...</option>
                ) : availableDeliveryPersons.length === 0 ? (
                  <option disabled>No delivery persons available</option>
                ) : (
                  availableDeliveryPersons.map((user: User) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))
                )}
              </select>
              <input
                type="text"
                name="delivery_address"
                placeholder="Delivery Address"
                value={newDelivery.delivery_address}
                onChange={handleCreateDeliveryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring’on-4 focus:ring-blue-500 transition-colors"
                required
              />
              <input
                type="number"
                step="any"
                name="latitude"
                placeholder="Latitude (Optional)"
                value={newDelivery.latitude}
                onChange={handleCreateDeliveryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 transition-colors"
              />
              <input
                type="number"
                step="any"
                name="longitude"
                placeholder="Longitude (Optional)"
                value={newDelivery.longitude}
                onChange={handleCreateDeliveryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring focus:ring-blue-200 transition-colors"
              />
              <div className="flex justify-end space-x-3 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
                >
                  {isCreating ? (
                    <svg
                      className="w-4 h-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Delivery Person Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Assign Delivery Person</h3>
              <button
                onClick={() => setShowAssignModal(null)}
                className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAssignDeliveryPersonSubmit} className="p-4 space-y-4">
              <select
                value={selectedDeliveryPersonId}
                onChange={(e) => setSelectedDeliveryPersonId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-colors"
                required
                disabled={isDeliveryPersonsLoading || availableDeliveryPersons.length === 0}
              >
                <option value="">Select Delivery Person</option>
                {isDeliveryPersonsLoading ? (
                  <option disabled>Loading delivery persons...</option>
                ) : availableDeliveryPersons.length === 0 ? (
                  <option disabled>No delivery persons available</option>
                ) : (
                  availableDeliveryPersons.map((person: User) => (
                    <option key={person.id} value={person.id}>
                      {person.username}
                    </option>
                  ))
                )}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || isDeliveryPersonsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
                >
                  {isAssigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[50vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Update Status</h3>
              <button
                onClick={() => setShowStatusModal(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatusSubmit} className="p-4 space-y-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-colors"
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(null)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStatusUpdating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
                >
                  {isStatusUpdating ? "Updating..." : "Update"}
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