// backend/routes/transactionRoutes.js
const express = require('express');
const Transaction = require('../models/Transaction');
const authenticate = require('../middleware/authenticate');  // JWT verification middleware
const router = express.Router();

// POST request to add a new transaction
router.post('/', authenticate, async (req, res) => {
  const { amount, category, description,type } = req.body;
  const userId = req.userId;  // Get userId from JWT token

  try {
    // Validate input
    if (!amount || !category || !description || !type) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Create and save transaction
    const newTransaction = new Transaction({
      userId,
      amount,
      category,
      description,
      type
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});
// GET request to fetch transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }); // Fetch transactions for the logged-in user
    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error fetching transactions' });
  }
});
// Delete transaction
router.delete("/:id", authenticate, async (req, res) => {  // Use authenticate middleware here too
  const { id } = req.params;

  console.log("Deleting transaction with ID:", id);  // Log the ID being passed for debugging
  
  try {
    // Find the transaction by ID and delete it
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    // Check if the transaction exists
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    console.log("Deleted Transaction:", deletedTransaction);  // Log the deleted transaction for debugging

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting transaction" });
  }
});

// PUT request to update a transaction
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { amount, category, description, type } = req.body;
  const userId = req.userId;  // Get userId from JWT token

  try {
    // Validate input
    if (!amount || !category || !description || !type) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Find and update the transaction
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },  // Ensure the transaction belongs to the current user
      { amount, category, description, type },
      { new: true }  // Return the updated document
    );

    // If the transaction is not found
    if (!updatedTransaction) {
      return res.status(404).json({ msg: 'Transaction not found or unauthorized' });
    }

    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error updating transaction' });
  }
});

module.exports = router;
