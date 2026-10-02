// frontend/src/services/budgetApi.js
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function fetchBudgetSuggestions({ userId, windowDays = 90 }) {
  const res = await axios.get(`${API_BASE}/api/budget/suggestions`, {
    params: { userId, windowDays }
  });
  return res.data;
}

export async function fetchLatestBudget({ userId }) {
  const res = await axios.get(`${API_BASE}/api/budget/suggestions/latest`, {
    params: { userId }
  });
  return res.data;
}
