import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Paper, Typography, Box } from "@mui/material";

// Register chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const categories = [
  "Groceries",
  "Rent",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Utilities",
];

const SpendingSummaryAndChart = ({ transactions, income }) => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Function to format currency as INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };



  useEffect(() => {
    // Calculate total income and total expense
    const totalIncome = income; // Use the income passed from the parent component
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    setTotalIncome(totalIncome); // Set real income
    setTotalExpense(totalExpense); // Calculate total expense
  }, [transactions, income]); // Re-run when transactions or income changes

  // Prepare pie chart data
  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categories.map((cat) => {
          return transactions
            .filter((t) => t.category === cat)
            .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        }),
        backgroundColor: [
          "#ff6384", // Groceries
          "#36a2eb", // Rent
          "#cc65fe", // Transport
          "#ffce56", // Entertainment
          "#4caf50", // Healthcare
          "#ff5733", // Utilities
        ],
      },
    ],
  };

  return (
    <Box
      sx={{
        padding: 2,
        textAlign: "center",
        backgroundColor: "#f1f9f4", // Light Greenish Grey
      }}
    >
      <Paper
        sx={{
          padding: 3,
          borderRadius: 8,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#ffffff", // White background
        }}
      >
        <Typography variant="h6" color="textPrimary" gutterBottom>
          Spending Summary
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ marginBottom: 1 }}
        >
          Total Income: {formatCurrency(totalIncome)} {/* Use real income */}
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ marginBottom: 1 }}
        >
          Total Expense: {formatCurrency(totalExpense)}
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ marginBottom: 2 }}
        >
          Savings: {formatCurrency(totalIncome - totalExpense)}{" "}
          {/* Use totalIncome */}
        </Typography>

        <Typography variant="h6" color="textPrimary" gutterBottom>
          Spending by Category
        </Typography>
        <Pie data={pieData} />
      </Paper>
    </Box>
  );
};

export default SpendingSummaryAndChart;
