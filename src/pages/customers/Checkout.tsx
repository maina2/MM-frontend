import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { RootState } from "../../store/store";
import { useCheckoutMutation, useGetBranchesQuery } from "../../api/apiSlice";
import { clearCart } from "../../store/cartSlice";
import { Branch } from "../../types";

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface CartItem {
  product: { id: number; name: string; price: number; branch?: Branch | number };
  quantity: number;
}

const Checkout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(
    (state: RootState) => state.cart.items
  ) as CartItem[];
  const user = useSelector((state: RootState) => state.auth.user);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [selectedBranch, setSelectedBranch] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [checkout, { isLoading }] = useCheckoutMutation();
  const { data: branches, isLoading: branchesLoading, error: branchesError } =
    useGetBranchesQuery();

  // Debug branches and cart items
  useEffect(() => {
    console.log("Branches data:", branches);
    console.log("Branches loading:", branchesLoading);
    console.log("Branches error:", branchesError);
    console.log("Cart items:", JSON.stringify(cartItems, null, 2));
  }, [branches, branchesLoading, branchesError, cartItems]);

  // Check for empty branches
  useEffect(() => {
    if (
      !branchesLoading &&
      branches &&
      Array.isArray(branches.results) &&
      branches.results.length === 0
    ) {
      setError("No branches available. Please contact support.");
    }
  }, [branches, branchesLoading]);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          setError(
            "Unable to retrieve location. Please select manually on the map."
          );
          console.error(err);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Map click handler to update position
  const MapEvents: React.FC = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        setError(null);
      },
    });
    return null;
  };

  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Handle branch selection
  const handleBranchChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedBranch(event.target.value as number);
    setError(null);
  };

  // Checkout handler
  const handleCheckout = async () => {
    if (!user) {
      setError("You must be logged in to checkout.");
      navigate("/login");
      return;
    }

    if (!phoneNumber) {
      setError("Phone number is required for payment.");
      return;
    }

    if (!position) {
      setError("Please select a delivery location on the map.");
      return;
    }

    if (!selectedBranch) {
      setError("Please select a branch.");
      return;
    }

    if (!cartItems.length) {
      setError("Cart is empty.");
      return;
    }

    const phoneRegex = /^\+?2547[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError(
        "Phone number must be in the format +2547XXXXXXXX or 2547XXXXXXXX."
      );
      return;
    }

    // Validate cart items' branch
    const invalidItems = cartItems.filter((item) => {
      const branch = item.product.branch;
      return typeof branch === "object" && branch !== null && branch.id !== selectedBranch;
    });

    if (invalidItems.length > 0) {
      setError("Some items are not available at the selected branch.");
      return;
    }

    setError(null);

    try {
      const checkoutData = {
        cart_items: cartItems.map((item) => ({
          product: {
            id: item.product.id,
            price: item.product.price,
            branch_id:
              typeof item.product.branch === "object" && item.product.branch !== null
                ? item.product.branch.id
                : item.product.branch || selectedBranch,
          },
          quantity: item.quantity,
        })),
        phone_number: phoneNumber,
        latitude: position.lat,
        longitude: position.lng,
        branch_id: selectedBranch,
      };

      console.log(
        "Sending checkout data:",
        JSON.stringify(checkoutData, null, 2)
      );
      const response = await checkout(checkoutData).unwrap();
      console.log("Checkout response:", JSON.stringify(response, null, 2));

      if (!response.order?.id) {
        throw new Error("Invalid response: Order ID not found.");
      }

      dispatch(clearCart());

      alert("STK Push sent to your phone. Please complete the payment.");
      console.log(
        "Navigating to order confirmation with order ID:",
        response.order.id
      );
      navigate(`/order-confirmation/${response.order.id}`);
    } catch (err: any) {
      console.error("Checkout error details:", JSON.stringify(err, null, 2));
      const errorMessage =
        err.data?.error || "Checkout failed. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Cart Summary */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cart Summary
        </Typography>
        <List>
          {cartItems.length === 0 ? (
            <Typography color="textSecondary">Your cart is empty.</Typography>
          ) : (
            cartItems.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${item.product.name} (x${item.quantity})`}
                  secondary={`KSh ${item.product.price * item.quantity}`}
                />
              </ListItem>
            ))
          )}
        </List>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
          Total: KSh {totalAmount.toFixed(2)}
        </Typography>
      </Paper>

      {/* Phone Number Input */}
      <TextField
        label="Phone Number (e.g., +254712345678)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        disabled={isLoading}
      />

      {/* Map for Delivery Location */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Select Delivery Location
      </Typography>
      <Box sx={{ height: "400px", mb: 3 }}>
        {position ? (
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[position.lat, position.lng]} />
            <MapEvents />
          </MapContainer>
        ) : (
          <Typography color="textSecondary">
            Loading map... Click to set your delivery location.
          </Typography>
        )}
      </Box>

      {/* Branch Selection */}
      <FormControl fullWidth margin="normal" disabled={isLoading || branchesLoading}>
        <InputLabel id="branch-select-label">Select Branch</InputLabel>
        <Select
          labelId="branch-select-label"
          value={selectedBranch}
          label="Select Branch"
          onChange={(e) => setSelectedBranch(e.target.value as number)}
        >
          <MenuItem value="">
            <em>Select a branch</em>
          </MenuItem>
          {branchesLoading ? (
            <MenuItem disabled>Loading branches...</MenuItem>
          ) : Array.isArray(branches?.results) && branches.results.length > 0 ? (
            branches.results.map((branch: Branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name} - {branch.address}, {branch.city}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No branches available</MenuItem>
          )}
        </Select>
      </FormControl>
      {branchesError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load branches. Please try again.
        </Alert>
      )}

      {/* Checkout Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCheckout}
        disabled={
          isLoading ||
          cartItems.length === 0 ||
          !position ||
          !selectedBranch ||
          branchesLoading ||
          !Array.isArray(branches?.results) ||
          branches.results.length === 0
        }
        fullWidth
        sx={{ py: 1.5, mt: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : "Checkout with M-Pesa"}
      </Button>
    </Container>
  );
};

export default Checkout;