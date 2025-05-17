import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Typography,
  Grid2,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { useSearchProductsQuery, useGetCategoriesQuery } from "../api/apiSlice";
import ProductCard from "../components/ProductCard";

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") ? Number(searchParams.get("category")) : undefined;
  const min_price = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
  const max_price = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
  const sort_by = searchParams.get("sort_by") || "name";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [filterMinPrice, setFilterMinPrice] = useState(min_price || "");
  const [filterMaxPrice, setFilterMaxPrice] = useState(max_price || "");

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
    if (filterMinPrice) newParams.set("min_price", filterMinPrice.toString());
    else newParams.delete("min_price");
    if (filterMaxPrice) newParams.set("max_price", filterMaxPrice.toString());
    else newParams.delete("max_price");
    newParams.set("page", "1");
    setSearchParams(newParams);
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

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", value.toString());
    setSearchParams(newParams);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {q ? `Results for "${q}" (${data?.count || 0} found)` : "All Products"}
      </Typography>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 3 }}>
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
            label="Min Price"
            type="number"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Max Price"
            type="number"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleFilterChange} fullWidth>
            Apply Filters
          </Button>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 9 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sort_by} onChange={handleSortChange} label="Sort By">
                <MenuItem value="name">Name: A-Z</MenuItem>
                <MenuItem value="-name">Name: Z-A</MenuItem>
                <MenuItem value="price">Price: Low to High</MenuItem>
                <MenuItem value="-price">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {isLoading && <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />}
          {isError && <Typography color="error">Failed to load results</Typography>}
          {data?.results?.length === 0 && (
            <Typography>No products found. Try another search term.</Typography>
          )}
          <Grid2 container spacing={2}>
            {data?.results?.map((product) => (
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                <ProductCard product={product} />
              </Grid2>
            ))}
          </Grid2>
          {data?.count > 12 && (
            <Pagination
              count={Math.ceil((data?.count || 0) / 12)}
              page={page}
              onChange={handlePageChange}
              sx={{ mt: 4, display: "flex", justifyContent: "center" }}
            />
          )}
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default SearchResults;