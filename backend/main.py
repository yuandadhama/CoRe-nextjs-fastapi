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
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [frontend_url] 

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
async def get_recommendations(
    request: RecommendationRequest,
    user: user_dependency,
    db: db_dependency
):
    import pandas as pd

    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Encode categorical input
    interest_encoded = encoders["interest"].transform([request.interest])[0]
    career_encoded = encoders["career_goal"].transform([request.career_goal])[0]

    # Dataset DataFrame
    input_df = pd.DataFrame([{
        "math": request.math,
        "science": request.science,
        "english": request.english,
        "interest": interest_encoded,
        "career_goal": career_encoded,
    }])

    # Predict model
    pred = model.predict(input_df)[0]
    recommendation = encoders["recommendation"].inverse_transform([pred])[0]

    # SAVE HISTORY
    history = models.History(
        user_id=user["id"],
        math=request.math,
        science=request.science,
        english=request.english,
        interest=request.interest,
        career_goal=request.career_goal,
        result=recommendation,
    )
    db.add(history)
    db.commit()
    db.refresh(history)

    return {
        "recommended_field": recommendation
    }

@app.get("/history", status_code=200)
async def get_history(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Ambil semua history user
    histories = db.query(models.History).filter(models.History.user_id == user["id"]).order_by(models.History.timestamp.desc()).all()

    # Ubah menjadi dict supaya bisa dikirim ke frontend
    history_list = [
        {
            "id": h.id,
            "timestamp": h.timestamp.strftime("%Y-%m-%d %H:%M"),
            "math": h.math,
            "science": h.science,
            "english": h.english,
            "interest": h.interest,
            "career_goal": h.career_goal,
            "result": h.result,
        }
        for h in histories
    ]

    return {"history": history_list}

@app.delete("/history/{history_id}", status_code=200)
async def delete_history(
    history_id: int,
    user: user_dependency,
    db: db_dependency
):
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    history = db.query(models.History).filter(
        models.History.id == history_id,
        models.History.user_id == user["id"]
    ).first()

    if history is None:
        raise HTTPException(
            status_code=404,
            detail="History not found or not yours"
        )

    db.delete(history)
    db.commit()

    return {"message": "History deleted successfully"}
