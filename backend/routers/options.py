from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/options", tags=["Options"])


@router.get("/", response_model=List[schemas.OptionsBase])
def get_options(db: Session = Depends(get_db)):
    return db.query(models.Options).all()


@router.get("/{id}", response_model=schemas.OptionsBase)
def get_option(id: int, db: Session = Depends(get_db)):
    option = db.query(models.Options).filter(models.Options.id == id).first()
    if not option:
        raise HTTPException(404, "Option not found")
    return option


@router.post("/", response_model=schemas.OptionsBase)
def create_option(option: schemas.OptionsBase, db: Session = Depends(get_db)):
    new_option = models.Options(**option.dict())
    db.add(new_option)
    db.commit()
    db.refresh(new_option)
    return new_option


@router.put("/{id}", response_model=schemas.OptionsBase)
def update_option(id: int, updated: schemas.OptionsBase, db: Session = Depends(get_db)):
    option = db.query(models.Options).filter(models.Options.id == id)
    if not option.first():
        raise HTTPException(404, "Option not found")
    option.update(updated.dict())
    db.commit()
    return option.first()


@router.delete("/{id}", status_code=204)
def delete_option(id: int, db: Session = Depends(get_db)):
    option = db.query(models.Options).filter(models.Options.id == id)
    if not option.first():
        raise HTTPException(404, "Option not found")
    option.delete()
    db.commit()
