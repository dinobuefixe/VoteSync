# backend/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend import models
from backend.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: dict

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.email == credentials.email).first()
    if not user or user.password != credentials.password:
        raise HTTPException(401, "Credenciais inválidas")
    
    return {
        "token": f"local-{user.id}",
        "user": {
            "id": user.id,          # inteiro real da BD
            "name": user.name,
            "email": user.email,
            "profile_picture": user.profile_picture
        }
    }