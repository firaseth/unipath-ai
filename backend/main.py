from fastapi import FastAPI
app = FastAPI()

def normalize_gpa(percentage):
    # Iraqi % to 4.0 scale logic[cite: 1]
    if percentage >= 90: return 3.5 + (percentage - 90) * 0.05
    return (percentage / 100) * 4.0

@app.get("/")
def home():
    return {"message": "UniPath AI Backend Active"}
