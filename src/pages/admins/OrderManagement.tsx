// src/components/admin/OrderManagement.tsx
import { useState, useCallback } from 'react';
import {
  useGetAdminOrdersQuery,
  useCreateAdminOrderMutation,
  useUpdateAdminOrderMutation,
  useDeleteAdminOrderMutation,
  useGetAdminProductsQuery,
} from '../../api/apiSlice';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Order, Product } from '../../types';
import { format } from 'date-fns';

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

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatusOptions = ['unpaid', 'paid', 'failed', 'pending'];

const OrderManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [formData, setFormData] = useState({
    status: '',
    payment_status: '',
    payment_phone_number: '',
    items: [{ product_id: '', quantity: '' }],
  });
  const [formError, setFormError] = useState('');

  const { data: ordersData, isLoading, error } = useGetAdminOrdersQuery({
    page,
    status: statusFilter || undefined,
    payment_status: paymentStatusFilter || undefined,
    search: search || undefined,
    ordering: sortModel[0] ? `${sortModel[0].sort === 'desc' ? '-' : ''}${sortModel[0].field}` : undefined,
  });
  const { data: productsData } = useGetAdminProductsQuery({});
  const [createOrder, { isLoading: isCreating }] = useCreateAdminOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateAdminOrderMutation();
  const [deleteOrder] = useDeleteAdminOrderMutation();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, sortable: true, renderCell: ({ value }) => <Typography variant="body2">{value}</Typography> },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 150,
      renderCell: ({ value }) => <Typography variant="body2">{(value as Order['customer']).username}</Typography>,
    },
    {
      field: 'total_amount',
      headerName: 'Total',
      width: 100,
      sortable: true,
      renderCell: ({ value }) => <Typography variant="body2">${Number(value).toFixed(2)}</Typography>,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: ({ value }) => <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{value}</Typography>,
    },
    {
      field: 'payment_status',
      headerName: 'Payment',
      width: 120,
      renderCell: ({ value }) => <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{value}</Typography>,
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 120,
      sortable: true,
      renderCell: ({ value }) => <Typography variant="body2">{format(new Date(value), 'MM/dd/yyyy')}</Typography>,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit"><IconButton onClick={() => handleEdit(row)}><Edit fontSize="small" color="primary" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton onClick={() => handleDelete(row.id)}><Delete fontSize="small" color="error" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  const handleEdit = useCallback((order: Order) => {
    setEditOrder(order);
    setIsCreate(false);
    setFormData({
      status: order.status,
      payment_status: order.payment_status,
      payment_phone_number: order.payment_phone_number || '',
      items: order.items.map((item) => ({ product_id: item.product.id.toString(), quantity: item.quantity.toString() })),
    });
    setOpenModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Delete this order?')) {
      try {
        await deleteOrder(id).unwrap();
        toast.success('Order deleted', { position: 'top-right' });
      } catch {
        toast.error('Failed to delete order', { position: 'top-right' });
      }
    }
  }, [deleteOrder]);

  const handleModalOpen = useCallback((create = false) => {
    setIsCreate(create);
    setEditOrder(null);
    setFormData({
      status: 'pending',
      payment_status: 'unpaid',
      payment_phone_number: '',
      items: [{ product_id: '', quantity: '' }],
    });
    setOpenModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpenModal(false);
    setFormError('');
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>, index?: number) => {
    const { name, value } = e.target;
    if (index !== undefined && name) {
      setFormData((prev) => {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [name]: value };
        return { ...prev, items: newItems };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name as string]: value }));
    }
  }, []);

  const handleAddItem = useCallback(() => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, { product_id: '', quantity: '' }] }));
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.status || !formData.payment_status) {
      setFormError('Status and payment status are required');
      toast.error('Status and payment status are required', { position: 'top-right' });
      return;
    }
    if (formData.payment_phone_number && !/^\+2547[0-9]{8}$/.test(formData.payment_phone_number)) {
      setFormError('Phone number must be in format +2547XXXXXXXX');
      toast.error('Invalid phone number', { position: 'top-right' });
      return;
    }
    if (isCreate) {
      if (!formData.items.length || formData.items.some((item) => !item.product_id || !item.quantity || Number(item.quantity) <= 0)) {
        setFormError('At least one valid item is required');
        toast.error('At least one valid item is required', { position: 'top-right' });
        return;
      }
    }
    
    const payload = {
      status: formData.status,
      payment_status: formData.payment_status,
      payment_phone_number: formData.payment_phone_number || undefined,
      items: isCreate ? formData.items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })) : undefined,
    };

    try {
      if (isCreate) {
        await createOrder(payload).unwrap();
        toast.success('Order created', { position: 'top-right' });
      } else if (editOrder) {
        await updateOrder({ id: editOrder.id, ...payload }).unwrap();
        toast.success('Order updated', { position: 'top-right' });
      }
      handleModalClose();
    } catch (err: any) {
      const errorMsg = err.data?.detail || 'Failed to save order';
      setFormError(errorMsg);
      toast.error(errorMsg, { position: 'top-right' });
    }
  }, [formData, isCreate, editOrder, createOrder, updateOrder, handleModalClose]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((field: 'status' | 'payment_status') => (e: any) => {
    if (field === 'status') setStatusFilter(e.target.value || '');
    else setPaymentStatusFilter(e.target.value || '');
    setPage(1);
  }, []);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
    setPage(1);
  }, []);

  if (isLoading || !ordersData) {
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
          <Typography variant="h4">Orders</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleModalOpen(true)}>
            Add Order
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search by Customer or ID"
            value={search}
            onChange={handleSearchChange}
            sx={{ flex: 1, minWidth: 200 }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={handleFilterChange('status')} label="Status">
              <MenuItem value="">All</MenuItem>
              {statusOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select value={paymentStatusFilter} onChange={handleFilterChange('payment_status')} label="Payment Status">
              <MenuItem value="">All</MenuItem>
              {paymentStatusOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 8 }}>{(error as any).data?.detail || 'Failed to fetch orders'}</Alert>}
        <Fade in timeout={500}>
          <Box>
            <DataGrid
              rows={ordersData.results}
              columns={columns}
              pageSize={12}
              rowsPerPageOptions={[12]}
              pagination
              paginationMode="server"
              rowCount={ordersData.count || 0}
              onPageChange={(newPage) => setPage(newPage + 1)}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              loading={isLoading}
              autoHeight
              disableColumnMenu
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>
        </Fade>
        <Dialog open={openModal} onClose={handleModalClose} maxWidth="sm" fullWidth TransitionComponent={Fade}>
          <DialogTitle sx={{ fontWeight: 600 }}>{isCreate ? 'Create Order' : 'Edit Order'}</DialogTitle>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 8 }}>{formError}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl required size="small">
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleFormChange} label="Status">
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl required size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select name="payment_status" value={formData.payment_status} onChange={handleFormChange} label="Payment Status">
                  {paymentStatusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Phone Number"
                name="payment_phone_number"
                value={formData.payment_phone_number}
                onChange={handleFormChange}
                size="small"
                placeholder="+2547XXXXXXXX"
              />
              {isCreate && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Order Items</Typography>
                  {formData.items.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Product</InputLabel>
                        <Select
                          name="product_id"
                          value={item.product_id}
                          onChange={(e) => handleFormChange(e, index)}
                          label="Product"
                        >
                          <MenuItem value=""><em>Select Product</em></MenuItem>
                          {productsData?.results.map((product: Product) => (
                            <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleFormChange(e, index)}
                        size="small"
                        inputProps={{ min: 1 }}
                        sx={{ width: 100 }}
                      />
                      <IconButton onClick={() => handleRemoveItem(index)} disabled={formData.items.length === 1}>
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button variant="outlined" onClick={handleAddItem} sx={{ alignSelf: 'flex-start' }}>
                    Add Item
                  </Button>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleModalClose} color="inherit">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
              sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: '#059669' } }}
            >
              {isCreating || isUpdating ? <CircularProgress size={20} /> : isCreate ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default OrderManagement;