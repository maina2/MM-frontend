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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Fade,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Custom theme (re-using the one from OrderManagement for consistency)
const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    secondary: { main: '#10b981' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    body2: { fontSize: '0.875rem', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' } },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8, backgroundColor: '#ffffff' } },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: { border: 'none', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        columnHeader: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          fontWeight: 600,
          '& .MuiDataGrid-sortIcon': { color: '#ffffff' },
        },
        cell: { padding: '0 12px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e7eb' },
        row: { '&:hover': { backgroundColor: '#f1f5f9' } },
      },
    },
  },
});

const shortenAddress = (address: string): string => {
  const words = address.trim().split(' ');
  return words.slice(0, 2).join(' ');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'in_transit':
      return 'info';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const DeliveryManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12); // Consistent with OrderManagement
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([]); // For DataGrid sorting
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
    page_size: 100, // Fetch enough delivery persons
    role: 'delivery' // Filter by role 'delivery'
  });

  const [createDelivery, { isLoading: isCreating }] = useCreateAdminDeliveryMutation();
  // const [updateDelivery, { isLoading: isUpdating }] = useUpdateAdminDeliveryMutation(); // Not directly used in the current UI logic
  const [deleteDelivery] = useDeleteAdminDeliveryMutation();
  const [assignDeliveryPerson, { isLoading: isAssigning }] = useAssignDeliveryPersonMutation();
  const [updateDeliveryStatus, { isLoading: isStatusUpdating }] = useUpdateDeliveryStatusMutation();

  const availableDeliveryPersons = deliveryPersonsData?.results || [];

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70, sortable: true },
    {
      field: 'order',
      headerName: 'Order ID',
      width: 100,
      renderCell: ({ value }) => (value as { id: number }).id,
      sortable: false, // Assuming order ID itself isn't directly sortable via API, if it is, add it.
    },
    {
      field: 'delivery_person',
      headerName: 'Delivery Person',
      width: 150,
      renderCell: ({ value }) => (value ? (value as User).username : 'Unassigned'),
      sortable: false, // Assuming delivery person isn't directly sortable via API
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={(value as string).replace(/_/g, ' ')} // Replace underscores for display
          color={getStatusColor(value as string) as 'warning' | 'info' | 'success' | 'error' | 'default'}
          size="small"
          sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
        />
      ),
      sortable: true,
    },
    {
      field: 'delivery_address',
      headerName: 'Address',
      width: 200,
      renderCell: ({ value }) => (
        <Tooltip title={value as string}>
          <Typography variant="body2">{shortenAddress(value as string)}</Typography>
        </Tooltip>
      ),
      sortable: true,
    },
    {
      field: 'estimated_delivery_time',
      headerName: 'Est. Delivery',
      width: 180,
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {value ? format(new Date(value as string), 'PPp') : 'N/A'}
        </Typography>
      ),
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150, // Base width
      flex: 1,    // This makes the column take up remaining space
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Assign Delivery Person">
            <IconButton
              color="primary"
              onClick={() => setShowAssignModal(row.id)}
              disabled={isAssigning}
            >
              <PersonAddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update Status">
            <IconButton
              color="success"
              onClick={() => setShowStatusModal(row.id)}
              disabled={isStatusUpdating}
            >
              <SyncIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Delivery">
            <IconButton
              color="error"
              onClick={() => handleDeleteDelivery(row.id)}
              disabled={row.status !== 'pending' && row.status !== 'cancelled'} // Disable if not pending or cancelled
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
      toast.success('Delivery created successfully');
      setShowCreateModal(false);
      setNewDelivery({ order_id: '', delivery_person_id: '', delivery_address: '', latitude: '', longitude: '' });
    } catch (error: any) {
      toast.error(`Failed to create delivery: ${error?.data?.detail || 'Unknown error'}`);
    }
  }, [newDelivery, createDelivery]);

  const handleAssignDeliveryPersonSubmit = useCallback(async (e: React.FormEvent, deliveryId: number) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      delivery_person_id: { value: string };
    };
    const deliveryPersonId = target.delivery_person_id.value;

    try {
      await assignDeliveryPerson({ id: deliveryId, delivery_person_id: parseInt(deliveryPersonId) }).unwrap();
      toast.success('Delivery person assigned successfully');
      setShowAssignModal(null);
    } catch (error: any) {
      toast.error(`Failed to assign delivery person: ${error?.data?.detail || 'Unknown error'}`);
    }
  }, [assignDeliveryPerson]);

  const handleUpdateStatusSubmit = useCallback(async (e: React.FormEvent, deliveryId: number) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      status: { value: string };
    };
    const status = target.status.value;

    try {
      await updateDeliveryStatus({ id: deliveryId, status }).unwrap();
      toast.success('Delivery status updated successfully');
      setShowStatusModal(null);
    } catch (error: any) {
      toast.error(`Failed to update status: ${error?.data?.detail || 'Unknown error'}`);
    }
  }, [updateDeliveryStatus]);

  const handleDeleteDelivery = useCallback(async (deliveryId: number) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await deleteDelivery(deliveryId).unwrap();
        toast.success('Delivery deleted successfully');
      } catch (error: any) {
        toast.error(`Failed to delete delivery: ${error?.data?.detail || 'Unknown error'}`);
      }
    }
  }, [deleteDelivery]);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
    setPage(1); // Reset page on sort change
  }, []);

  if (isDeliveriesLoading && !deliveriesData) { // Check deliveriesData too for initial load
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: { xs: 2, sm: 3 } }}>
        <ToastContainer position="top-right" autoClose={3000} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">Delivery Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateModal(true)}>
            Create Delivery
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search by Address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_transit">In Transit</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {deliveriesError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 8 }}>
            {(deliveriesError as any).data?.detail || 'Failed to fetch deliveries'}
          </Alert>
        )}

        <Fade in timeout={500}>
          <Box>
            <DataGrid
              rows={deliveriesData?.results || []}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[pageSize]}
              pagination
              paginationMode="server"
              rowCount={deliveriesData?.count || 0}
              onPageChange={(newPage) => setPage(newPage + 1)}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              loading={isDeliveriesLoading}
              autoHeight
              disableColumnMenu
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>
        </Fade>

        {/* Create Delivery Dialog */}
        <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth TransitionComponent={Fade}>
          <DialogTitle sx={{ fontWeight: 600 }}>Create New Delivery</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreateDeliverySubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Order ID"
                type="number"
                value={newDelivery.order_id}
                onChange={(e) => setNewDelivery({ ...newDelivery, order_id: e.target.value })}
                required
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Delivery Person</InputLabel>
                <Select
                  value={newDelivery.delivery_person_id}
                  label="Delivery Person"
                  onChange={(e) => setNewDelivery({ ...newDelivery, delivery_person_id: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {availableDeliveryPersons.map((user: User) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Delivery Address"
                value={newDelivery.delivery_address}
                onChange={(e) => setNewDelivery({ ...newDelivery, delivery_address: e.target.value })}
                required
                size="small"
              />
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                step="any"
                value={newDelivery.latitude}
                onChange={(e) => setNewDelivery({ ...newDelivery, latitude: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                step="any"
                value={newDelivery.longitude}
                onChange={(e) => setNewDelivery({ ...newDelivery, longitude: e.target.value })}
                size="small"
              />
              <DialogActions sx={{ px: 0, pb: 0, pt: 1 }}> {/* Adjust padding for actions inside form */}
                <Button onClick={() => setShowCreateModal(false)} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isCreating} sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: '#059669' } }}>
                  {isCreating ? <CircularProgress size={20} /> : 'Create'}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Assign Delivery Person Dialog */}
        <Dialog open={!!showAssignModal} onClose={() => setShowAssignModal(null)} maxWidth="sm" fullWidth TransitionComponent={Fade}>
          <DialogTitle sx={{ fontWeight: 600 }}>Assign Delivery Person</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={(e) => handleAssignDeliveryPersonSubmit(e, showAssignModal!)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth required size="small">
                <InputLabel>Delivery Person</InputLabel>
                <Select name="delivery_person_id" label="Delivery Person">
                  <MenuItem value="">Select Delivery Person</MenuItem>
                  {availableDeliveryPersons.map((user: User) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DialogActions sx={{ px: 0, pb: 0, pt: 1 }}>
                <Button onClick={() => setShowAssignModal(null)} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isAssigning} sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: '#059669' } }}>
                  {isAssigning ? <CircularProgress size={20} /> : 'Assign'}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={!!showStatusModal} onClose={() => setShowStatusModal(null)} maxWidth="sm" fullWidth TransitionComponent={Fade}>
          <DialogTitle sx={{ fontWeight: 600 }}>Update Delivery Status</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={(e) => handleUpdateStatusSubmit(e, showStatusModal!)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth required size="small">
                <InputLabel>Status</InputLabel>
                <Select name="status" label="Status">
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_transit">In Transit</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <DialogActions sx={{ px: 0, pb: 0, pt: 1 }}>
                <Button onClick={() => setShowStatusModal(null)} color="inherit">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isStatusUpdating} sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: '#059669' } }}>
                  {isStatusUpdating ? <CircularProgress size={20} /> : 'Update'}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default DeliveryManagement;