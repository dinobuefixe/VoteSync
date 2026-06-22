from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/decisions", tags=["Decisions"])


@router.get("/", response_model=List[schemas.DecisionsResponse])
def get_decisions(db: Session = Depends(get_db)):
    # ✅ Eager load das relações para evitar lazy loading
    decisions = db.query(models.Decisions)\
        .options(
            joinedload(models.Decisions.options),
            joinedload(models.Decisions.target_friends)
<<<<<<< HEAD
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.user),
            joinedload(models.Decisions.target_friends)
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.friend)
=======
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        ).all()
    return decisions


@router.get("/{id}", response_model=schemas.DecisionsResponse)
def get_decision(id: int, db: Session = Depends(get_db)):
    # ✅ Eager load das relações
    decision = db.query(models.Decisions)\
        .options(
            joinedload(models.Decisions.options),
            joinedload(models.Decisions.target_friends)
<<<<<<< HEAD
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.user),
            joinedload(models.Decisions.target_friends)
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.friend)
=======
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        )\
        .filter(models.Decisions.id == id).first()
    if not decision:
        raise HTTPException(404, "Decision not found")
    return decision


@router.post("/", response_model=schemas.DecisionsResponse)
def create_decision(decision: schemas.DecisionsBase, db: Session = Depends(get_db)):
    # ✅ Separar os amigos do resto dos dados
    friend_ids = decision.target_friend_ids
    decision_data = decision.dict(exclude={"target_friend_ids"})

    new_decision = models.Decisions(**decision_data)
    db.add(new_decision)
    db.flush()  # ✅ Obter o ID antes do commit

    # ✅ Validar e inserir cada amigo na tabela de junção
    for friendship_id in friend_ids:
        # Validar se a friendship existe
        friendship = db.query(models.Friendships).filter(
            models.Friendships.id == friendship_id
        ).first()
        if not friendship:
            db.rollback()
            raise HTTPException(400, f"Friendship {friendship_id} not found")
        
        db.add(models.DecisionFriends(
            decision_id=new_decision.id,
            friendship_id=friendship_id
        ))

    db.commit()
    db.refresh(new_decision)
    
    # ✅ Eager load antes de retornar
    return db.query(models.Decisions)\
        .options(
            joinedload(models.Decisions.options),
            joinedload(models.Decisions.target_friends)
<<<<<<< HEAD
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.user),
            joinedload(models.Decisions.target_friends)
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.friend)
=======
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        )\
        .filter(models.Decisions.id == new_decision.id).first()


@router.put("/{id}", response_model=schemas.DecisionsResponse)
def update_decision(id: int, updated: schemas.DecisionsBase, db: Session = Depends(get_db)):
    decision = db.query(models.Decisions).filter(models.Decisions.id == id)
    if not decision.first():
        raise HTTPException(404, "Decision not found")

    # ✅ Separar amigos do update
    friend_ids = updated.target_friend_ids
    update_data = updated.dict(exclude={"target_friend_ids"})
    decision.update(update_data)

    # ✅ Validar amigos e atualizar: apagar os antigos e inserir os novos
    for friendship_id in friend_ids:
        friendship = db.query(models.Friendships).filter(
            models.Friendships.id == friendship_id
        ).first()
        if not friendship:
            db.rollback()
            raise HTTPException(400, f"Friendship {friendship_id} not found")

    db.query(models.DecisionFriends).filter(
        models.DecisionFriends.decision_id == id
    ).delete()
    
    for friendship_id in friend_ids:
        db.add(models.DecisionFriends(
            decision_id=id,
            friendship_id=friendship_id
        ))

    db.commit()
    
    # ✅ Eager load antes de retornar
    return db.query(models.Decisions)\
        .options(
            joinedload(models.Decisions.options),
            joinedload(models.Decisions.target_friends)
<<<<<<< HEAD
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.user),
            joinedload(models.Decisions.target_friends)
                .joinedload(models.DecisionFriends.friendship)
                .joinedload(models.Friendships.friend)
=======
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
        )\
        .filter(models.Decisions.id == id).first()


@router.delete("/{id}", status_code=204)
def delete_decision(id: int, db: Session = Depends(get_db)):
    decision = db.query(models.Decisions).filter(models.Decisions.id == id)
    if not decision.first():
        raise HTTPException(404, "Decision not found")

    # ✅ Apagar amigos associados antes de apagar a decisão
    db.query(models.DecisionFriends).filter(
        models.DecisionFriends.decision_id == id
    ).delete()

    decision.delete()
    db.commit()