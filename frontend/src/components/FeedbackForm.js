import React, { useState } from "react";

const FeedbackForm = ({ category, onClose }) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    alert(`Feedback for ${category}: ${feedback}`);
    onClose();
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f4f4f4" }}>
      <h3>Give Feedback on {category}</h3>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Enter your feedback"
        rows="4"
        cols="50"
      />
      <div>
        <button onClick={handleSubmit}>Submit Feedback</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default FeedbackForm;
