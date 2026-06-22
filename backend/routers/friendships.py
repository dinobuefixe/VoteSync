from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload  # ✅ Importar joinedload
from typing import List
from backend import models, schemas
from backend.schemas import FriendshipUpdate
from backend.database import get_db

router = APIRouter(prefix="/friendships", tags=["Friendships"])


@router.get("/", response_model=List[schemas.FriendshipWithFriendData])
def get_friendships(db: Session = Depends(get_db)):
    # ✅ Usar joinedload para carregar os dados do amigo
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
    ).all()
    return friendships


@router.get("/{id}", response_model=schemas.FriendshipWithFriendData)
def get_friendship(id: int, db: Session = Depends(get_db)):
    # ✅ Usar joinedload aqui também
    friendship = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
    ).filter(models.Friendships.id == id).first()
    
    if not friendship:
        raise HTTPException(404, "Friendship not found")
    return friendship


@router.post("/", response_model=schemas.FriendshipWithFriendData)
def create_friendship(friendship: schemas.CreateFriendships, db: Session = Depends(get_db)):
    new_friendship = models.Friendships(**friendship.dict())
    db.add(new_friendship)
    db.commit()
    db.refresh(new_friendship)
    return new_friendship


@router.put("/{friendship_id}")
async def update_friendship(friendship_id: int, data: FriendshipUpdate, db: Session = Depends(get_db)):
    friendship = db.query(models.Friendships).filter(models.Friendships.id == friendship_id).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    friendship.status = data.status
    db.commit()
    db.refresh(friendship)
    return friendship


@router.delete("/{id}", status_code=204)
def delete_friendship(id: int, db: Session = Depends(get_db)):
    friendship = db.query(models.Friendships).filter(models.Friendships.id == id)
    if not friendship.first():
        raise HTTPException(404, "Friendship not found")
    friendship.delete()
    db.commit()