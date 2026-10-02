import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Pagination, // Import MUI Pagination
} from "@mui/material";

// Add categories array
const categories = [
  "Groceries",
  "Rent",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Utilities",
];

const TransactionList = ({ refreshTransactions }) => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [selectedTransaction, setSelectedTransaction] = useState(null); // For editing
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [transactionsPerPage] = useState(5); // Number of transactions per page

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3001/api/transactions",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions(response.data.transactions);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching transactions");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions based on category and date range
  const filteredTransactions = transactions.filter((t) => {
    return (
      (categoryFilter ? t.category === categoryFilter : true) &&
      (dateFrom ? new Date(t.date) >= new Date(dateFrom) : true) &&
      (dateTo ? new Date(t.date) <= new Date(dateTo) : true)
    );
  });
  const sortedTransactions = filteredTransactions.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Get current transactions to display based on page and items per page
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `http://localhost:3001/api/transactions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTransactions(
          transactions.filter((transaction) => transaction._id !== id)
        );
        setSnackbarMessage("Transaction deleted successfully!");
        setSnackbarSeverity("error"); // Red for success in deletion
        setOpenSnackbar(true);
      } catch (err) {
        setSnackbarMessage("Error deleting transaction");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setCategory(transaction.category);
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (isLoading) return; // Prevent double submission
    setIsLoading(true);

    try {
      const updatedTransaction = { ...selectedTransaction, category };
      const response = await axios.put(
        `http://localhost:3001/api/transactions/${selectedTransaction._id}`,
        updatedTransaction,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const updatedTransactions = transactions.map((transaction) =>
        transaction._id === selectedTransaction._id
          ? response.data
          : transaction
      );

      setTransactions(updatedTransactions); // Update the transactions state
      setSnackbarMessage("Transaction updated successfully!");
      setSnackbarSeverity("success"); // Set success severity
      setOpenSnackbar(true);
      setOpenEditDialog(false);
    } catch (err) {
      setSnackbarMessage("Error updating transaction");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false); // Close the Snackbar
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f1f9f4" /* Light Greenish Grey */ }}>
      {error && (
        <Typography
          variant="body1"
          color="error"
          align="center"
          style={{ marginBottom: "20px" }}
        >
          {error}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          padding: "20px",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
              sx={{
                backgroundColor: "#e0f7e9", // Light mint background
                borderColor: "#28a745", // Green border for select field
              }}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat, i) => (
                <MenuItem key={i} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            sx={{ backgroundColor: "#e0f7e9", borderColor: "#28a745" }}
          />

          <TextField
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            sx={{ backgroundColor: "#e0f7e9", borderColor: "#28a745" }}
          />
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0f7e9" }}>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Amount
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Description
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Type
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTransactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  {new Date(transaction.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEdit(transaction)}
                    sx={{
                      backgroundColor: "#28a745", // Green button for edit
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#218838", // Darker green on hover
                      },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(transaction._id)}
                    sx={{
                      backgroundColor: "#f44336", // Red button for delete
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#d32f2f", // Darker red on hover
                      },
                      marginLeft: "10px",
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <Pagination
            count={Math.ceil(sortedTransactions.length / transactionsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </TableContainer>

      {/* Snackbar for success/error */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            padding: "16px", 
            fontSize: "18px", 
            fontWeight: "bold", 
            borderRadius: "8px", 
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", 
            color: snackbarSeverity === "error" ? "#f44336" : "#28a745",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Edit Transaction Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle
          sx={{ backgroundColor: "#f1f8f4", fontWeight: "bold", color: "#333" }}
        >
          Edit Transaction
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#f1f8f4" }}>
          <TextField
            label="Amount"
            value={selectedTransaction?.amount || ""}
            onChange={(e) =>
              setSelectedTransaction({
                ...selectedTransaction,
                amount: e.target.value,
              })
            }
            fullWidth
            sx={{
              marginBottom: 2,
              "& .MuiInputBase-root": {
                borderColor: "#28a745", 
              },
            }}
          />
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderColor: "#28a745",
                },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Description"
            value={selectedTransaction?.description || ""}
            onChange={(e) =>
              setSelectedTransaction({
                ...selectedTransaction,
                description: e.target.value,
              })
            }
            fullWidth
            sx={{
              marginBottom: 2,
              "& .MuiInputBase-root": {
                borderColor: "#28a745",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#f1f8f4" }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              color: "#333",
              borderRadius: "5px",
              padding: "6px 12px",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            sx={{
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "5px",
              padding: "6px 12px",
              "&:hover": {
                backgroundColor: "#218838",
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TransactionList;
