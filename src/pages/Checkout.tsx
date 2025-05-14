import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { RootState } from "../store/store";
import { useCheckoutMutation } from "../api/apiSlice";

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface CartItem {
  product: { id: number; name: string; price: number };
  quantity: number;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const cartItems = useSelector(
    (state: RootState) => state.cart.items
  ) as CartItem[];
  const user = useSelector((state: RootState) => state.auth.user);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [checkout, { isLoading }] = useCheckoutMutation();

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

  // Checkout.tsx
  const handleCheckout = async () => {
    console.log("Starting checkout process...");
    console.log("User:", user);
    console.log("Phone Number:", phoneNumber);
    console.log("Position:", position);
    console.log("Cart Items:", cartItems);

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

    const phoneRegex = /^\+?2547[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError(
        "Phone number must be in the format +2547XXXXXXXX or 2547XXXXXXXX."
      );
      return;
    }

    setError(null);

    try {
      const checkoutData = {
        cart_items: cartItems.map((item) => ({
          product: { id: item.product.id, price: item.product.price },
          quantity: item.quantity,
        })),
        phone_number: phoneNumber,
        latitude: position.lat,
        longitude: position.lng,
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

      {/* Checkout Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCheckout}
        disabled={isLoading || cartItems.length === 0 || !position}
        fullWidth
        sx={{ py: 1.5 }}
      >
        {isLoading ? <CircularProgress size={24} /> : "Checkout with M-Pesa"}
      </Button>
    </Container>
  );
};

export default Checkout;
