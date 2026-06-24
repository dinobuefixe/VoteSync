from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/decisions", tags=["Decisions"])


def load_decision(db: Session, decision_id: int):
    """Reutilizável: carrega uma decisão com eager load das relações."""
    return (
        db.query(models.Decisions)
        .options(
            joinedload(models.Decisions.options),
            joinedload(models.Decisions.group)
                .joinedload(models.Groups.members)
                .joinedload(models.Members.user),
        )
        .filter(models.Decisions.id == decision_id)
        .first()
    )


@router.get("/", response_model=List[schemas.DecisionsResponse])
def get_decisions(db: Session = Depends(get_db)):
    return (
        db.query(models.Decisions)
        .options(
            joinedload(models.Decisions.options),
            joinedload(models.Decisions.group)
                .joinedload(models.Groups.members)
                .joinedload(models.Members.user),
        )
        .all()
    )


@router.get("/{id}", response_model=schemas.DecisionsResponse)
def get_decision(id: int, db: Session = Depends(get_db)):
    decision = load_decision(db, id)
    if not decision:
        raise HTTPException(404, "Decision not found")
    return decision


@router.post("/", response_model=schemas.DecisionsResponse)
def create_decision(decision: schemas.DecisionsBase, db: Session = Depends(get_db)):
    # Validar que o grupo existe (se fornecido)
    if decision.group_id:
        group = db.query(models.Groups).filter(
            models.Groups.id == decision.group_id
        ).first()
        if not group:
            raise HTTPException(400, f"Group {decision.group_id} not found")

    new_decision = models.Decisions(**decision.dict())
    db.add(new_decision)
    db.commit()
    db.refresh(new_decision)

    return load_decision(db, new_decision.id)


@router.put("/{id}", response_model=schemas.DecisionsResponse)
def update_decision(id: int, updated: schemas.DecisionsBase, db: Session = Depends(get_db)):
    query = db.query(models.Decisions).filter(models.Decisions.id == id)
    if not query.first():
        raise HTTPException(404, "Decision not found")

    # Validar que o grupo existe (se fornecido)
    if updated.group_id:
        group = db.query(models.Groups).filter(
            models.Groups.id == updated.group_id
        ).first()
        if not group:
            raise HTTPException(400, f"Group {updated.group_id} not found")

    query.update(updated.dict())
    db.commit()

    return load_decision(db, id)


@router.delete("/{id}", status_code=204)
def delete_decision(id: int, db: Session = Depends(get_db)):
    query = db.query(models.Decisions).filter(models.Decisions.id == id)
    if not query.first():
        raise HTTPException(404, "Decision not found")
    query.delete()
    db.commit()