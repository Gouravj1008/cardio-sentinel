from fastapi import FastAPI

app = FastAPI(title="Cardio Sentinel AI")

@app.get("/")
def root():
    return {"status": "ML service running"}
