import React from "react";
import { Card, CardMedia, CardContent, Typography, Button } from "@mui/material";
import { Product } from "../types";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        alignItems: compact ? "center" : "stretch",
        p: compact ? 1 : 2,
        width: "100%",
      }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
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
        <Typography variant={compact ? "body2" : "h6"} color="primary">
          KSh {product.price}
        </Typography>
        {!compact && (
          <Button variant="contained" size="small" sx={{ mt: 1 }}>
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;