const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/predict_investment", async (req, res) => {
  try {
    const { income, savings_rate, risk_profile ,totalSavings} = req.body;

    const investableAmount = totalSavings 
    ? totalSavings 
    : Math.round((income * savingsRate) / 100);

    // Make sure all values are present
    if (!income || !savings_rate || risk_profile === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Call FastAPI
    const response = await axios.post("http://localhost:8000/predict_investment", {
      income,
      savings_rate,
      risk_profile,
    });

    res.json({
        recommended_investment: `Based on risk profile ${riskProfile}, you should invest ₹${investableAmount}`
      });
  } catch (err) {
    console.error("Error calling FastAPI:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch prediction from FastAPI" });
  }
});

module.exports = router;
