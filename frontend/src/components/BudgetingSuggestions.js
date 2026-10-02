"use client";
import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Divider,
  Box,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";

const BudgetingSuggestions = ({
  userId,
  income,
  savingsRate,
  riskProfile,
  transactions,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowDays, setWindowDays] = useState(30);
  const [totalSavings, setTotalSavings] = useState(0);
  // Helper to calculate spendingHistory from transactions
  const calculateSpendingHistory = () => {
    const history = {};
    transactions.forEach((tx) => {
      if (!history[tx.category]) history[tx.category] = 0;
      history[tx.category] += tx.amount;
    });
    return history;
  };

  useEffect(() => {
    if (!userId || !transactions.length) return;

    setLoading(true);

    axios
      .post("http://localhost:8000/api/predictions/combined", {
        userId,
        income,
        spendingHistory: calculateSpendingHistory(),
        savings_rate: savingsRate,
        risk_profile: riskProfile,
      })
      .then((res) => {
        const fastApiPrediction = res.data.fastApiPrediction;
        if (fastApiPrediction?.categories) {
          setSuggestions(fastApiPrediction.categories);

          const totalSpent = fastApiPrediction.categories.reduce(
            (sum, c) => sum + c.currentMonthlyAvg,
            0
          );
          const savings = income - totalSpent;
          setTotalSavings(savings);
        } else {
          setSuggestions([]);
          setTotalSavings(0);
        }
      })
      .catch((err) => console.error("Error fetching budget suggestions:", err))
      .finally(() => setLoading(false));
  }, [userId, transactions, windowDays, income, savingsRate, riskProfile]);

  const getColor = (bucket, overBudget) => {
    if (overBudget) return "#dc3545";
    return bucket === "essential" ? "#28a745" : "#007bff";
  };

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3, backgroundColor: "#f8f9fa" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#28a745" }}>
          💡 Budgeting Suggestions (AI)
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="windowDays-label">Period</InputLabel>
          <Select
            labelId="windowDays-label"
            value={windowDays}
            label="Period"
            onChange={(e) => setWindowDays(Number(e.target.value))}
          >
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={60}>Last 60 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading suggestions...</Typography>
      ) : suggestions.length === 0 ? (
        <Typography>No suggestions available.</Typography>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              💰 Total Savings: ₹{totalSavings.toFixed(2)}{" "}
              {totalSavings < 0
                ? "(You are overspending!)"
                : "(You are on track!)"}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.abs(totalSavings))}
              sx={{
                height: 14,
                borderRadius: 7,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: totalSavings < 0 ? "#dc3545" : "#28a745",
                },
              }}
            />
          </Box>

          <List>
            {suggestions.map((sugg, index) => {
              const overBudget = sugg.currentMonthlyAvg > sugg.recommended;
              const underBudget = sugg.currentMonthlyAvg < sugg.recommended;

              return (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      flexDirection: "column",
                      alignItems: "stretch",
                      backgroundColor: "#fff",
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: getColor(sugg.bucket, overBudget),
                        mb: 1,
                      }}
                    >
                      {sugg.category}{" "}
                      {overBudget ? "⚠️" : underBudget ? "✅" : "✔️"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      Current: ₹{sugg.currentMonthlyAvg.toFixed(2)} |
                      Recommended: ₹{sugg.recommended.toFixed(2)}
                    </Typography>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: overBudget ? "#ffebeb" : "#e6f4ea",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: overBudget ? "#dc3545" : "#28a745",
                        }}
                      >
                        {sugg.tip ||
                          (overBudget
                            ? `You are overspending. Reduce by ₹${(
                                sugg.currentMonthlyAvg - sugg.recommended
                              ).toFixed(2)}`
                            : "You're within budget!")}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < suggestions.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </>
      )}
    </Paper>
  );
};

export default BudgetingSuggestions;

// "use client";
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Paper,
//   Typography,
//   List,
//   ListItem,
//   Divider,
//   Box,
//   LinearProgress,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from "@mui/material";

// const BudgetingSuggestions = ({ userId }) => {
//   const [suggestions, setSuggestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [windowDays, setWindowDays] = useState(30);
//   const [fastApiPrediction, setFastApiPrediction] = useState(null);
//   const [nodePrediction, setNodePrediction] = useState(null);

//   useEffect(() => {
//     setLoading(true);
//     axios
//       .get(
//         `http://localhost:3001/api/budget/combined?userId=${userId}&windowDays=${windowDays}`
//       )
//       .then((res) => {
//         const { fastApiPrediction, nodePrediction } = res.data;

//         setFastApiPrediction(fastApiPrediction || null);

//         if (nodePrediction?.recommendedBudgets) {
//           const mappedNode = Object.entries(
//             nodePrediction.recommendedBudgets
//           ).map(([category, obj]) => ({
//             category,
//             currentMonthlyAvg: obj.current,
//             recommended: obj.recommended,
//             bucket: ["Rent", "Groceries", "Utilities"].includes(category)
//               ? "essential"
//               : "nonessential",
//             tip:
//               fastApiPrediction?.categories?.find(
//                 (c) => c.category === category
//               )?.tip || "",
//           }));
//           setNodePrediction({
//             categories: mappedNode,
//             savings: nodePrediction.savings,
//           });
//           setSuggestions(mappedNode);
//         } else {
//           setNodePrediction(null);
//           setSuggestions([]);
//         }
//       })
//       .catch((err) => console.error(err))
//       .finally(() => setLoading(false));
//   }, [userId, windowDays]);

