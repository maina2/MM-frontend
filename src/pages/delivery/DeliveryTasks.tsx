import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TablePagination,
} from '@mui/material';
import { useGetDeliveryTasksQuery } from '../../api/apiSlice';
import { Delivery } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { format } from 'date-fns';

const DeliveryTasks: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1); // Backend page (1-based)
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Redirect non-delivery users
  if (!user || user.role !== 'delivery') {
    navigate('/unauthorized');
    return null;
  }

  const { data, isLoading, isError, error } = useGetDeliveryTasksQuery({
    page,
    page_size: rowsPerPage,
  });

  // Extract deliveries and pagination info
  const deliveries = data?.results || [];
  const totalCount = data?.count || 0;

  // Filter deliveries by status (optional, if backend doesn't support status filtering)
  const filteredDeliveries = statusFilter === 'all'
    ? deliveries
    : deliveries.filter((delivery: Delivery) => delivery.status === statusFilter);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1); // Convert to 1-based indexing for backend
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page
  };

  // Handle status filter change
  const handleStatusFilterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setStatusFilter(event.target.value as string);
    setPage(1); // Reset pagination
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'PPP p');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    const errorMessage =
      (error as any)?.data?.error || 'Failed to load deliveries. Please try again.';
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        My Delivery Tasks
      </Typography>
      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Filter by Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          label="Filter by Status"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="assigned">Assigned</MenuItem>
          <MenuItem value="in_transit">In Transit</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </FormControl>
      {filteredDeliveries.length === 0 ? (
        <Typography>No deliveries found.</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Address</TableCell>
                  <TableCell>Estimated Delivery</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeliveries.map((delivery: Delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.order.id}</TableCell>
                    <TableCell>
                      {delivery.status.replace('_', ' ').toUpperCase()}
                    </TableCell>
                    <TableCell>{delivery.delivery_address}</TableCell>
                    <TableCell>{formatDate(delivery.estimated_delivery_time)}</TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/delivery/tasks/${delivery.id}`}
                        variant="outlined"
                        size="small"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page - 1} // Convert to 0-based for frontend
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  );
};

export default DeliveryTasks;