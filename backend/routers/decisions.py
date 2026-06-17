from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/decisions", tags=["Decisions"])


@router.get("/", response_model=List[schemas.DecisionsResponse])
def get_decisions(db: Session = Depends(get_db)):
    return db.query(models.Decisions).all()


@router.get("/{id}", response_model=schemas.DecisionsResponse)
def get_decision(id: int, db: Session = Depends(get_db)):
    decision = db.query(models.Decisions).filter(models.Decisions.id == id).first()
    if not decision:
        raise HTTPException(404, "Decision not found")
    return decision


@router.post("/", response_model=schemas.DecisionsResponse)
def create_decision(decision: schemas.DecisionsBase, db: Session = Depends(get_db)):
    new_decision = models.Decisions(**decision.dict())
    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)
    return new_decision


@router.put("/{id}", response_model=schemas.DecisionsResponse)
def update_decision(id: int, updated: schemas.DecisionsBase, db: Session = Depends(get_db)):
    decision = db.query(models.Decisions).filter(models.Decisions.id == id)
    if not decision.first():
        raise HTTPException(404, "Decision not found")
    decision.update(updated.dict())
    db.commit()
    return decision.first()


@router.delete("/{id}", status_code=204)
def delete_decision(id: int, db: Session = Depends(get_db)):
    decision = db.query(models.Decisions).filter(models.Decisions.id == id)
    if not decision.first():
        raise HTTPException(404, "Decision not found")
    decision.delete()
    db.commit()