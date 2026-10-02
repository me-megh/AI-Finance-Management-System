import pickle
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Step 1: Generate synthetic data (You can replace this with real data later)
data = pd.DataFrame({
    'income': [50000, 70000, 100000, 120000, 150000, 250000, 350000],
    'savings_rate': [20, 25, 15, 30, 10, 35, 40],
    'risk_profile': [1, 2, 3, 1, 2, 3, 1],  # 1: Low, 2: Medium, 3: High risk profile
    'investment_type': [1, 2, 3, 1, 2, 3, 1]  # 1: Low Risk, 2: Medium Risk, 3: High Risk
})

# Step 2: Features (income, savings_rate, risk_profile)
X = data[['income', 'savings_rate', 'risk_profile']]

# Step 3: Target (investment type)
y = data['investment_type']

# Step 4: Train the Random Forest Classifier model
investment_type_model = RandomForestClassifier(n_estimators=100)
investment_type_model.fit(X, y)

# Step 5: Save the trained model to a .pkl file
with open('investment_type_model.pkl', 'wb') as f:
    pickle.dump(investment_type_model, f)

print("Investment type model saved as 'investment_type_model.pkl'")
