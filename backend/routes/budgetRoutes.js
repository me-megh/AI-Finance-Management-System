// routes/predictRoutes.js
const express = require("express");
const axios = require("axios");
const { getNodePrediction } = require("../controllers/predictController");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.get("/combined", async (req, res) => {
    const { userId } = req.query;
  
    if (!userId) return res.status(400).json({ error: "userId required" });
  
    try {
      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const transactions = await Transaction.find({ userId });
  
      const income = user.monthlyIncome;
      const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      const savingsRate = ((income - expenses) / income) * 100;
  
      const spendingHistory = {};
      transactions
        .filter(t => t.type === "expense")
        .forEach(t => {
          spendingHistory[t.category] = (spendingHistory[t.category] || 0) + t.amount;
        });
  
      // FastAPI budget prediction
      const fastApiRes = await axios.post("http://localhost:8000/predict_budget", {
        userId,
        income,
        spendingHistory,
      });
  
      // FastAPI investment prediction
      const investmentRes = await axios.post("http://localhost:8000/predict_investment", {
        userId,
        income,
        savings_rate: savingsRate,
        risk_profile: user.riskProfile || 2
      });
  
      res.json({
        fastApiPrediction: fastApiRes.data,
        investmentPrediction: investmentRes.data,
        savingsRate,
        income
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
