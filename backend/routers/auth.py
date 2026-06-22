from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend import models
from backend.database import get_db
from backend.utils import hash_password, is_password_hashed, verify_password

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

    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(401, "Credenciais inválidas")

    if user.password and not is_password_hashed(user.password):
        user.password = hash_password(credentials.password)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # ✅ Incluir is_admin na resposta
    return {
        "token": f"local-{user.id}",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "profile_picture": user.profile_picture,
            "is_admin": user.is_admin or False  # ✅ NOVO
        }
    }