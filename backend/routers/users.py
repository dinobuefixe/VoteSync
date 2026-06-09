from typing import List
from fastapi import HTTPException, Depends, FastAPI, APIRouter, status
from sqlalchemy.orm import Session
from starlette import status
from backend import models, schemas, database
from backend.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=List[schemas.UserBase])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.Users).all()


@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Users).filter(models.Users.email == user.email).first()
    if exists:
        raise HTTPException(400, "Email already registered")

    new_user = models.Users(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/{id}", response_model=schemas.UserBase)
def get_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.id == id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.put("/{id}", response_model=schemas.UserBase)
def update_user(id: int, updated: schemas.UserBase, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.id == id)
    if not user.first():
        raise HTTPException(404, "User not found")
    user.update(updated.dict())
    db.commit()
    return user.first()


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.Users).filter(models.Users.id == id)
    if not user.first():
        raise HTTPException(404, "User not found")
    user.delete()
    db.commit()
