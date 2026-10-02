"use client";
import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/SignupForm.module.css";
const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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
      // Send POST request to the backend signup route (Updated port to 5000)
      const response = await axios.post(
        "http://localhost:3001/api/auth/signup",
        formData
      ); // Changed port to 5000
      alert("Signup successful! Please log in.");
    } catch (err) {
      // Safely handle error if response is undefined
      setError("Error: " + (err.response?.data?.msg || "Something went wrong"));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles["form-container"]}>
        <h2 className={styles.heading}>Sign Up</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
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
          <button className={styles.button} type="submit">Sign Up</button>
        </form>
    </div>
    </div>
  );
};

export default SignupForm;
