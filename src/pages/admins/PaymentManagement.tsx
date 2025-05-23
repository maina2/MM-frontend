// src/components/admin/PaymentManagement.tsx
import { useState, useCallback } from 'react';
import {
  useGetAdminPaymentsQuery,
  useUpdateAdminPaymentMutation,
  useDeleteAdminPaymentMutation,
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
import { Edit, Delete } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Payment } from '../../types';
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
        root: {
          border: 'none',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%',
        },
        columnHeaders: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          width: '100% !important',
          minWidth: '100% !important',
          display: 'flex',
        },
        columnHeader: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          fontWeight: 600,
          '& .MuiDataGrid-sortIcon': { color: '#ffffff' },
        },
        columnHeadersInner: {
          width: '100% !important',
          '& .MuiDataGrid-colCell': { backgroundColor: '#6366f1' },
        },
        virtualScroller: { width: '100% !important' },
        cell: {
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
        },
        row: { '&:hover': { backgroundColor: '#f1f5f9' } },
      },
    },
  },
});

const statusOptions = ['pending', 'successful', 'failed', 'cancelled'];

const PaymentManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, sortable: true, renderCell: ({ value }) => <Typography variant="body2">{value}</Typography> },
    {
      field: 'order_id',
      headerName: 'Order ID',
      width: 100,
      renderCell: ({ row }) => <Typography variant="body2">{(row as Payment).order.id}</Typography>,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      sortable: true,
      renderCell: ({ value }) => <Typography variant="body2">${Number(value).toFixed(2)}</Typography>,
    },
    {
      field: 'phone_number',
      headerName: 'Phone Number',
      width: 150,
      renderCell: ({ value }) => <Typography variant="body2">{value}</Typography>,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      sortable: true,
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
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(row)}>
              <Edit fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(row.id)}>
              <Delete fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
        toast.success('Payment deleted', { position: 'top-right' });
      } catch {
        toast.error('Failed to delete payment', { position: 'top-right' });
      }
    }
  }, [deletePayment]);

  const handleModalOpen = useCallback(() => {
    setOpenModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpenModal(false);
    setFormError('');
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');

      if (!formData.status) {
        setFormError('Status is required');
        toast.error('Status is required', { position: 'top-right' });
        return;
      }
      if (formData.phone_number && !/^\+2547[0-9]{8}$/.test(formData.phone_number)) {
        setFormError('Phone number must be in format +2547XXXXXXXX');
        toast.error('Invalid phone number', { position: 'top-right' });
        return;
      }

      const payload = {
        status: formData.status,
        phone_number: formData.phone_number || undefined,
      };

      try {
        if (editPayment) {
          await updatePayment({ id: editPayment.id, ...payload }).unwrap();
          toast.success('Payment updated', { position: 'top-right' });
        }
        handleModalClose();
      } catch (err: any) {
        const errorMsg = err.data?.detail || 'Failed to update payment';
        setFormError(errorMsg);
        toast.error(errorMsg, { position: 'top-right' });
      }
    },
    [formData, editPayment, updatePayment, handleModalClose]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((e: any) => {
    setStatusFilter(e.target.value || '');
    setPage(1);
  }, []);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
    setPage(1);
  }, []);

  if (isLoading || !paymentsData) {
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
          <Typography variant="h4">Payments</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search by Order ID or Phone"
            value={search}
            onChange={handleSearchChange}
            sx={{ flex: 1, minWidth: 200 }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={handleFilterChange} label="Status">
              <MenuItem value="">All</MenuItem>
              {statusOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 8 }}>
            {(error as any).data?.detail || 'Failed to fetch payments'}
          </Alert>
        )}
        <Fade in timeout={500}>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={paymentsData.results}
              columns={columns}
              pageSize={12}
              rowsPerPageOptions={[12]}
              pagination
              paginationMode="server"
              rowCount={paymentsData.count || 0}
              onPageChange={(newPage) => setPage(newPage + 1)}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              loading={isLoading}
              autoHeight
              disableColumnMenu
              sx={{ bgcolor: 'background.paper', width: '100%' }}
            />
          </Box>
        </Fade>
        <Dialog open={openModal} onClose={handleModalClose} maxWidth="sm" fullWidth TransitionComponent={Fade}>
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Payment</DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 8 }}>
                {formError}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl required size="small">
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleFormChange} label="Status">
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleFormChange}
                size="small"
                placeholder="+2547XXXXXXXX"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleModalClose} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              disabled={isUpdating}
              sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: '#059669' } }}
            >
              {isUpdating ? <CircularProgress size={20} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default PaymentManagement;