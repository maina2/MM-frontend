// src/components/admin/ProductManagement.tsx
import { useState, useCallback } from 'react';
import {
  useGetAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useGetCategoriesQuery,
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
import { Product } from '../../types';

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

const ProductManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [openModal, setOpenModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    discount_percentage: '',
    image: null as File | null,
  });
  const [formError, setFormError] = useState('');

  const { data: productsData, isLoading, error } = useGetAdminProductsQuery({
    page,
    page_size: 12,
    search: search || undefined,
    category: categoryFilter || undefined,
    ordering: sortModel[0] ? `${sortModel[0].sort === 'desc' ? '-' : ''}${sortModel[0].field}` : undefined,
  });
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80, sortable: true, renderCell: ({ value }) => <Typography variant="body2">{value}</Typography> },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      sortable: true,
      renderCell: ({ value }) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      sortable: true,
      renderCell: ({ value }) => {
        const numericValue = Number(value);
        return <Typography variant="body2">{isNaN(numericValue) ? '$0.00' : `$${numericValue.toFixed(2)}`}</Typography>;
      },
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 80,
      sortable: true,
      renderCell: ({ value }) => <Typography variant="body2">{value}</Typography>,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: ({ value }) => {
        const name = !value
          ? 'Unknown'
          : typeof value === 'object' && value.name
          ? value.name
          : typeof value === 'number' && categories
          ? categories.find((cat) => cat.id === value)?.name || 'Unknown'
          : 'Unknown';
        return <Typography variant="body2">{name}</Typography>;
      },
    },
    {
      field: 'discount_percentage',
      headerName: 'Discount',
      width: 100,
      sortable: true,
      renderCell: ({ value }) => {
        const numericValue = Number(value);
        return <Typography variant="body2">{isNaN(numericValue) || numericValue === 0 ? '0%' : `${numericValue}%`}</Typography>;
      },
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 80,
      renderCell: ({ value }) =>
        value ? (
          <img src={value} alt="Product" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          <Typography variant="body2" color="text.secondary">None</Typography>
        ),
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

  const handleEdit = useCallback((product: Product) => {
    setEditProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
      category: typeof product.category === 'object' && product.category.id ? product.category.id.toString() : product.category?.toString() || '',
      discount_percentage: product.discount_percentage?.toString() || '',
      image: null,
    });
    setOpenModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted', { position: 'top-right' });
      } catch {
        toast.error('Failed to delete product', { position: 'top-right' });
      }
    }
  }, [deleteProduct]);

  const handleModalOpen = useCallback(() => {
    setEditProduct(null);
    setFormData({ name: '', description: '', price: '', stock: '', category: '', discount_percentage: '', image: null });
    setOpenModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpenModal(false);
    setFormError('');
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      setFormError('Required fields missing');
      toast.error('Required fields missing', { position: 'top-right' });
      return;
    }
    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock);
    const discountNum = formData.discount_percentage ? Number(formData.discount_percentage) : undefined;
    if (priceNum <= 0 || stockNum < 0) {
      setFormError('Invalid price or stock');
      toast.error('Invalid price or stock', { position: 'top-right' });
      return;
    }
    if (discountNum !== undefined && (discountNum < 0 || discountNum > 100)) {
      setFormError('Discount must be 0-100');
      toast.error('Discount must be 0-100', { position: 'top-right' });
      return;
    }
    const payload = {
      name: formData.name,
      description: formData.description,
      price: priceNum,
      stock: stockNum,
      category: Number(formData.category),
      discount_percentage: discountNum,
      image: formData.image,
    };
    try {
      if (editProduct) {
        await updateProduct({ id: editProduct.id, ...payload }).unwrap();
        toast.success('Product updated', { position: 'top-right' });
      } else {
        await createProduct(payload).unwrap();
        toast.success('Product created', { position: 'top-right' });
      }
      handleModalClose();
    } catch (err: any) {
      const errorMsg = err.data?.detail || 'Failed to save product';
      setFormError(errorMsg);
      toast.error(errorMsg, { position: 'top-right' });
    }
  }, [formData, editProduct, createProduct, updateProduct, handleModalClose]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleCategoryFilterChange = useCallback((e: any) => {
    setCategoryFilter(e.target.value || '');
    setPage(1);
  }, []);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
    setPage(1);
  }, []);

  if (isLoading || isCategoriesLoading || !productsData || !categories) {
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
          <Typography variant="h4">Products</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleModalOpen}>Add Product</Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            value={search}
            onChange={handleSearchChange}
            sx={{ flex: 1, minWidth: 200 }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select value={categoryFilter} onChange={handleCategoryFilterChange} label="Category">
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 8 }}>{error.data?.detail || 'Failed to fetch products'}</Alert>}
        <Fade in timeout={500}>
          <Box>
            <DataGrid
              rows={productsData.results}
              columns={columns}
              pageSize={12}
              rowsPerPageOptions={[12]}
              pagination
              paginationMode="server"
              rowCount={productsData.count || 0}
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
          <DialogTitle sx={{ fontWeight: 600 }}>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 8 }}>{formError}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Name" name="name" value={formData.name} onChange={handleFormChange} required size="small" />
              <TextField label="Description" name="description" value={formData.description} onChange={handleFormChange} multiline rows={3} size="small" />
              <TextField label="Price" name="price" type="number" value={formData.price} onChange={handleFormChange} required size="small" inputProps={{ step: '0.01' }} />
              <TextField label="Stock" name="stock" type="number" value={formData.stock} onChange={handleFormChange} required size="small" inputProps={{ min: 0 }} />
              <FormControl required size="small">
                <InputLabel>Category</InputLabel>
                <Select name="category" value={formData.category} onChange={handleFormChange} label="Category">
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Discount %"
                name="discount_percentage"
                type="number"
                value={formData.discount_percentage}
                onChange={handleFormChange}
                size="small"
                inputProps={{ min: 0, max: 100, step: '0.01' }}
              />
              <Box>
                <Button variant="outlined" component="label" sx={{ borderRadius: 8, textTransform: 'none' }}>
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </Button>
                {formData.image && (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    style={{ maxWidth: 80, borderRadius: 8, mt: 2 }}
                  />
                )}
              </Box>
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
              {isCreating || isUpdating ? <CircularProgress size={20} /> : editProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ProductManagement;