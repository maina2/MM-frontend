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
  SelectChangeEvent,
} from "@mui/material";
import {
  useSearchProductsQuery,
  useGetCategoriesQuery,
} from "../../api/apiSlice";
import ProductCard from "../../components/ProductCard";

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : undefined;
  const min_price = searchParams.get("min_price")
    ? Number(searchParams.get("min_price"))
    : undefined;
  const max_price = searchParams.get("max_price")
    ? Number(searchParams.get("max_price"))
    : undefined;
  const sort_by = searchParams.get("sort_by") || "name";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [filterMinPrice, setFilterMinPrice] = useState(min_price?.toString() || "");
  const [filterMaxPrice, setFilterMaxPrice] = useState(max_price?.toString() || "");

  const { data, isLoading, isError } = useSearchProductsQuery({
    q,
    category,
    min_price,
    max_price,
    sort_by,
    page,
    page_size: 12,
  });

  const { data: categories } = useGetCategoriesQuery();

  const handleFilterChange = () => {
    const newParams = new URLSearchParams(searchParams);
    if (filterMinPrice) newParams.set("min_price", filterMinPrice);
    else newParams.delete("min_price");
    if (filterMaxPrice) newParams.set("max_price", filterMaxPrice);
    else newParams.delete("max_price");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) newParams.set("category", e.target.value);
    else newParams.delete("category");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
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

  const totalPages = data?.count ? Math.ceil(data.count / 12) : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {q ? `Results for "${q}" (${data?.count || 0} found)` : "All Products"}
      </Typography>

      {/* Main layout using CSS Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Filters Sidebar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "fit-content",
            p: { xs: 2, md: 0 },
            border: { xs: "1px solid", md: "none" },
            borderColor: { xs: "grey.300", md: "transparent" },
            borderRadius: { xs: 2, md: 0 },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category?.toString() || ""}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories?.map((cat) => (
                <MenuItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Min Price"
            type="number"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            label="Max Price"
            type="number"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
          />

          <Button 
            variant="contained" 
            onClick={handleFilterChange} 
            fullWidth
            sx={{ mt: 1 }}
          >
            Apply Filters
          </Button>
        </Box>

        {/* Products Section */}
        <Box>
          {/* Sort Controls */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sort_by}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="name">Name: A-Z</MenuItem>
                <MenuItem value="-name">Name: Z-A</MenuItem>
                <MenuItem value="price">Price: Low to High</MenuItem>
                <MenuItem value="-price">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          )}

          {/* Error State */}
          {isError && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="error" variant="h6">
                Failed to load results
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Please try again later
              </Typography>
            </Box>
          )}

          {/* No Results State */}
          {data?.results?.length === 0 && !isLoading && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search terms or filters
              </Typography>
            </Box>
          )}

          {/* Products Grid */}
          {data?.results && data.results.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 3,
                mb: 4,
              }}
            >
              {data.results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SearchResults;