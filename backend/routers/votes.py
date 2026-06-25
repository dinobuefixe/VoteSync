from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/votes", tags=["Votes"])


@router.get("/", response_model=List[schemas.VotesResponse])
def get_votes(db: Session = Depends(get_db)):
    return db.query(models.Votes).all()


@router.get("/{id}", response_model=schemas.VotesResponse)
def get_vote(id: int, db: Session = Depends(get_db)):
    vote = db.query(models.Votes).filter(models.Votes.id == id).first()
    if not vote:
        raise HTTPException(404, "Vote not found")
    return vote


@router.post("/", response_model=schemas.VotesResponse)
def create_vote(vote: schemas.VotesBase, db: Session = Depends(get_db)):
    new_vote = models.Votes(**vote.dict())
    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)
    return new_vote


@router.put("/{id}", response_model=schemas.VotesResponse)
def update_vote(id: int, updated: schemas.VotesBase, db: Session = Depends(get_db)):
    vote = db.query(models.Votes).filter(models.Votes.id == id)
    if not vote.first():
        raise HTTPException(404, "Vote not found")
    vote.update(updated.dict())
    db.commit()
    return vote.first()


@router.delete("/{id}", status_code=204)
def delete_vote(id: int, db: Session = Depends(get_db)):
    vote = db.query(models.Votes).filter(models.Votes.id == id)
    if not vote.first():
        raise HTTPException(404, "Vote not found")
    vote.delete()
    db.commit()