// src/components/LoginForm.js
import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/LoginForm.module.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState(null); // Store JWT token
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email,
          password,
        }
      );
      if (response.data.token) {
        const token = response.data.token;
        const userId = response.data.userId;
    
        localStorage.setItem("token", token); // Save token to localStorage
        localStorage.setItem("userId", userId); // Save token to localStorage

        // Set token and login status in state
        setToken(token);
        setUserId(userId);
        setIsLoggedIn(true);
      }
    } catch (err) {
      setError(
        "Error: " + (err.response?.data?.message || "Something went wrong")
      );
    }
  };

  return (
    <div className={styles.container}>
    <div className={styles["form-container"]}>
      <h2 className={styles.heading}>Login</h2>
        {error && <p className={styles.error - message}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
