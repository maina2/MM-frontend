import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Divider,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  useGetDeliveryTaskDetailQuery,
  useUpdateDeliveryTaskMutation,
} from '../../api/apiSlice';

import { Delivery } from '../../types/index';

import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const DeliveryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Redirect non-delivery users
  if (!user || user.role !== 'delivery') {
    navigate('/unauthorized');
    return null;
  }

  const {
    data: delivery,
    isLoading,
    isError,
    error,
  } = useGetDeliveryTaskDetailQuery(Number(id));

  const [updateDeliveryStatus, { isLoading: isUpdating }] =
    useUpdateDeliveryTaskMutation();

  // Valid status transitions (based on backend can_transition_to)
  const statusOptions: { value: string; label: string; disabled: boolean }[] = [
    { value: 'pending', label: 'Pending', disabled: true },
    {
      value: 'assigned',
      label: 'Assigned',
      disabled: delivery?.status !== 'pending',
    },
    {
      value: 'in_transit',
      label: 'In Transit',
      disabled: delivery?.status !== 'assigned',
    },
    {
      value: 'delivered',
      label: 'Delivered',
      disabled: delivery?.status !== 'in_transit',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      disabled: !['pending', 'assigned', 'in_transit'].includes(
        delivery?.status || ''
      ),
    },
  ];

  const handleStatusChange = (event: any) => {
    setNewStatus(event.target.value as string);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === delivery?.status) {
      setUpdateError('Please select a different status.');
      return;
    }
    try {
      await updateDeliveryStatus({
        id: Number(id),
        status: newStatus,
      }).unwrap();
      setUpdateSuccess('Status updated successfully.');
      setNewStatus('');
    } catch (err: any) {
      setUpdateError(
        err?.data?.error || 'Failed to update status. Please try again.'
      );
    }
  };

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

  if (isError || !delivery) {
    const errorMessage =
      (error as any)?.data?.error || 'Failed to load delivery details.';
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Delivery Details
      </Typography>
      <Button
        component={Link}
        to="/delivery/tasks"
        variant="outlined"
        sx={{ mb: 2 }}
      >
        Back to Tasks
      </Button>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Order Information</Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>{delivery.order.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>{delivery.order.customer?.username || 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Amount</TableCell>
              <TableCell>
                ${delivery.order.total_amount?.toFixed(2) || 'N/A'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Order Items
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {delivery.order.items?.map((item) => (
              <TableRow key={item.product.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.product.price.toFixed(2)}</TableCell>
                <TableCell>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </TableCell>
              </TableRow>
            )) || (
              <TableRow>
                <TableCell colSpan={4}>No items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Delivery Information</Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>{delivery.status.replace('_', ' ').toUpperCase()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Delivery Address</TableCell>
              <TableCell>{delivery.delivery_address}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Estimated Delivery</TableCell>
              <TableCell>{formatDate(delivery.estimated_delivery_time)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Actual Delivery</TableCell>
              <TableCell>{formatDate(delivery.actual_delivery_time)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {delivery.latitude && delivery.longitude && (
          <Box sx={{ mt: 2, height: 300 }}>
            <MapContainer
              center={[delivery.latitude, delivery.longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[delivery.latitude, delivery.longitude]}>
                <Popup>{delivery.delivery_address}</Popup>
              </Marker>
            </MapContainer>
          </Box>
        )}
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Update Delivery Status
        </Typography>
        {updateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateError}
          </Alert>
        )}
        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {updateSuccess}
          </Alert>
        )}
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>New Status</InputLabel>
          <Select
            value={newStatus}
            onChange={handleStatusChange}
            label="New Status"
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleUpdateStatus}
          disabled={isUpdating || !newStatus}
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </Button>
      </Paper>
    </Box>
  );
};

export default DeliveryDetail;