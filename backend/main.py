from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="UniPath AI Backend", version="1.0.0")

def normalize_gpa(percentage: float, scale: float = 100.0) -> dict:
    percentage = min(100, max(0, percentage))
    if percentage >= 97: gpa4 = 4.0
    elif percentage >= 93: gpa4 = 3.9
    elif percentage >= 90: gpa4 = 3.7
    elif percentage >= 87: gpa4 = 3.5
    elif percentage >= 83: gpa4 = 3.3
    elif percentage >= 80: gpa4 = 3.0
    elif percentage >= 77: gpa4 = 2.7
    elif percentage >= 73: gpa4 = 2.3
    elif percentage >= 70: gpa4 = 2.0
    elif percentage >= 67: gpa4 = 1.7
    elif percentage >= 63: gpa4 = 1.3
    elif percentage >= 60: gpa4 = 1.0
    else: gpa4 = 0.0
    return {"original": percentage, "scale": scale, "normalized_4_0": round(gpa4, 2)}

class PaymentRequest(BaseModel):
    amount: float
    msisdn: str
    description: str

ZAINCASH_SECRET = "your_zaincash_secret_here"
ZAINCASH_MERCHANT_ID = "your_merchant_id_here"

@app.post("/api/payments/zaincash/initiate")
async def initiate_zaincash_payment(request: PaymentRequest):
    return {"success": True, "message": "ZainCash payment initiated", "amount": request.amount}

@app.post("/api/payments/qicard/initiate")
async def initiate_qicard_payment(request: PaymentRequest):
    return {"success": True, "message": "QiCard payment initiated", "amount": request.amount}

@app.get("/")
def home():
    return {"message": "UniPath AI Backend Active", "version": "1.0.0"}
