import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TextField,
  CircularProgress,
  Paper,
  MenuItem,
  IconButton,
  Typography,
  useMediaQuery,
  ClickAwayListener,
  Box,
} from "@mui/material";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import { useSearchProductsQuery } from "../api/apiSlice";
import ProductCard from "./ProductCard";
import debounce from "lodash.debounce";

const SearchBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("recentSearches") || "[]")
  );
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { data, isLoading, isError } = useSearchProductsQuery(
    query ? { q: query, page_size: 5 } : { q: "", page_size: 0 },
    { skip: !query }
  );

  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setQuery(value);
      if (value) setOpen(true);
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSetQuery(value);
    setAnchorEl(e.currentTarget);
    if (!value) setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const updatedSearches = [query, ...recentSearches.filter((q) => q !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
  };

  const handleRecentSearch = (recent: string) => {
    setQuery(recent);
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(recent)}`);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (query && !open) setOpen(true);
  }, [query]);

  const renderDropdown = () => (
    <Paper
      sx={{
        width: isMobile ? "100%" : 400,
        maxHeight: 400,
        overflowY: "auto",
        p: 1,
        mt: isMobile ? 1 : 0,
        position: isMobile ? "static" : "absolute",
        zIndex: 1000,
        boxShadow: isMobile ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
        border: isMobile ? "1px solid grey.200" : "none",
      }}
    >
      {isLoading && <CircularProgress size={24} sx={{ m: 2 }} />}
      {isError && <Typography color="error" sx={{ p: 2 }}>
        Failed to load results
      </Typography>}
      {!query && recentSearches.length > 0 && (
        <>
          <Typography variant="caption" sx={{ p: 1, color: "text.secondary" }}>
            Recent Searches
          </Typography>
          {recentSearches.map((recent) => (
            <MenuItem key={recent} onClick={() => handleRecentSearch(recent)}>
              {recent}
            </MenuItem>
          ))}
        </>
      )}
      {query && data?.results?.length === 0 && (
        <Typography sx={{ p: 2 }}>No results found</Typography>
      )}
      {query && data?.results?.map((product) => (
        <MenuItem
          key={product.id}
          onClick={() => navigate(`/products/${product.id}`)}
        >
          <ProductCard product={product} compact />
        </MenuItem>
      ))}
    </Paper>
  );

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          width: isMobile ? "100%" : "auto",
          zIndex: 1100,
          padding: isMobile ? "0 8px" : 0,
        }}
      >
        <TextField
          value={query}
          onChange={handleInputChange}
          onFocus={(e) => {
            setAnchorEl(e.currentTarget);
            setOpen(true);
          }}
          placeholder="Search for products..."
          size="small"
          sx={{
            "& .MuiInputBase-root": {
              bgcolor: "grey.100",
              borderRadius: 1,
              pr: query ? 8 : 4,
            },
            width: isMobile ? "100%" : 300,
          }}
          InputProps={{
            endAdornment: (
              <>
                {query && (
                  <IconButton onClick={handleClear} size="small">
                    <FaTimes />
                  </IconButton>
                )}
                <IconButton type="submit" size="small">
                  <FaSearch />
                </IconButton>
              </>
            ),
          }}
          inputProps={{ "aria-label": "Search products" }}
        />
        {open && (
          <Box
            sx={{
              position: isMobile ? "relative" : "absolute",
              width: "100%",
              top: isMobile ? "auto" : "100%",
              left: 0,
              zIndex: 1000,
              mt: isMobile ? 1 : 0,
              maxWidth: isMobile ? "calc(100vw - 16px)" : "auto",
            }}
          >
            {renderDropdown()}
          </Box>
        )}
      </form>
    </ClickAwayListener>
  );
};

export default SearchBar;