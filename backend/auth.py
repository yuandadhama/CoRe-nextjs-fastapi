from datetime import datetime, timedelta
import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from starlette import status
from passlib.context import CryptContext
from dotenv import load_dotenv

from database import SessionLocal
from models import Users

# ============================
# Router
# ============================

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ============================
# SCHEMAS
# ============================

class EmailRegisterRequest(BaseModel):
    email: str
    password: str


class UsernameRequest(BaseModel):
    email: str
    username: str


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# ============================
# DB DEPENDENCY
# ============================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


# ============================
# STEP 1 — Register Email + Password
# ============================

@router.post("/register-email", status_code=status.HTTP_201_CREATED)
async def register_with_email(register_data: EmailRegisterRequest, db: db_dependency):

    # Check email duplikat
    existing_email = db.query(Users).filter(Users.email == register_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pwd = bcrypt_context.hash(register_data.password)

    new_user = Users(
        email=register_data.email,
        hashed_password=hashed_pwd,
        username=None  # username belum dibuat
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Email registered successfully. Continue to create username."}


# ============================
# STEP 2 — Set Username
# ============================

@router.post("/set-username", status_code=status.HTTP_200_OK)
async def set_username(data: UsernameRequest, db: db_dependency):

    user = db.query(Users).filter(Users.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Cek username duplikat
    if db.query(Users).filter(Users.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user.username = data.username  # type: ignore
    db.commit()
    db.refresh(user)

    # =============================
    # 🔥 Generate token setelah username dibuat
    # =============================
    access_token = create_access_token(
        user_id=user.id,  # type: ignore
        username=user.username,  # type: ignore
        expires_delta=timedelta(minutes=30)
    )

    return {
        "message": "Username successfully created",
        "access_token": access_token,
        "user_id": user.id
    }



# ============================
# LOGIN — EMAIL & PASSWORD
# ============================

@router.post("/login")
async def login_for_access_token(login_data: LoginRequest, db: db_dependency):
    user = authenticate_user(login_data.email, login_data.password, db)

    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if user.username is None:
        raise HTTPException(
            status_code=400,
            detail="Username not set. Complete the registration first."
        )

    access_token = create_access_token(
        user_id=user.id, # type: ignore
        username=user.username, # type: ignore
        expires_delta=timedelta(minutes=30)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id
    }



# ============================
# HELPERS — AUTHENTICATION
# ============================

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(Users).filter(Users.email == email).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password): # type: ignore
        return False
    return user


def create_access_token(user_id: int, username: str, expires_delta: timedelta):
    to_encode = {
        "sub": username,
        "id": user_id,
        "exp": datetime.utcnow() + expires_delta,
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) # type: ignore


# ============================
# GET CURRENT USER
# ============================

def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        username: str = payload.get("sub") # type: ignore
        user_id: int = payload.get("id") # type: ignore

        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return {"username": username, "id": user_id}

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
        
@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
