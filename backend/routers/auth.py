from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend import models
from backend.database import get_db
from backend.utils import verify_password

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

    if not user or not verify_password(credentials.password, user.hashed_password):
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