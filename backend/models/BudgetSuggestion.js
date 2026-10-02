// backend/models/BudgetSuggestion.js
const mongoose = require('mongoose');

const budgetCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  currentMonthlyAvg: { type: Number, default: 0 }, // last 90d normalized (≈30d)
  recommended: { type: Number, default: 0 },
  delta: { type: Number, default: 0 }, // recommended - currentMonthlyAvg
  tip: { type: String, default: '' },
  bucket: { type: String, enum: ['essential', 'nonessential'], default: 'nonessential' }
}, { _id: false });

const budgetSuggestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  windowDays: { type: Number, default: 90 },
  monthlyIncomeEstimate: { type: Number, default: 0 },
  totalRecommendedSpend: { type: Number, default: 0 },
  recommendedSavings: { type: Number, default: 0 },
  targetSavings: { type: Number, default: 0 },
  categories: [budgetCategorySchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BudgetSuggestion', budgetSuggestionSchema);