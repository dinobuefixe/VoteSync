from fastapi import APIRouter, Depends, HTTPException
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload
=======
from sqlalchemy.orm import Session, joinedload  # ✅ Importar joinedload
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
from sqlalchemy.orm import Session, joinedload  # ✅ Importar joinedload
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
from sqlalchemy.orm import Session, joinedload  # ✅ Importar joinedload
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
from sqlalchemy.orm import Session, joinedload  # ✅ Importar joinedload
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
from sqlalchemy.orm import Session, joinedload  # ✅ Importar joinedload
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session, joinedload
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
from typing import List
from backend import models, schemas
from backend.schemas import FriendshipUpdate
from backend.database import get_db

router = APIRouter(prefix="/friendships", tags=["Friendships"])


@router.get("/", response_model=List[schemas.FriendshipWithFriendData])
def get_friendships(db: Session = Depends(get_db)):
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend),
        joinedload(models.Friendships.user)
    ).filter(
        models.Friendships.user.has(),
        models.Friendships.friend.has()
=======
    # ✅ Usar joinedload para carregar os dados do amigo
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    # ✅ Usar joinedload para carregar os dados do amigo
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    # ✅ Usar joinedload para carregar os dados do amigo
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    # ✅ Usar joinedload para carregar os dados do amigo
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    # ✅ Usar joinedload para carregar os dados do amigo
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    friendships = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend),
        joinedload(models.Friendships.user)
    ).filter(
        models.Friendships.user.has(),
        models.Friendships.friend.has()
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    ).all()
    return friendships


@router.get("/{id}", response_model=schemas.FriendshipWithFriendData)
def get_friendship(id: int, db: Session = Depends(get_db)):
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    friendship = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend),
        joinedload(models.Friendships.user)
    ).filter(
        models.Friendships.id == id,
        models.Friendships.user.has(),
        models.Friendships.friend.has()
    ).first()
=======
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    # ✅ Usar joinedload aqui também
    friendship = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend)
    ).filter(models.Friendships.id == id).first()
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    friendship = db.query(models.Friendships).options(
        joinedload(models.Friendships.friend),
        joinedload(models.Friendships.user)
    ).filter(
        models.Friendships.id == id,
        models.Friendships.user.has(),
        models.Friendships.friend.has()
    ).first()
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    
    if not friendship:
        raise HTTPException(404, "Friendship not found")
    return friendship


@router.post("/", response_model=schemas.FriendshipWithFriendData)
def create_friendship(friendship: schemas.CreateFriendships, db: Session = Depends(get_db)):
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    if friendship.user_id == friendship.friend_id:
        raise HTTPException(400, "Cannot create friendship with yourself")

    requester = db.query(models.Users).filter(models.Users.id == friendship.user_id).first()
    recipient = db.query(models.Users).filter(models.Users.id == friendship.friend_id).first()
    if not requester or not recipient:
        raise HTTPException(400, "User not found")

    existing = db.query(models.Friendships).filter(
        or_(
            and_(models.Friendships.user_id == friendship.user_id, models.Friendships.friend_id == friendship.friend_id),
            and_(models.Friendships.user_id == friendship.friend_id, models.Friendships.friend_id == friendship.user_id),
        )
    ).first()

    if existing:
        if existing.user_id == friendship.user_id and existing.friend_id == friendship.friend_id:
            if existing.status == "pending":
                raise HTTPException(400, "Friend request already pending")
            if existing.status == "accepted":
                raise HTTPException(400, "Friendship already exists")
            existing.status = "pending"
            db.commit()
            db.refresh(existing)
            return existing

        if existing.user_id == friendship.friend_id and existing.friend_id == friendship.user_id:
            if existing.status == "pending":
                existing.status = "accepted"
                db.commit()
                db.refresh(existing)
                return existing
            if existing.status == "accepted":
                raise HTTPException(400, "Friendship already exists")
            if existing.status in {"rejected", "pending"}:
                existing.user_id = friendship.user_id
                existing.friend_id = friendship.friend_id
                existing.status = "pending"
                db.commit()
                db.refresh(existing)
                return existing

    new_friendship = models.Friendships(
        user_id=friendship.user_id,
        friend_id=friendship.friend_id,
        status="pending"
    )
<<<<<<< HEAD
=======
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    new_friendship = models.Friendships(**friendship.dict())
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    db.add(new_friendship)
    db.commit()
    db.refresh(new_friendship)
    return new_friendship


<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
@router.put("/{friendship_id}")
async def update_friendship(friendship_id: int, data: FriendshipUpdate, db: Session = Depends(get_db)):
    friendship = db.query(models.Friendships).filter(models.Friendships.id == friendship_id).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    friendship.status = data.status
=======
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
>>>>>>> 7cbe1b4 (feat/friends:pending-friendship-requests)
@router.patch("/{id}/accept", response_model=schemas.FriendshipWithFriendData)
def accept_friendship(id: int, db: Session = Depends(get_db)):
    friendship = db.query(models.Friendships).filter(models.Friendships.id == id).first()
    if not friendship:
        raise HTTPException(404, "Friendship not found")
    if friendship.status != "accepted":
        friendship.status = "accepted"
        db.commit()
        db.refresh(friendship)
    return friendship


@router.patch("/{id}/reject", response_model=schemas.FriendshipWithFriendData)
def reject_friendship(id: int, db: Session = Depends(get_db)):
    friendship = db.query(models.Friendships).filter(models.Friendships.id == id).first()
    if not friendship:
        raise HTTPException(404, "Friendship not found")
    if friendship.status != "rejected":
        friendship.status = "rejected"
        db.commit()
        db.refresh(friendship)
    return friendship


>>>>>>> e098cb0 (Fix group creation, decision target rendering, backend schema, and README documentation)
@router.put("/{id}", response_model=schemas.FriendshipWithFriendData)
def update_friendship(id: int, updated: schemas.UpdateFriendships, db: Session = Depends(get_db)):
    if updated.status not in {"pending", "accepted", "rejected"}:
        raise HTTPException(400, "Invalid friendship status")

    friendship_query = db.query(models.Friendships).filter(models.Friendships.id == id)
    friendship_obj = friendship_query.first()
    if not friendship_obj:
        raise HTTPException(404, "Friendship not found")
<<<<<<< HEAD
    friendship.update(updated.dict())
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    db.commit()
    db.refresh(friendship)
    return friendship
=======

    friendship_query.update({"status": updated.status}, synchronize_session=False)
    db.commit()
    return friendship_query.first()
<<<<<<< HEAD
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
=======
@router.put("/{friendship_id}")
async def update_friendship(friendship_id: int, data: FriendshipUpdate, db: Session = Depends(get_db)):
    friendship = db.query(models.Friendships).filter(models.Friendships.id == friendship_id).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    friendship.status = data.status
    db.commit()
    db.refresh(friendship)
    return friendship
>>>>>>> 0f2ab96 (feat/friends:pending-friendship-requests)
>>>>>>> 7cbe1b4 (feat/friends:pending-friendship-requests)


@router.delete("/{id}", status_code=204)
def delete_friendship(id: int, db: Session = Depends(get_db)):
    friendship = db.query(models.Friendships).filter(models.Friendships.id == id)
    if not friendship.first():
        raise HTTPException(404, "Friendship not found")
    friendship.delete()
    db.commit()