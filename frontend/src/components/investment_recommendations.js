import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Divider,
  Chip,
} from "@mui/material";

const InvestmentRecommendations = ({
  userId,
  investmentGoals,
  income,
  savingsRate,
  riskProfile,
  totalExpense,
  totalSavings,
}) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investableAmount, setInvestableAmount] = useState(0);
  // Define risk-based allocations
  const riskAllocations = {
    1: [
      { type: "FD / Savings Account", percent: 60 },
      { type: "Bonds / Conservative Mutual Funds", percent: 40 },
    ],
    2: [
      { type: "Balanced Mutual Funds", percent: 50 },
      { type: "Bonds / Conservative Mutual Funds", percent: 30 },
      { type: "FD / Savings Account", percent: 20 },
    ],
    3: [
      { type: "Equity Mutual Funds", percent: 50 },
      { type: "Stocks / Aggressive Mutual Funds", percent: 40 },
      { type: "Balanced Mutual Funds", percent: 10 },
    ],
  };

  const investmentDetails = {
    "FD / Savings Account": {
      color: "#007bff",
      description:
        "Safe option with guaranteed returns. Suitable for low-risk investors.",
    },
    "Bonds / Conservative Mutual Funds": {
      color: "#28a745",
      description:
        "Moderate returns with lower risk. Ideal for balanced portfolios.",
    },
    "Balanced Mutual Funds": {
      color: "#ffc107",
      description:
        "Mix of equity and debt. Suitable for medium-risk investors.",
    },
    "Equity Mutual Funds": {
      color: "#fd7e14",
      description:
        "Higher returns with moderate risk. For those willing to take some risk.",
    },
    "Stocks / Aggressive Mutual Funds": {
      color: "#dc3545",
      description:
        "High-risk, high-reward investments. Suitable for experienced investors.",
    },
  };

  useEffect(() => {
    if (
      income &&
      (savingsRate !== undefined || savings !== undefined) && // ✅ FIXED
      riskProfile !== undefined
    ) {
      setLoading(true);
      setError(null);

      // priority: totalSavings (explicit) -> income - totalExpense -> (income * savingsRate / 100) -> 0
      let calculatedInvestable = 0;
      if (
        typeof totalSavings === "number" &&
        !isNaN(totalSavings) &&
        totalSavings >= 0
      ) {
        calculatedInvestable = Math.round(totalSavings);
      } else if (typeof totalExpense === "number" && !isNaN(totalExpense)) {
        calculatedInvestable = Math.round(
          (Number(income) || 0) - Number(totalExpense)
        );
      } else if (savingsRate !== undefined && !isNaN(savingsRate)) {
        calculatedInvestable = Math.round(
          ((Number(income) || 0) * Number(savingsRate)) / 100
        );
      } else {
        calculatedInvestable = 0;
      }

      // clamp to >= 0
      if (calculatedInvestable < 0) calculatedInvestable = 0;

      setInvestableAmount(calculatedInvestable);

      const allocations = riskAllocations[riskProfile] || [];
      const portfolioData = allocations.map((item) => ({
        type: item.type,
        amount: Math.round((calculatedInvestable * item.percent) / 100),
        color: investmentDetails[item.type]?.color || "#6c757d",
        description: investmentDetails[item.type]?.description || "",
      }));

      setPortfolio(portfolioData);
      setLoading(false);
    }
  }, [income, savingsRate, riskProfile, totalExpense, totalSavings]);

  return (
    <Paper
      elevation={3}
      sx={{ p: 3, mt: 3, borderRadius: 3, backgroundColor: "#f8f9fa" }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        💡 Investment Recommendations
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Typography>Loading recommendations...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : portfolio.length ? (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Based on your <b>risk profile</b> and <b>total savings</b>, here’s
            how you can invest:
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            🎯 <b>Total Investable Amount:</b> ₹{investableAmount}
            <br />
            🪙 <b>Total Income:</b> ₹{income}
            <br />
            💸 <b>Total Expense:</b> ₹{totalExpense}
            <br />
            💰 <b>Total Savings (investable):</b> ₹
            {typeof totalSavings === "number"
              ? totalSavings
              : income - (totalExpense || 0)}
          </Typography>

          <List>
            {portfolio.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Chip
                  label={item.type}
                  sx={{
                    backgroundColor: item.color,
                    color: "#fff",
                    fontWeight: "bold",
                    mb: 1,
                  }}
                />
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {item.description}
                </Typography>
                <Typography variant="body1">
                  💰 Suggested Investment Amount: <b>₹{item.amount}</b>
                </Typography>
                {index < portfolio.length - 1 && <Divider sx={{ mt: 1 }} />}
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Typography>No recommendations available.</Typography>
      )}
    </Paper>
  );
};

export default InvestmentRecommendations;
