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
  const [income, setIncome] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [riskProfile, setRiskProfile] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [budgetSuggestions, setBudgetSuggestions] = useState({});
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [spendingHistory, setSpendingHistory] = useState({});

  const handleTabChange = (_, index) => {
    setTabIndex(index);
  };

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUserName = localStorage.getItem("userName");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedUserName && storedUserId) {
      setToken(storedToken);
      setIsLoggedIn(true);
      setUserName(storedUserName);
      setUserId(storedUserId);

      // Fetch user data
      axios
        .get(`http://localhost:3001/api/user/${storedUserId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((response) => {
          const { income, savings_rate, risk_profile } = response.data;
          setIncome(income);
          setSavingsRate(savings_rate);
          setRiskProfile(risk_profile);
          localStorage.setItem("income", income);
          localStorage.setItem("savings_rate", savings_rate);
          localStorage.setItem("risk_profile", risk_profile);
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
        });
    }
  }, []);

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const sortedTransactions = response.data.transactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(sortedTransactions);

      // --- Call FastAPI with spendingHistory
      fetchBudgetSuggestions(sortedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };
  const calculateTotalExpense = (transactions) => {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  };

  const calculateSpendingHistory = (transactions) => {
    const history = {};
    transactions.forEach((tx) => {
      if (!history[tx.category]) history[tx.category] = 0;
      history[tx.category] += tx.amount;
    });
    return history;
  };

  const fetchBudgetSuggestions = async (transactions) => {
    if (!userId || !income) return; // safety check

    setLoadingBudget(true); // show loading spinner

    try {
      const res = await axios.post(
        "http://localhost:8000/api/predictions/combined",
        {
          userId,
          income,
          spendingHistory: calculateSpendingHistory(transactions),
          savings_rate: savingsRate,
          risk_profile: riskProfile,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000, // 5 seconds timeout
        }
      );

      if (res.data && res.data.fastApiPrediction) {
        setBudgetSuggestions(res.data.fastApiPrediction);
        setSpendingHistory(
          res.data.fastApiPrediction.categories.reduce((acc, cat) => {
            acc[cat.category] = cat.currentMonthlyAvg;
            return acc;
          }, {})
        );
      } else {
        console.warn("No prediction data received:", res.data);
        setBudgetSuggestions({});
      }
    } catch (err) {
      console.error("Error calling FastAPI:", err.message || err);
      setBudgetSuggestions({});
    } finally {
      setLoadingBudget(false); // hide loading spinner
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("income");
    localStorage.removeItem("savingsRate");
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
  const totalExpense = calculateTotalExpense(transactions);
  const totalSavings = income - totalExpense;

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
                      income={income} // Pass income to AddTransaction
                    />
                  </div>
                  <div style={{ width: "28%" }}>
                    <SpendingSummaryAndChart
                      transactions={transactions}
                      income={income} // Pass income to SpendingSummaryAndChart
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
                income={income}
                savingsRate={savingsRate}
                spendingHistory={spendingHistory} // Pass the calculated spendingHistory here
                totalSavings={totalSavings}
              />
            )}

            {tabIndex === 3 && (
              <InvestmentRecommendations
                userId={userId}
                investmentGoals={investmentGoals}
                income={income}
                savingsRate={savingsRate}
                riskProfile={riskProfile}
                totalExpense={totalExpense} // 👈 yeh add karo
                totalSavings={totalSavings}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
