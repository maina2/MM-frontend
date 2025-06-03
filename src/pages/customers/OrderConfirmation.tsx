// src/pages/customers/OrderConfirmation.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { RootState } from "../../store/store";
import { useGetOrderQuery } from "../../api/apiSlice";
import { OrderStatus } from "../../types";

interface StatusChipProps {
  status: OrderStatus;
}
const StatusChip = ({ status }: StatusChipProps) => {
  const colorMap: Record<OrderStatus, string> = {
    pending: "warning",
    paid: "success",
    processing: "info",
    failed: "error",
    completed: "success",
  };

  return (
    <Chip
      label={status}
      color={colorMap[status] || "default"}
      size="small"
      sx={{ fontWeight: "medium", borderRadius: "16px" }}
    />
  );
};

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useSelector((state: RootState) => state.auth.user);

  // Parse orderId to number
  const parsedOrderId = orderId ? parseInt(orderId, 10) : undefined;

  // Redirect if orderId is invalid
  useEffect(() => {
    if (!orderId || parsedOrderId === undefined || isNaN(parsedOrderId)) {
      navigate("/orders", { replace: true });
    }
  }, [orderId, parsedOrderId, navigate]);

  const { data: order, isLoading, error } = useGetOrderQuery(
    parsedOrderId!,
    { skip: !parsedOrderId }
  );
  const [paymentStatus, setPaymentStatus] = useState<OrderStatus | null>(null);

  const getActiveStep = () => {
    if (!paymentStatus) return 0;
    const statusSteps: Record<OrderStatus, number> = {
      paid: 1,
      processing: 2,
      completed: 3,
      pending: 0,
      failed: 0,
    };
    return statusSteps[paymentStatus] || 0;
  };

  useEffect(() => {
    if (!user) navigate("/login");

    if (order) {
      setPaymentStatus(order.payment_status);

      if (order.payment_status === "pending") {
        const interval = setInterval(() => {
          if (["paid", "failed"].includes(order.payment_status)) {
            clearInterval(interval);
          }
        }, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [user, navigate, order]);

  // Loading state
  if (isLoading || !parsedOrderId) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
          Loading your order...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Order Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            {error
              ? "We couldn't load your order information."
              : "The requested order could not be found."}
          </Typography>
          <Button variant="contained" onClick={() => navigate("/orders")}>
            Go to Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  const steps = [
    "Payment Initiated",
    "Payment Confirmed",
    "Processing",
    "Completed",
  ];

  // Use total_amount directly
  const total = order.total_amount;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      {/* Header section */}
      <Box sx={{ mb: 3, textAlign: { xs: "center", md: "left" } }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{ fontWeight: "bold", color: theme.palette.primary.main, mb: 1 }}
        >
          Thank You for Your Order!
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "left" },
            gap: 1,
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Order #{order.id}
          </Typography>
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
              color: "text.secondary",
            }}
          >
            •
          </Box>
          <StatusChip status={order.status} />
        </Box>
      </Box>

      {/* Order Progress Tracker */}
      <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Order Status
          </Typography>
          <Stepper
            activeStep={getActiveStep()}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{ my: 2 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Status alerts */}
          {paymentStatus === "pending" && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ mt: 2, borderRadius: 1.5 }}
            >
              Please complete the payment on your phone. We're waiting for
              confirmation...
            </Alert>
          )}
          {paymentStatus === "paid" && (
            <Alert
              severity="success"
              variant="outlined"
              icon={<CheckCircleIcon />}
              sx={{ mt: 2, borderRadius: 1.5 }}
            >
              Payment successful! Your order is being processed.
            </Alert>
          )}
          {paymentStatus === "failed" && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{ mt: 2, borderRadius: 1.5 }}
            >
              Payment failed. Please try again or contact support.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Order Details - Modern Flexbox Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: { xs: "stretch", md: "flex-start" },
        }}
      >
        {/* Order Items - Takes up more space on desktop */}
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <ShoppingBagIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  Order Items ({order.items.length})
                </Typography>
              </Box>

              {isMobile ? (
                <Accordion
                  defaultExpanded={order.items.length < 5}
                  disableGutters
                  elevation={0}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ px: 0, borderBottom: 1, borderColor: "divider" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        pr: 2,
                      }}
                    >
                      <Typography fontWeight="medium">
                        <Badge
                          badgeContent={order.items.length}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <ShoppingBagIcon fontSize="small" />
                        </Badge>
                        View Items
                      </Typography>
                      <Typography fontWeight="medium">
                        KSh {total.toLocaleString()}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0 }}>
                    {order.items.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            py: 1.5,
                          }}
                        >
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {item.product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Qty: {item.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="body1">
                            KSh {(item.price * item.quantity).toLocaleString()}
                          </Typography>
                        </Box>
                        {index < order.items.length - 1 && (
                          <Divider sx={{ my: 0.5 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Box>
                  {order.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          py: 1.5,
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
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
                      {index < order.items.length - 1 && (
                        <Divider sx={{ my: 0.5 }} />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              )}

              <Divider sx={{ mt: 2, mb: 2 }} />

              {/* Order Summary */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  KSh {total.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Payment Info Sidebar */}
        <Box sx={{ flex: { xs: 1, md: 1 }, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Payment Information */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <ReceiptLongIcon color="primary" />
                <Typography variant="h6" fontWeight="medium">
                  Payment Status
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <StatusChip status={paymentStatus || "pending"} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={() => navigate("/orders")}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: "medium",
              textTransform: "none",
            }}
          >
            View All Orders
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default OrderConfirmation;