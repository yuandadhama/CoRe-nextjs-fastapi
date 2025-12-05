from fastapi import FastAPI, status, Depends, HTTPException
from typing import Annotated
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
import auth
from auth import get_current_user
from fastapi.middleware.cors import CORSMiddleware
from joblib import load


app = FastAPI()

origins = ["http://localhost:3000",]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)

models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/", status_code=status.HTTP_200_OK)
async def user(user: user_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return {"User": user}
    
    
# API ENDPOINT UNTUK REKOMENDASI COURSE
class RecommendationRequest(BaseModel):
    math: int
    science: int
    english: int
    interest: str
    career_goal: str

    
model = load("decision_tree.joblib")
encoders = load("encoders.joblib")

@app.post("/recommendations", status_code=status.HTTP_200_OK)
async def get_recommendations(request: RecommendationRequest):
    import pandas as pd

    # Encode categorical input
    interest_encoded = encoders["interest"].transform([request.interest])[0]
    career_encoded = encoders["career_goal"].transform([request.career_goal])[0]

    # Dataset untuk prediksi (HARUS DataFrame + nama kolom)
    input_df = pd.DataFrame([{
        "math": request.math,
        "science": request.science,
        "english": request.english,
        "interest": interest_encoded,
        "career_goal": career_encoded
    }])

    # Predict
    pred = model.predict(input_df)[0]

    # Decode result
    recommendation = encoders["recommendation"].inverse_transform([pred])[0]

    return {
        "recommended_field": recommendation
    }

    