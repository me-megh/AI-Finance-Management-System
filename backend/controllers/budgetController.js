// Pure logic ko export karo (data return kare, res.json nahi)
const getNodePrediction = ({ userId, income, spendingHistory }) => {
    const totalSpending = Object.values(spendingHistory).reduce((a, b) => a + b, 0);
    const savings = income - totalSpending;
  
    const recommendedBudgets = {};
    for (const [category, amount] of Object.entries(spendingHistory)) {
      recommendedBudgets[category] = {
        current: amount,
        recommended: Math.max(0, amount * 0.9), // demo: 10% cut
      };
    }
  
    return {
      userId,
      recommendedBudgets,
      savings: savings > 0 ? savings : 0,
    };
  };
  
  // Old Express handler ab bhi kaam karega
  const predictBudget = async (req, res) => {
    try {
      const { userId, income, spendingHistory } = req.body;
      if (!userId || !income || !spendingHistory) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const result = getNodePrediction({ userId, income, spendingHistory });
      res.json(result);
    } catch (error) {
      console.error("Prediction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  module.exports = { predictBudget, getNodePrediction };
  