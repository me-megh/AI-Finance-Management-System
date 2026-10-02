from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

# --- FastAPI app ---
app = FastAPI()

# --- CORS setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load/create models ---
try:
    investment_model = joblib.load("investment_type_model.pkl")
except:
    # Dummy RandomForest for demonstration
    investment_model = RandomForestClassifier(n_estimators=100)
    investment_model.fit([[50000, 20, 1]], [1])
    joblib.dump(investment_model, "investment_type_model.pkl")

try:
    budget_model = joblib.load("budget_model.pkl")
    category_encoder = joblib.load("category_encoder.pkl")
except:
    categories = ['Food', 'Rent', 'Entertainment', 'Groceries', 'Healthcare', 'Transport', 'Utilities']
    df = pd.DataFrame({'category': categories})
    encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    encoder.fit(df[['category']])
    X = encoder.transform(df[['category']])
    y = [1500, 2000, 500, 1200, 800, 1000, 900]
    model = LinearRegression()
    model.fit(X, y)
    joblib.dump(encoder, 'category_encoder.pkl')
    joblib.dump(model, 'budget_model.pkl')
    budget_model, category_encoder = model, encoder

# --- Pydantic models ---
class UserData(BaseModel):
    userId: str
    income: float
    spendingHistory: dict

class InvestmentRequest(BaseModel):
    income: float
    savings_rate: float
    risk_profile: int

class InvestmentResponse(BaseModel):
    recommended_investment: str

# --- Helper function to convert NumPy types ---
def convert_numpy(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy(v) for v in obj]
    elif isinstance(obj, (np.integer, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64)):
        return float(obj)
    else:
        return obj

# --- Budget prediction route ---
@app.post("/predict_budget")
def predict_budget(data: UserData):
    df = pd.DataFrame([{"category": cat, "amount": amt} for cat, amt in data.spendingHistory.items()])
    encoded = category_encoder.transform(df[['category']])
    X = pd.DataFrame(encoded, columns=category_encoder.get_feature_names_out(['category']))
    predictions = budget_model.predict(X)

    categories = []
    for row, pred in zip(df.to_dict(orient='records'), predictions):
        current = row['amount']
        recommended = float(pred)

        if current > recommended * 1.2:
            tip = f"⚠️ Overspending on {row['category']}, reduce by {current - recommended:.2f}"
        elif current < recommended * 0.8:
            tip = f"✅ Saving well on {row['category']}, keep it up!"
        else:
            tip = f"✔️ Spending on {row['category']} is on track."

        categories.append({
            "category": row['category'],
            "currentMonthlyAvg": current,
            "recommended": recommended,
            "bucket": "essential" if row['category'] in ["Rent", "Groceries", "Utilities"] else "nonessential",
            "tip": tip
        })

    return {"userId": data.userId, "categories": convert_numpy(categories)}

# --- Investment prediction route ---
@app.post("/predict_investment")
def predict_investment(data: InvestmentRequest):
    features = [[data.income, data.savings_rate, data.risk_profile]]
    prediction = investment_model.predict(features)[0]
    return {"recommended_investment": convert_numpy(prediction)}

# --- Combined prediction route ---
@app.post("/api/predictions/combined")
def combined_prediction(payload: UserData):
    all_categories = ['Food', 'Rent', 'Entertainment', 'Groceries', 'Healthcare', 'Transport', 'Utilities']
    spending_history = payload.spendingHistory or {}

    categories_output = []
    for cat in all_categories:
        current = float(spending_history.get(cat, 0))

        # Recommended logic:
        # 1. If user has some spending history -> reduce by 20%
        # 2. If no history -> set a default value (e.g., 1000)
        recommended = current * 0.8 if current > 0 else 1000

        # Generate tip
        if current > recommended * 1.2:
            tip = f"⚠️ Overspending on {cat}, reduce by ₹{current - recommended:.2f}"
        elif current < recommended * 0.8:
            tip = f"✅ Saving well on {cat}, keep it up!"
        else:
            tip = f"✔️ Spending on {cat} is on track."

        # Bucket assignment
        bucket = "essential" if cat in ["Rent", "Groceries", "Utilities"] else "nonessential"

        categories_output.append({
            "category": cat,
            "currentMonthlyAvg": current,
            "recommended": recommended,
            "bucket": bucket,
            "tip": tip
        })

    return {
        "fastApiPrediction": convert_numpy({"categories": categories_output}),
        "nodePrediction": None
    }