//   const getColor = (bucket, overBudget) => {
//     if (overBudget) return "#dc3545"; // red for overspend
//     return bucket === "essential" ? "#28a745" : "#007bff"; // green/blue
//   };

//   const totalSavings = suggestions.reduce(
//     (sum, s) => sum + (s.recommended - s.currentMonthlyAvg),
//     0
//   );
//   const totalRecommended = suggestions.reduce(
//     (sum, s) => sum + s.recommended,
//     0
//   );
//   const overallPercent =
//     totalRecommended > 0 ? (totalSavings / totalRecommended) * 100 : 0;

//   return (
//     <Paper sx={{ p: 3, mt: 3, borderRadius: 3, backgroundColor: "#f8f9fa" }}>
//       {/* Header with dropdown */}
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 2,
//         }}
//       >
//         <Typography variant="h6" sx={{ fontWeight: "bold", color: "#28a745" }}>
//           💡 Budgeting Suggestions (AI)
//         </Typography>

//         <FormControl size="small" sx={{ minWidth: 120 }}>
//           <InputLabel id="windowDays-label">Period</InputLabel>
//           <Select
//             labelId="windowDays-label"
//             value={windowDays}
//             label="Period"
//             onChange={(e) => setWindowDays(Number(e.target.value))}
//           >
//             <MenuItem value={30}>Last 30 days</MenuItem>
//             <MenuItem value={60}>Last 60 days</MenuItem>
//             <MenuItem value={90}>Last 90 days</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//       {loading ? (
//         <Typography>Loading suggestions...</Typography>
//       ) : suggestions.length === 0 ? (
//         <Typography>No suggestions available.</Typography>
//       ) : (
//         <>
//           {/* Savings progress */}
//           {totalRecommended > 0 && (
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle1" sx={{ mb: 1 }}>
//                 💰 Recommended Savings: ₹{totalSavings.toFixed(2)}
//               </Typography>
//               <LinearProgress
//                 variant="determinate"
//                 value={Math.min(100, overallPercent)}
//                 sx={{
//                   height: 14,
//                   borderRadius: 7,
//                   backgroundColor: "#e0e0e0",
//                   "& .MuiLinearProgress-bar": { backgroundColor: "#ffa500" },
//                 }}
//               />
//             </Box>
//           )}

//           {/* Category list */}
//           <List>
//             {suggestions.map((sugg, index) => {
//               const overBudget = sugg.currentMonthlyAvg > sugg.recommended;
//               const underBudget = sugg.currentMonthlyAvg < sugg.recommended;

//               return (
//                 <React.Fragment key={index}>
//                   <ListItem
//                     sx={{
//                       flexDirection: "column",
//                       alignItems: "stretch",
//                       backgroundColor: "#fff",
//                       p: 2,
//                       mb: 2,
//                       borderRadius: 2,
//                       boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         fontWeight: "bold",
//                         color: getColor(sugg.bucket, overBudget),
//                         mb: 1,
//                       }}
//                     >
//                       {sugg.category}{" "}
//                       {overBudget ? "⚠️" : underBudget ? "✅" : "✔️"}
//                     </Typography>
//                     <Typography sx={{ mb: 1 }}>
//                       Current: ₹{sugg.currentMonthlyAvg.toFixed(2)} |
//                       Recommended: ₹{sugg.recommended.toFixed(2)}
//                     </Typography>
//                     <Box
//                       sx={{
//                         p: 1,
//                         borderRadius: 2,
//                         backgroundColor: overBudget ? "#ffebeb" : "#e6f4ea",
//                         mb: 1,
//                       }}
//                     >
//                       <Typography
//                         sx={{
//                           fontWeight: "bold",
//                           color: overBudget ? "#dc3545" : "#28a745",
//                         }}
//                       >
//                         {sugg.tip ||
//                           (overBudget
//                             ? `You are overspending. Reduce by ₹${(
//                                 sugg.currentMonthlyAvg - sugg.recommended
//                               ).toFixed(2)}`
//                             : "You're within budget!")}
//                       </Typography>
//                     </Box>
//                   </ListItem>
//                   {index < suggestions.length - 1 && <Divider />}
//                 </React.Fragment>
//               );
//             })}
//           </List>

//           {/* Debug / raw JSON (optional) */}
//           {fastApiPrediction && (
//             <Box sx={{ mt: 2 }}>
//               <Typography variant="subtitle2">FastAPI Raw Data</Typography>
//               <pre>{JSON.stringify(fastApiPrediction.categories, null, 2)}</pre>
//             </Box>
//           )}

//           {nodePrediction && (
//             <Box sx={{ mt: 2 }}>
//               <Typography variant="subtitle2">Node.js Raw Data</Typography>
//               <pre>{JSON.stringify(nodePrediction.categories, null, 2)}</pre>
//             </Box>
//           )}
//         </>
//       )}
//     </Paper>
//   );
// };

// export default BudgetingSuggestions;
