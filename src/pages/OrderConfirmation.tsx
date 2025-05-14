// src/pages/OrderConfirmation.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { RootState } from "../store/store";
import { useGetOrderQuery } from "../api/apiSlice";

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
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

  if (isLoading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          {error ? "Failed to load order." : "Order not found."}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Order Confirmation
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">
          Order #{order.id} - {order.status}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Payment Status: {paymentStatus}
        </Typography>

        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <List>
          {order.items.map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={`${item.product.name} (x${item.quantity})`}
                secondary={`KSh ${item.price * item.quantity}`}
              />
            </ListItem>
          ))}
        </List>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
          Total: KSh {order.total_amount}
        </Typography>

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

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/orders")}
          sx={{ mt: 3 }}
        >
          View All Orders
        </Button>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;