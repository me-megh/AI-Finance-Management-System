// src/api/api.js
import axios from "axios";

// Utility function to send a request to the backend
export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`, // Your backend API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get the JWT token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("token"); // Or use context to manage token
};
