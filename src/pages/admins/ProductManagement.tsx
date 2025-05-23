// src/components/admin/ProductManagement.tsx
import { useState } from 'react';
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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Product, Category } from '../../types';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: '16px',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
        },
        columnHeader: {
          backgroundColor: '#1976d2',
          color: '#ffffff',
          fontSize: '0.875rem',
          fontWeight: 600,
        },
        cell: {
          padding: '12px',
        },
        row: {
          '&:hover': {
            backgroundColor: '#f8f9fa',
          },
        },
      },
    },
  },
});

const ProductManagement = () => {
  // Hooks
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [openModal, setOpenModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
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
  });
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();

  // Debug: Log productsData and categories to inspect data
  console.log('Products Data:', productsData?.results);
  console.log('Categories:', categories);

  // Table columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150, flex: 1 },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      renderCell: ({ value }) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        const formatted = isNaN(numericValue) || value == null ? '$0.00' : `$${numericValue.toFixed(2)}`;
        return <Typography variant="body2">{formatted}</Typography>;
      },
    },
    { field: 'stock', headerName: 'Stock', width: 70 },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      valueGetter: ({ value }) => {
        console.log('Category value:', value); // Debug: Log category value
        if (!value) return 'Unknown';
        if (typeof value === 'object' && 'name' in value && value.name) {
          return value.name;
        }
        if (typeof value === 'number' && categories) {
          const category = categories.find((cat) => cat.id === value);
          return category?.name || 'Unknown';
        }
        return 'Unknown';
      },
    },
    {
      field: 'discount_percentage',
      headerName: 'Discount',
      width: 80,
      valueFormatter: ({ value }) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
        return isNaN(numericValue) || numericValue === 0 ? '0%' : `${numericValue}%`;
      },
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 80,
      renderCell: ({ value }) =>
        value ? (
          <img src={value} alt="Product" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            No Image
          </Typography>
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(row)}>
              <Edit fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(row.id)}>
              <Delete fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Handlers
  const handleEdit = (product: Product) => {
    setEditProduct(product);
    const priceValue = product.price ? product.price.toString() : '';
    const discountValue = product.discount_percentage ? product.discount_percentage.toString() : '';
    let categoryValue = '';
    if (product.category) {
      if (typeof product.category === 'object' && product.category.id) {
        categoryValue = product.category.id.toString();
      } else if (typeof product.category === 'number') {
        categoryValue = product.category.toString();
      }
    }
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: priceValue,
      stock: product.stock ? product.stock.toString() : '',
      category: categoryValue,
      discount_percentage: discountValue,
      image: null,
    });
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleModalOpen = () => {
    setEditProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      discount_percentage: '',
      image: null,
    });
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setFormError('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      setFormError('Please fill in all required fields');
      return;
    }
    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock);
    const discountNum = formData.discount_percentage ? Number(formData.discount_percentage) : undefined;
    if (priceNum <= 0 || stockNum < 0) {
      setFormError('Price must be positive and stock cannot be negative');
      return;
    }
    if (discountNum !== undefined && (discountNum < 0 || discountNum > 100)) {
      setFormError('Discount percentage must be between 0 and 100');
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
      } else {
        await createProduct(payload).unwrap();
      }
      handleModalClose();
    } catch (err: any) {
      setFormError(err.data?.detail || 'Failed to save product');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (e: any) => {
    setCategoryFilter(e.target.value || '');
    setPage(1);
  };

  // Error message formatting
  const getErrorMessage = (error: any): string => {
    if (!error) return 'An unknown error occurred';
    if (error.data?.detail) return error.data.detail;
    if (error.status) return `Error ${error.status}: Failed to fetch products`;
    return 'Failed to fetch products';
  };

  // Loading state
  if (isLoading || isCategoriesLoading || !productsData || !categories) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Product Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleModalOpen}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search Products"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            sx={{ flex: 1 }}
            size="small"
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Error Handling */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getErrorMessage(error)}
          </Alert>
        )}

        {/* Product Table */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
          <DataGrid
            rows={productsData.results}
            columns={columns}
            pageSize={12}
            rowsPerPageOptions={[12]}
            pagination
            paginationMode="server"
            rowCount={productsData.count || 0}
            onPageChange={(newPage) => setPage(newPage + 1)}
            loading={isLoading}
            autoHeight
            disableColumnMenu
            sx={{
              '& .MuiDataGrid-cell:focus': { outline: 'none' },
              '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
            }}
          />
        </Box>

        {/* Create/Edit Modal */}
        <Dialog open={openModal} onClose={handleModalClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
                fullWidth
                size="small"
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                required
                fullWidth
                size="small"
                inputProps={{ step: '0.01' }}
              />
              <TextField
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleFormChange}
                required
                fullWidth
                size="small"
                inputProps={{ min: 0 }}
              />
              <FormControl fullWidth required size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Discount Percentage"
                name="discount_percentage"
                type="number"
                value={formData.discount_percentage}
                onChange={handleFormChange}
                fullWidth
                size="small"
                inputProps={{ min: 0, max: 100, step: '0.01' }}
              />
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Image Upload
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginBottom: 16 }}
                />
                {formData.image && (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    style={{ maxWidth: 100, borderRadius: 4 }}
                  />
                )}
              </Box>
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
              disabled={isCreating || isUpdating}
              sx={{ minWidth: 100 }}
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