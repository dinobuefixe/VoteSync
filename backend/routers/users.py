from typing import List
from fastapi import HTTPException, Depends, APIRouter, status
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db
from backend.utils import hash_password

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Retorna todos os utilizadores"""
    return db.query(models.Users).all()


@router.get("/{id}", response_model=schemas.UserResponse)
def get_user(id: int, db: Session = Depends(get_db)):
    """Retorna um utilizador específico"""
    user = db.query(models.Users).filter(models.Users.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Cria um novo utilizador"""
    existing_user = db.query(models.Users).filter(models.Users.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    new_user = models.Users(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        profile_picture=None,
        is_admin=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.put("/{id}", response_model=schemas.UserResponse)
def update_user(id: int, updated: schemas.UserCreate, db: Session = Depends(get_db)):
    """Atualiza um utilizador"""
    user_query = db.query(models.Users).filter(models.Users.id == id)
    user_obj = user_query.first()
    if not user_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_obj.email != updated.email:
        duplicate = db.query(models.Users).filter(models.Users.email == updated.email).first()
        if duplicate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_query.update({
        "name": updated.name,
        "email": updated.email,
        "password": hash_password(updated.password)
    }, synchronize_session=False)
    db.commit()
    return user_query.first()


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(id: int, db: Session = Depends(get_db)):
    """Remove um utilizador"""
    user_query = db.query(models.Users).filter(models.Users.id == id)
    if not user_query.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user_query.delete()
    db.commit()
