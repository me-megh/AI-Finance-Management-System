from fastapi import FastAPI
import pickle
import pandas as pd
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder

app = FastAPI()

# Allow Node.js frontend/backend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Function to create dummy model & encoder
def create_dummy_model_and_encoder():
    categories = ['Food', 'Rent', 'Entertainment', 'Groceries', 'Healthcare', 'Transport', 'Utilities']
    df = pd.DataFrame({'category': categories})
    
    encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    encoder.fit(df[['category']])
    
    X = encoder.transform(df[['category']])
    y = [1500, 2000, 500, 1200, 800, 1000, 900]  # example budgets
    model = LinearRegression()
    model.fit(X, y)
    
    # Save encoder & model
    with open('category_encoder.pkl', 'wb') as f:
        pickle.dump(encoder, f)
    with open('budget_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("Created dummy model and encoder with all categories.")
    return model, encoder

# Load model & encoder, create dummy if missing/corrupt
try:
    with open('budget_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('category_encoder.pkl', 'rb') as f:
        encoder = pickle.load(f)
except (FileNotFoundError, pickle.UnpicklingError, EOFError):
    model, encoder = create_dummy_model_and_encoder()

# Pydantic model for user input
class UserData(BaseModel):
    userId: str
    income: float
    spendingHistory: dict

@app.post("/predict")
def predict_budget(data: UserData):
    # Convert spending history to DataFrame
    df = pd.DataFrame([
        {"category": cat, "amount": amt} for cat, amt in data.spendingHistory.items()
    ])
    
    # Encode category column
    encoded = encoder.transform(df[['category']])
    X = pd.DataFrame(encoded, columns=encoder.get_feature_names_out(['category']))
    
    # Make predictions
    predictions = model.predict(X)

    categories = []
    for row, pred in zip(df.to_dict(orient='records'), predictions):
        current = row['amount']
        recommended = float(pred)

        # Generate tip
        if current > recommended * 1.2:
            tip = f"⚠️ You are overspending on {row['category']}. Try to cut down by {current - recommended:.2f}."
        elif current < recommended * 0.8:
            tip = f"✅ You are saving well on {row['category']}. Keep it up!"
        else:
            tip = f"✔️ Your spending on {row['category']} is on track."

        categories.append({
            "category": row['category'],
            "currentMonthlyAvg": current,
            "recommended": recommended,
            "bucket": "essential" if row['category'] in ["Rent", "Groceries", "Utilities"] else "nonessential",
            "tip": tip
        })
    
    return {
        "userId": data.userId,
        "categories": categories
    }
