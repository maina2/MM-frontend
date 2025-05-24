// src/components/admin/UserManagement.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  useGetAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "../../api/apiSlice";
import { User, Role, ApiError } from "../../types"; // Assuming ApiError type for error handling

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
  Chip,
  Container,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Add, Edit, Delete, Close, Save } from "@mui/icons-material";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles"; // alpha is needed for the first approach, but not strictly for the second. Keeping it for flexibility.
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Theme consistent with ProductManagement
const theme = createTheme({
  palette: {
    primary: { main: "#6366f1", dark: "#4f46e5" },
    secondary: { main: "#10b981", dark: "#059669" },
    info: { main: "#3b82f6", dark: "#2563eb" }, // Added for potential use with alpha()
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#1e293b", secondary: "#64748b" },
    error: { main: "#ef4444" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h4: { fontWeight: 700, color: "#1e293b", marginBottom: '1rem' },
    h6: { fontWeight: 600 },
    body2: { fontSize: "0.875rem" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          padding: "8px 16px",
          fontWeight: 500,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          },
        },
        containedPrimary: {
          "&:hover": { backgroundColor: alpha("#6366f1", 0.85) },
        },
        containedSecondary: {
           "&:hover": { backgroundColor: alpha("#10b981", 0.85) },
        }
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#ffffff",
          },
        },
      },
    },
    MuiSelect: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                backgroundColor: "#ffffff",
            }
        }
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
          "--DataGrid-overlayHeight": "300px",
        },
        columnHeader: {
          backgroundColor: "#6366f1",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: '0.875rem',
          "& .MuiDataGrid-sortIcon": { color: "#ffffff" },
          "& .MuiDataGrid-menuIconButton": {color: "#ffffff"},
        },
        cell: {
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
          fontSize: '0.875rem',
        },
        row: { "&:hover": { backgroundColor: "#f1f5f9" } },
        footerContainer: {
            borderTop: '1px solid #e5e7eb',
        }
      },
    },
    MuiChip: { // General Chip style overrides (can be overridden by sx prop)
        styleOverrides: {
            root: {
                // fontWeight: 500, // fontWeight will be set in sx for more specificity
                fontSize: '0.8rem', // Slightly larger for readability
                padding: '4px 2px', // Adjust horizontal padding
                height: '26px', // Slightly taller
                // borderRadius: '16px', // Default is already quite rounded
            }
        }
    }
  },
});

const initialFormData = {
  id: undefined as number | undefined,
  username: "",
  email: "",
  password: "",
  role: "customer" as Role,
  phone_number: "",
};

// Using specific hex codes for closer image match:
const getRoleChipStyled = (role: Role) => {
    let backgroundColor = "";
    let textColor = "";
    let label = role.charAt(0).toUpperCase() + role.slice(1);

    switch (role) {
      case "admin":
        backgroundColor = "#f3e8ff"; // Lighter purple from your image's feel
        textColor = "#a855f7";    // More vibrant purple text (Tailwind purple-500)
        break;
      case "delivery":
        backgroundColor = "#e0f2fe"; // Light blue (Tailwind sky-100)
        textColor = "#0ea5e9";    // Darker, vibrant blue (Tailwind sky-500)
        break;
      case "customer":
      default:
        backgroundColor = "#dcfce7"; // Light green (Tailwind green-100)
        textColor = "#22c55e";    // Darker, vibrant green (Tailwind green-500)
        break;
    }

    return (
      <Chip
        label={label}
        size="small" // keep size small for table cells
        sx={{
          backgroundColor: backgroundColor,
          color: textColor,
          fontWeight: 600,
          borderRadius: '16px', // Pill shape
          paddingLeft: '6px', // Small horizontal padding adjustments
          paddingRight: '6px',
          height: '24px', // Standard small chip height
          fontSize: '0.78rem', // Ensure text fits well
        }}
      />
    );
  };


