import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { RootState } from "../store/store";
import { useGetOrderQuery } from "../api/apiSlice";

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: order, isLoading, error } = useGetOrderQuery(orderId);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.payment_status);
      // Poll for payment status updates
      const interval = setInterval(() => {
        if (order.payment_status === "paid" || order.payment_status === "failed") {
          clearInterval(interval);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [order]);

  // Helper function to get status chip color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "warning";
      case "paid": return "success";
      case "processing": return "info";
      case "failed": return "error";
      case "completed": return "success";
      default: return "default";
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ? "Failed to load order." : "Order not found."}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/orders")}>
          View All Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant={isMobile ? "h5" : "h4"} sx={{ mb: 1, fontWeight: "600" }}>
        Order Confirmation
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
        <Typography variant="subtitle1">Order #{order.id}</Typography>
        <Chip 
          label={order.status} 
          color={getStatusColor(order.status) as any} 
          size="small" 
        />
      </Box>

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: isMobile ? 3 : 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ShoppingBagIcon color="primary" fontSize="small" />
              <Typography variant="h6">Order Items</Typography>
            </Box>
            
            {order.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.5 }}>
                  <Box>
                    <Typography variant="body1" fontWeight="500">
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </Typography>
                </Box>
                {index < order.items.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1">
                KSh {order.total_amount.toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
              <Typography variant="body1">Shipping</Typography>
              <Typography variant="body1">
                KSh {(order.shipping_fee || 0).toLocaleString()}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight="bold">Total</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                KSh {order.total_amount.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Payment & Shipping Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ReceiptLongIcon color="primary" fontSize="small" />
              <Typography variant="h6">Payment Details</Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Payment Method</Typography>
              <Typography variant="body1">{order.payment_method || "M-Pesa"}</Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Payment Status</Typography>
              <Chip 
                label={paymentStatus || "unknown"} 
                color={getStatusColor(paymentStatus || "") as any} 
                size="small" 
              />
            </Box>
            
            {paymentStatus === "pending" && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please complete the payment on your phone. Waiting for confirmation...
              </Alert>
            )}
            {paymentStatus === "paid" && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Payment successful! Your order is being processed.
              </Alert>
            )}
            {paymentStatus === "failed" && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Payment failed. Please try again.
              </Alert>
            )}
          </Paper>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <LocalShippingIcon color="primary" fontSize="small" />
              <Typography variant="h6">Shipping Info</Typography>
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Delivery Address</Typography>
              <Typography variant="body1">{order.shipping_address || "Default Address"}</Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">Estimated Delivery</Typography>
              <Typography variant="body1">{order.estimated_delivery || "3-5 business days"}</Typography>
            </Box>
          </Paper>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate("/orders")}
            sx={{ py: 1.5 }}
          >
            View All Orders
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderConfirmation