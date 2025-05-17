import React from "react";
import { Card, CardMedia, CardContent, Typography, Button, Box } from "@mui/material";
import { ShoppingCart } from "lucide-react";
import { Product } from "../types";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  showDiscount?: boolean;
  onAddToCart?: (e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  compact = false,
  showDiscount = false,
  onAddToCart,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        alignItems: compact ? "center" : "stretch",
        p: compact ? 1 : 2,
        width: "100%",
        position: "relative",
        cursor: "pointer",
        "&:hover": { boxShadow: 6 },
      }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      {/* Discount Badge */}
      {showDiscount && product.discount_percentage && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            bgcolor: "red",
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          -{product.discount_percentage}%
        </Box>
      )}
      <CardMedia
        component="img"
        image={product.image || "https://placehold.co/150x150?text=No+Image"}
        alt={product.name}
        sx={{
          width: compact ? 60 : 150,
          height: compact ? 60 : 150,
          objectFit: "cover",
          mr: compact ? 2 : 0,
        }}
      />
      <CardContent sx={{ flex: 1, p: compact ? 0 : 2 }}>
        <Typography variant={compact ? "body2" : "h6"}>{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {product.category?.name || "No category"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          {showDiscount && product.discounted_price && (
            <>
              <Typography variant={compact ? "body2" : "h6"} color="primary">
                KSh {product.discounted_price.toLocaleString()}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                KSh {product.price.toLocaleString()}
              </Typography>
            </>
          )}
          {!showDiscount && (
            <Typography variant={compact ? "body2" : "h6"} color="primary">
              KSh {product.price.toLocaleString()}
            </Typography>
          )}
        </Box>
        {!compact && (
          <Button
            variant="contained"
            size="small"
            startIcon={<ShoppingCart size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(e);
            }}
            disabled={product.stock === 0}
            sx={{ mt: 1 }}
          >
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;