const UserManagement: React.FC = () => {
  const { data: usersData, isLoading, error: fetchError, refetch } = useGetAdminUsersQuery();
  const [createAdminUser, { isLoading: isCreating }] = useCreateAdminUserMutation();
  const [updateAdminUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
  const [deleteAdminUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();

  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof initialFormData, string>>>({});

  const validateForm = () => {
    const errors: Partial<Record<keyof typeof initialFormData, string>> = {};
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!isEditMode && !formData.password) {
      errors.password = "Password is required for new users";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (formData.phone_number && !/^\+?[0-9\s-]{10,15}$/.test(formData.phone_number)) {
      errors.phone_number = "Enter a valid phone number (e.g., +1234567890)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormData(initialFormData);
    setFormErrors({});
    setOpenModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    setIsEditMode(true);
    setFormData({
        id: user.id,
        username: user.username,
        email: user.email,
        password: "", // Password not shown, only set if changed
        role: user.role,
        phone_number: user.phone_number || "",
    });
    setFormErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = { ...formData };
    if (isEditMode && !payload.password) { 
        delete payload.password;
    }
    if (!payload.phone_number) { 
        delete payload.phone_number;
    }


    try {
      if (isEditMode && payload.id) {
        await updateAdminUser({ id: payload.id, ...payload }).unwrap();
        toast.success("User updated successfully!");
      } else {
        await createAdminUser(payload).unwrap();
        toast.success("User created successfully!");
      }
      handleCloseModal();
      refetch(); 
    } catch (err) {
        const apiError = err as ApiError;
        console.error("Failed to save user:", apiError);
        if (apiError.data && typeof apiError.data === 'object') {
            const serverErrors: Partial<Record<keyof typeof initialFormData, string>> = {};
            for (const key in apiError.data) {
                if (initialFormData.hasOwnProperty(key)) {
                    serverErrors[key as keyof typeof initialFormData] = (apiError.data[key] as string[] | string).toString();
                }
            }
            setFormErrors(prev => ({...prev, ...serverErrors}));
            if (apiError.data.detail) { 
                 toast.error(apiError.data.detail);
            } else {
                 toast.error("Validation error. Please check the form.");
            }
        } else {
            toast.error(`Failed to ${isEditMode ? "update" : "create"} user. Please try again.`);
        }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteAdminUser(id).unwrap();
        toast.success("User deleted successfully!");
        refetch();
      } catch (err) {
        toast.error("Failed to delete user. They might be associated with other data.");
        console.error("Failed to delete user:", err);
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "username", headerName: "Username", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params: GridRenderCellParams<Role>) => getRoleChipStyled(params.value), // Using the updated function
    },
    {
      field: "phone_number",
      headerName: "Phone",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<any, User>) => (
        <Box>
          <Tooltip title="Edit User">
            <IconButton onClick={() => handleOpenEditModal(params.row)} color="primary" size="small">
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small" disabled={isDeleting}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];


  if (fetchError) {
    return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" sx={{ mt: 4, p: { xs: 1, sm: 2 } }}>
          <Alert severity="error">Failed to load users: { (fetchError as ApiError).data?.detail || (fetchError as any).message || "Unknown error"}</Alert>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb:4, p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4">User Management</Typography>
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenCreateModal}>
            Add New User
          </Button>
        </Box>

        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={usersData?.results || []}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            pagination
            loading={isLoading || isCreating || isUpdating || isDeleting}
            autoHeight={false} 
            disableSelectionOnClick
            getRowId={(row) => row.id}
          />
        </Box>
      </Container>

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth TransitionProps={{ timeout: 300 }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{isEditMode ? "Edit User" : "Create New User"}</Typography>
          <IconButton onClick={handleCloseModal}><Close/></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              size="small"
            />
            <TextField
              margin="normal"
              required={!isEditMode} 
              fullWidth
              name="password"
              label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
              type="password"
              id="password"
              value={formData.password}
              onChange={handleFormChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              size="small"
            />
            <FormControl fullWidth margin="normal" required size="small" error={!!formErrors.role}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleFormChange as any} 
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
              </Select>
              {formErrors.role && <Typography color="error" variant="caption">{formErrors.role}</Typography>}
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              id="phone_number"
              label="Phone Number (Optional)"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleFormChange}
              error={!!formErrors.phone_number}
              helperText={formErrors.phone_number}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:2 }}>
          <Button onClick={handleCloseModal} color="inherit" sx={{ "&:hover": { backgroundColor: alpha(theme.palette.text.secondary || '#000000', 0.1) }}}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={isEditMode ? "secondary" : "primary"}
            disabled={isCreating || isUpdating}
            startIcon={isCreating || isUpdating ? <CircularProgress size={20} color="inherit" /> : <Save />}
          >
            {isEditMode ? "Save Changes" : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default UserManagement;