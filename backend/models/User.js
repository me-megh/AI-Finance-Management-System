// backend/models/Users.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  income: { type: Number, default: 0 }, // Income of the user
  savings_rate: { type: Number, default: 0 }, // Savings rate calculated as (Savings / Income)
  risk_profile: {
    type: Number,
    enum: [1, 2, 3], // 1: Low, 2: Medium, 3: High risk
    default: 2, // Default to Medium risk
  },
});

const User = mongoose.model("User", userSchema, "users");
module.exports = User;
