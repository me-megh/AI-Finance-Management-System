const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const predictRoutes = require("./routes/predictRoutes.js");
const investmentRoutes = require("./routes/investmentRoutes");
const User = require("./models/User.js");
const userRoutes = require("./routes/userRoutes");
const axios = require("axios");

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api", userRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api", investmentRoutes);
// Combined Predictions Route (Express -> FastAPI)
app.get("/api/predictions/combined", async (req, res) => {
  try {
    const { userId, windowDays } = req.query;

    // 🟢 1. Fetch user data from MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🟢 2. Extract fields
    const income = user.income || 0;
    const spendingHistory = user.spendingHistory || {};
    const savings_rate = user.savings_rate || 0;
    const risk_profile = user.risk_profile || 1;

    // 🟢 3. Call FastAPI backend with user data
    let fastApiPrediction = null;
    try {
      const response = await axios.post("http://localhost:8000/api/predictions/combined", {
        userId,
        income,
        spendingHistory,
        savings_rate,
        risk_profile,
      });
      fastApiPrediction = response.data;
    } catch (err) {
      console.error("Error calling FastAPI:", err.message);
    }

    // 🟢 4. Node.js side prediction (dummy for now)
    const nodePrediction = {
      categories: Object.entries(spendingHistory).map(([cat, amount]) => ({
        category: cat,
        currentMonthlyAvg: amount,
        recommended: Math.max(1000, amount * 0.9), // dummy recommendation
        bucket: ["Rent", "Groceries", "Utilities"].includes(cat) ? "essential" : "nonessential",
        tip: amount > (amount * 0.9) ? `⚠️ Overspending on ${cat}` : `✔️ ${cat} is on track`,
      })),
    };

    // 🟢 5. Send merged response to frontend
    res.json({
      fastApiPrediction,
      nodePrediction,
    });
  } catch (error) {
    console.error("Error in /api/predictions/combined:", error.message);
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});



// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
