// src/components/admin/ProductManagement.tsx
import { useState, useMemo } from 'react';
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
  Switch,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add, Edit, Delete, LightMode, DarkMode } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Product, Category } from '../../types';

const ProductManagement = () => {
  // Hooks
  const [darkMode, setDarkMode] = useState(true);
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

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: { main: '#1976d2' },
          background: {
            default: darkMode ? '#121212' : '#f5f5f5',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
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
                animation: 'fadeIn 0.3s ease-in',
              },
            },
          },
        },
      }),
    [darkMode]
  );

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

  // Table columns
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}`,
    },
    { field: 'stock', headerName: 'Stock', width: 100 },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      valueGetter: ({ value }) => {
        if (!value) return 'Unknown';
        if (typeof value === 'number') {
          const category = categories?.find((cat) => cat.id === value);
          return category?.name || 'Unknown';
        }
        return (value as Category).name || 'Unknown';
      },
    },
    {
      field: 'discount_percentage',
      headerName: 'Discount (%)',
      width: 120,
      valueFormatter: ({ value }) => (value ? `${value}%` : '0%'),
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 100,
      renderCell: ({ value }) =>
        value ? (
          <img src={value} alt="Product" style={{ width: 50, borderRadius: 4 }} />
        ) : (
          'No Image'
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: ({ row }) => (
        <>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(row)}>
              <Edit color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(row.id)}>
              <Delete color="error" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  // Handlers
  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: typeof product.category === 'number' ? product.category.toString() : (product.category as Category).id.toString(),
      discount_percentage: product.discount_percentage?.toString() || '',
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

    // Validate form
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      setFormError('Please fill in all required fields');
      return;
    }
    if (Number(formData.price) <= 0 || Number(formData.stock) < 0) {
      setFormError('Price must be positive and stock cannot be negative');
      return;
    }
    if (formData.discount_percentage && (Number(formData.discount_percentage) < 0 || Number(formData.discount_percentage) > 100)) {
      setFormError('Discount percentage must be between 0 and 100');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: Number(formData.category),
      discount_percentage: formData.discount_percentage ? Number(formData.discount_percentage) : undefined,
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
    setPage(1); // Reset to page 1 on search
  };

  const handleCategoryFilterChange = (e: any) => {
    setCategoryFilter(e.target.value || '');
    setPage(1);
  };

  // Loading state
  if (isLoading || isCategoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <Switch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                icon={<LightMode />}
                checkedIcon={<DarkMode />}
              />
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleModalOpen}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Search Products"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories?.map((cat) => (
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
            Error: {JSON.stringify(error)}
          </Alert>
        )}

        {/* Product Table */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
          <DataGrid
            rows={productsData?.results || []}
            columns={columns}
            pageSize={12}
            rowsPerPageOptions={[12]}
            pagination
            paginationMode="server"
            rowCount={productsData?.count || 0}
            onPageChange={(newPage) => setPage(newPage + 1)}
            loading={isLoading}
            autoHeight
            sx={{
              '& .MuiDataGrid-cell': { py: 2 },
              '& .MuiDataGrid-columnHeader': { bgcolor: 'primary.main', color: 'white' },
              '& .MuiDataGrid-row:hover': { bgcolor: darkMode ? '#2a2a2a' : '#f0f0f0' },
            }}
          />
        </Box>

        {/* Create/Edit Modal */}
        <Dialog open={openModal} onClose={handleModalClose}>
          <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
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
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                required
                fullWidth
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
                inputProps={{ min: 0 }}
              />
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  label="Category"
                >
                  {categories?.map((cat) => (
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
          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? <CircularProgress size={24} /> : editProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default ProductManagement;