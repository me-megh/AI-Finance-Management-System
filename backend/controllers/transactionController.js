const Transaction = require('../models/Transaction');

// Add a new transaction
const addTransaction = async (req, res) => {
  const { amount, category, description } = req.body;

  if (!amount || !category) {
    return res.status(400).json({ message: 'Amount and category are required' });
  }

  try {
    const newTransaction = new Transaction({
      userId: req.userId,  // Use the user ID from the token
      amount,
      category,
      description,
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);  // Return the newly created transaction
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ message: 'Error adding transaction', error: err });
  }
};

// Get all transactions for the authenticated user
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });  // Filter by user ID
    res.status(200).json(transactions);  // Return the transactions
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Error fetching transactions', error: err });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findOne({ _id: id, userId: req.userId }); // Ensure the transaction belongs to the authenticated user

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    await Transaction.deleteOne({ _id: id });  // Delete the transaction
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ message: 'Error deleting transaction', error: err });
  }
};

module.exports = { addTransaction, getTransactions, deleteTransaction };
