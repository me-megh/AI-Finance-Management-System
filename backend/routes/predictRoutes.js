const express = require("express");
const router = express.Router();
const axios = require("axios");
const Transaction = require("../models/Transaction"); // your MongoDB model

router.post("/predict_budget", async (req, res) => {
  try {
    const { userId, income, savingsRate, riskProfile } = req.body;

    // 1️⃣ Fetch transactions from MongoDB
    const transactions = await Transaction.find({ userId });

    // 2️⃣ Calculate spendingHistory from DB data
    const spendingHistory = {};
    transactions.forEach((tx) => {
      if (!spendingHistory[tx.category]) spendingHistory[tx.category] = 0;
      spendingHistory[tx.category] += tx.amount;
    });

    // 3️⃣ Call FastAPI with real DB data
    const response = await axios.post("http://localhost:8000/api/predictions/combined", {
      userId,
      income,
      spendingHistory,
      savings_rate: savingsRate,
      risk_profile: riskProfile
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error calling FastAPI:", err.message);
    res.status(500).json({ error: "Failed to fetch predictions from FastAPI" });
  }
});

module.exports = router;
