// backend/routes/userRoutes.js
const express = require("express");
const User = require("../models/User"); // User model
const router = express.Router();

// Get user by ID
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the request parameters

  try {
    // Fetch user data from MongoDB using the userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data
    res.json({
      income: user.income,
      savings_rate: user.savings_rate,
      risk_profile: user.risk_profile,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

module.exports = router;
