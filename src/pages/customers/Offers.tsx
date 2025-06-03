import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
} from "@mui/material";
import { Filter, Grid3X3, List } from "lucide-react";
import { useGetOffersQuery, useGetCategoriesQuery } from "../../api/apiSlice";
import { useDispatch } from "react-redux";
import { addItem } from "../../store/cartSlice";
import ProductCard from "../../components/ProductCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Product } from "../../types";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  hover: { y: -5, transition: { duration: 0.3 } },
};

const Offers: React.FC = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : undefined;
  const min_discount = searchParams.get("min_discount")
    ? Number(searchParams.get("min_discount"))
    : undefined;
  const max_price = searchParams.get("max_price")
    ? Number(searchParams.get("max_price"))
    : undefined;
  const sort_by = searchParams.get("sort_by") || "-discount_percentage";

  const [filterMinDiscount, setFilterMinDiscount] = useState(
    min_discount || ""
  );
  const [filterMaxPrice, setFilterMaxPrice] = useState(max_price || "");

  const { data, isLoading, isError } = useGetOffersQuery({
    page,
    page_size: 12,
    category,
    min_discount,
    max_price,
    sort_by,
  });
  const { data: categories } = useGetCategoriesQuery();

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addItem({ product, quantity: 1 }));
  };

  const handleFilterChange = () => {
    const newParams = new URLSearchParams(searchParams);
    if (filterMinDiscount)
      newParams.set("min_discount", filterMinDiscount.toString());
    else newParams.delete("min_discount");
    if (filterMaxPrice) newParams.set("max_price", filterMaxPrice.toString());
    else newParams.delete("max_price");
    newParams.set("page", "1");
    setSearchParams(newParams);
    setFilterDrawerOpen(false);
  };

  const handleCategoryChange = (e: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) newParams.set("category", e.target.value.toString());
    else newParams.delete("category");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleSortChange = (e: any) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort_by", e.target.value);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", value.toString());
    setSearchParams(newParams);
  };

  const renderFilters = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category || ""}
          onChange={handleCategoryChange}
          label="Category"
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories?.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Min Discount (%)"
        type="number"
        value={filterMinDiscount}
        onChange={(e) => setFilterMinDiscount(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Max Price (KSh)"
        type="number"
        value={filterMaxPrice}
        onChange={(e) => setFilterMaxPrice(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleFilterChange} fullWidth>
        Apply Filters
      </Button>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Failed to load offers</Typography>
        <Typography color="text.secondary" mt={1}>
          Please try again later
        </Typography>
      </Box>
    );
  }

  if (!data?.results || data.results.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">No offers available</Typography>
        <Typography color="text.secondary" mt={1}>
          Check out our{" "}
          <Link to="/products" className="text-primary">
            full product range
          </Link>
          !
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          textAlign: "center",
          py: 4,
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Exclusive Offers
        </Typography>
        <Typography variant="subtitle1">
          Save big on your favorite products!
        </Typography>
      </Box>

      {/* Mobile Filter and View Toggle */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <IconButton onClick={() => setFilterDrawerOpen(true)}>
          <Filter size={20} />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            bgcolor: "grey.100",
            borderRadius: 1,
            p: 0.5,
          }}
        >
          <IconButton
            onClick={() => setViewMode("grid")}
            sx={{
              bgcolor: viewMode === "grid" ? "primary.main" : "transparent",
              color: viewMode === "grid" ? "white" : "grey.700",
            }}
          >
            <Grid3X3 size={20} />
          </IconButton>
          <IconButton
            onClick={() => setViewMode("compact")}
            sx={{
              bgcolor: viewMode === "compact" ? "primary.main" : "transparent",
              color: viewMode === "compact" ? "white" : "grey.700",
            }}
          >
            <List size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Main Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          width: "100%",
        }}
      >
        {/* Desktop Filters */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 25%" }, // 3/12 = 25%
            width: { xs: "100%", md: "25%" },
            display: { xs: "none", md: "block" },
          }}
        >
          {renderFilters()}
        </Box>

        {/* Products */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", md: "1 1 75%" }, // 9/12 = 75%
            width: { xs: "100%", md: "75%" },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sort_by}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="-discount_percentage">
                  Discount: High to Low
                </MenuItem>
                <MenuItem value="discount_percentage">
                  Discount: Low to High
                </MenuItem>
                <MenuItem value="price">Price: Low to High</MenuItem>
                <MenuItem value="-price">Price: High to Low</MenuItem>
                <MenuItem value="name">Name: A-Z</MenuItem>
                <MenuItem value="-name">Name: Z-A</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {viewMode === "grid" && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                width: "100%",
              }}
            >
              {data.results.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    flex: {
                      xs: "1 1 100%", // xs={12}
                      sm: "1 1 50%", // sm={6}
                      md: "1 1 33.333%", // md={4}
                    },
                    width: { xs: "100%", sm: "50%", md: "33.333%" },
                    minWidth: 0, // Prevent overflow
                  }}
                >
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={(e) => handleAddToCart(product, e)}
                      showDiscount
                    />
                  </motion.div>
                </Box>
              ))}
            </Box>
          )}

          {viewMode === "compact" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.results.map((product) => (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <ProductCard
                    product={product}
                    compact
                    onAddToCart={(e) => handleAddToCart(product, e)}
                    showDiscount
                  />
                </motion.div>
              ))}
            </Box>
          )}

          {data.count > 12 && (
            <Pagination
              count={Math.ceil(data.count / 12)}
              page={page}
              onChange={handlePageChange}
              sx={{ mt: 4, display: "flex", justifyContent: "center" }}
            />
          )}
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: "80%", maxWidth: 300 } }}
      >
        {renderFilters()}
      </Drawer>
    </Box>
  );
};

export default Offers;