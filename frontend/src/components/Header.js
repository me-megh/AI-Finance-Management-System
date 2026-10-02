"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Button } from "@mui/material";

const Header = ({ tabIndex, handleTabChange, userName, handleLogout }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#28a745" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left side - App Title */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Finance Manager
        </Typography>

        {/* Middle - Tabs */}
        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: "white", height: "3px", borderRadius: "2px" },
            }}
          >
            <Tab
              label="Add Transaction"
              sx={{
                "&.Mui-selected": { fontWeight: "bold", color: "white" },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px" },
              }}
            />
            <Tab
              label="Transaction List"
              sx={{
                "&.Mui-selected": { fontWeight: "bold", color: "white" },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px" },
              }}
            />
            <Tab
              label="Budgeting"
              sx={{
                "&.Mui-selected": { fontWeight: "bold", color: "white" },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px" },
              }}
            />
            <Tab
              label="Investment"
              sx={{
                "&.Mui-selected": { fontWeight: "bold", color: "white" },
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "8px" },
              }}
            />
          </Tabs>
        </Box>

        {/* Right side - User Info + Logout */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body1">Hi, {userName || "User"} 👋</Typography>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              backgroundColor: "white",
              color: "#28a745",
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { backgroundColor: "#e6f4ea" },
              borderRadius: "8px",
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
