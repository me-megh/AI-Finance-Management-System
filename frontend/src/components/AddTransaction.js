"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Snackbar, Button, MenuItem, Select, FormControl, InputLabel, Box, TextField, Alert } from "@mui/material";

function AddTransaction({ refreshTransactions }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const categories = [
    "Groceries",
    "Rent",
    "Transport",
    "Entertainment",
    "Healthcare",
    "Utilities",
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("userId");

    if (storedUser) {
      setUser({ _id: storedUser }); // Set userId in the user state as an object
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending transaction data to the backend
      const response = await axios.post(
        "http://localhost:3001/api/transactions", // Ensure this matches your backend route
        {
          amount,
          category,
          description,
          type,
          userId: user._id, // Add user._id or handle error if user is not found
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

   
      // Set success message for Snackbar
      setSnackbarMessage("Transaction added successfully!");
      setSnackbarSeverity("success"); // Success message
      setOpenSnackbar(true);

      // Reset form fields
      setAmount("");
      setCategory("");
      setDescription("");
      setType("expense");

      refreshTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Error adding transaction");

      setSnackbarMessage("Error adding transaction.");
      setSnackbarSeverity("error"); // Error message
      setOpenSnackbar(true);
    }
  };
  const handleSnackbarClose = () => {
    setOpenSnackbar(false); // Close the Snackbar
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 3,
        backgroundColor: "#ffffff" /* White background for form */,
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {error && (
        <p style={{ color: "#f44336", textAlign: "center" }}>{error}</p>
      )}

      <TextField
        label="Amount"
        variant="outlined"
        fullWidth
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        required
        sx={{
          marginBottom: 2,
          backgroundColor: "#e0f7e9" /* Light Mint background */,
        }}
      />

      <FormControl fullWidth required sx={{ marginBottom: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          label="Category"
          sx={{
            backgroundColor: "#e0f7e9" /* Light Mint background */,
            borderColor: "#28a745",
          }}
        >
          {categories.map((categoryOption, index) => (
            <MenuItem key={index} value={categoryOption}>
              {categoryOption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Description"
        variant="outlined"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{
          marginBottom: 2,
          backgroundColor: "#e0f7e9" /* Light Mint background */,
        }}
      />

      <FormControl fullWidth required sx={{ marginBottom: 2 }}>
        <InputLabel>Transaction Type</InputLabel>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          label="Transaction Type"
          sx={{
            backgroundColor: "#e0f7e9" /* Light Mint background */,
            borderColor: "#28a745",
          }}
        >
          <MenuItem value="expense">Expense</MenuItem>
          <MenuItem value="income">Income</MenuItem>
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: "#28a745" /* Green button */,
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          marginTop: 2,
          "&:hover": {
            backgroundColor: "#218838" /* Darker green on hover */,
          },
        }}
      >
        Add Transaction
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000} // Duration before Snackbar auto closes
        onClose={handleSnackbarClose}
        anchorOrigin={{
          vertical: "bottom",  // Position at the bottom
          horizontal: "center",  // Center horizontally
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity} // Success/Error
          sx={{
            width: "100%",
            padding: "16px",  // Larger padding for better visibility
            fontSize: "18px", // Larger font size
            fontWeight: "bold", // Make the text bold
            borderRadius: "8px", // Rounded corners
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Add shadow
            color: snackbarSeverity === "success" ? "#28a745" : "#f44336", // Green text for success, red for error
          }}
        >
          {snackbarMessage} {/* Show success or error message */}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AddTransaction;
