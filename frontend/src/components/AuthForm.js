"use client";
import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/AuthForm.module.css"; // Import dark theme styles

const AuthForm = ({ setToken, setUserName, setUserId, setIsLoggedIn }) => {
  const [isSignup, setIsSignup] = useState(true); // Toggle between Signup and Login
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    income: "", // New field for income
    savings_rate: "", // New field for savings_rate
    risk_profile: 2, // New field for risk_profile (default to medium)
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isSignup
        ? "http://localhost:3001/api/auth/signup"
        : "http://localhost:3001/api/auth/login"; // URL changes based on form type

      const response = await axios.post(url, formData);

      if (response.data.token) {
        const token = response.data.token;
        const userName = response.data.user.name; // Retrieve 'name' from response
        const userId = response.data.user._id;
        
        localStorage.setItem("token", token); // Store token in localStorage
        localStorage.setItem("userName", userName); // Store userName
        localStorage.setItem("userId", userId); // Store userId in localStorage
        
        setToken(token); // Set token in state
        setUserName(userName); // Set userName in state
        setUserId(userId); // Set userId in state
        setIsLoggedIn(true); // Set login status
      }
    } catch (err) {
      setError("Error: " + (err.response?.data?.msg || "Something went wrong"));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles["form-container"]}>
        <h2 className={styles.heading}>{isSignup ? "Sign Up" : "Login"}</h2>
        {error && <p className={styles["error-message"]}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <input
                className={styles.input}
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </>
          )}
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {isSignup && (
            <>
              <input
                className={styles.input}
                type="number"
                name="income"
                placeholder="Income"
                value={formData.income}
                onChange={handleChange}
                required
              />
              <input
                className={styles.input}
                type="number"
                name="savings_rate"
                placeholder="Savings Rate (%)"
                value={formData.savings_rate}
                onChange={handleChange}
                required
              />
              <select
                className={styles.input}
                name="risk_profile"
                value={formData.risk_profile}
                onChange={handleChange}
                required
              >
                <option value={1}>Low Risk</option>
                <option value={2}>Medium Risk</option>
                <option value={3}>High Risk</option>
              </select>
            </>
          )}

          <button className={styles.button} type="submit">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p
          className={styles["toggle-btn"]}
          onClick={() => setIsSignup(!isSignup)} // Toggle between forms
        >
          {isSignup
            ? "Already have an account? Login here"
            : "Don't have an account? Sign up here"}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
