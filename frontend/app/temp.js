"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuthToken } from "../src/api/api";
import AddTransaction from "../src/components/AddTransaction";
import TransactionList from "../src/components/TransactionList";
import SpendingSummaryAndChart from "../src/components/SpendingSummaryAndChart";
import AuthForm from "../src/components/AuthForm";
import Header from "../src/components/Header";
import BudgetingSuggestions from "../src/components/BudgetingSuggestions";
import InvestmentRecommendations from "../src/components/investment_recommendations";
import "../styles.css";

export default function Home() {
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [income, setIncome] = useState(0); // ✅ income state added
  const [savingsRate, setSavingsRate] = useState(0); // savings rate state added
  const [riskProfile, setRiskProfile] = useState(""); // risk profile state added
  const [transactions, setTransactions] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [budgetSuggestions, setBudgetSuggestions] = useState({});
  const [loadingBudget, setLoadingBudget] = useState(false);

  const handleTabChange = (_, index) => {
    setTabIndex(index);
  };

  // ✅ Check localStorage on page load
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUserName = localStorage.getItem("userName");
    const storedUserId = localStorage.getItem("userId");
 

    if (storedToken && storedUserName && storedUserId) {
      setToken(storedToken);
      setIsLoggedIn(true);
      setUserName(storedUserName);
      setUserId(storedUserId);

      // Fetch the user's income, savings rate, and risk profile from the backend
      axios
        .get(`http://localhost:3001/api/user/${storedUserId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((response) => {
          const { income, savings_rate, risk_profile } = response.data;
          
          setIncome(income);
          setSavingsRate(savings_rate); // setting savings rate
          setRiskProfile(risk_profile);
       
          // Save income, savings rate, and risk profile in localStorage
          localStorage.setItem("income", income);
          localStorage.setItem("savings_rate", savings_rate); // saving savings rate
          localStorage.setItem("risk_profile", risk_profile);
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
        });
    }
  }, []);

  // ✅ Fetch transactions after login
  useEffect(() => {
    if (isLoggedIn) {
      fetchTransactions();
    }
  }, [isLoggedIn]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:3001/api/transactions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sortedTransactions = response.data.transactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(sortedTransactions);

      // Call AI Budgeting API automatically
      fetchBudgetSuggestions(sortedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchBudgetSuggestions = async (transactionsData) => {
    if (!userId) return;
    setLoadingBudget(true);

    try {
      const spendingHistory = transactionsData.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

      const res = await axios.post("http://localhost:8000/predict_budget", {
        userId,
        income, // Use real income
        savings_rate, // Now this is defined
        risk_profile, // Use real risk profile
        spendingHistory,
      });

      setBudgetSuggestions(res.data.recommendedBudgets || {});
    } catch (err) {
      console.error("Error fetching budget suggestions:", err);
    } finally {
      setLoadingBudget(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("income");
    localStorage.removeItem("savings_rate");
    localStorage.removeItem("risk_profile");
    setToken(null);
    setIsLoggedIn(false);
    setUserName("");
    setUserId(null);
    setIncome(0);
    setSavingsRate(0);
    setRiskProfile("");
  };

  const investmentGoals = {
    Equity: 5000,
    Bonds: 2000,
    "Real Estate": 3000,
    Cryptocurrency: 1000,
    "Savings Accounts": 500,
  };

  return (
    <div
      className="container"
      style={{ backgroundColor: "#f1f9f4", minHeight: "100vh" }}
    >
      {!isLoggedIn ? (
        <AuthForm
          setToken={setToken}
          setIsLoggedIn={setIsLoggedIn}
          setUserName={setUserName}
          setUserId={setUserId}
        />
      ) : (
        <>
          <Header
            tabIndex={tabIndex}
            handleTabChange={handleTabChange}
            userName={userName}
            handleLogout={handleLogout}
          />

          <main style={{ padding: "20px" }}>
            {tabIndex === 0 && (
              <>
                <h2 style={{ color: "#333", textAlign: "center" }}>
                  Add a Transaction
                </h2>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ width: "70%" }}>
                    <AddTransaction
                      token={token}
                      userId={userId}
                      refreshTransactions={fetchTransactions}
                    />
                  </div>
                  <div style={{ width: "28%" }}>
                    <SpendingSummaryAndChart
                      transactions={transactions}
                      income={income}
                    />
                  </div>
                </div>
              </>
            )}

            {tabIndex === 1 && (
              <>
                <h2 style={{ color: "#333", textAlign: "center" }}>
                  Your Transactions
                </h2>
                <TransactionList token={token} transactions={transactions} />
              </>
            )}

            {tabIndex === 2 && (
              <BudgetingSuggestions
                userId={userId}
                transactions={transactions}
                recommendedBudgets={budgetSuggestions}
                loading={loadingBudget}
              />
            )}

            {tabIndex === 3 && (
              <InvestmentRecommendations
                userId={userId}
                investmentGoals={investmentGoals}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
