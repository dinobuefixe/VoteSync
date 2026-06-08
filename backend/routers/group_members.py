from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/group-members", tags=["Group Members"])


@router.get("/", response_model=List[schemas.GroupMembersBase])
def get_group_members(db: Session = Depends(get_db)):
    return db.query(models.Group_members).all()


@router.get("/{id}", response_model=schemas.GroupMembersBase)
def get_group_member(id: int, db: Session = Depends(get_db)):
    member = db.query(models.Group_members).filter(models.Group_members.id == id).first()
    if not member:
        raise HTTPException(404, "Group member not found")
    return member


@router.post("/", response_model=schemas.GroupMembersBase)
def create_group_member(member: schemas.GroupMembersBase, db: Session = Depends(get_db)):
    new_member = models.Group_members(**member.dict())
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@router.put("/{id}", response_model=schemas.GroupMembersBase)
def update_group_member(id: int, updated: schemas.GroupMembersBase, db: Session = Depends(get_db)):
    member = db.query(models.Group_members).filter(models.Group_members.id == id)
    if not member.first():
        raise HTTPException(404, "Group member not found")
    member.update(updated.dict())
    db.commit()
    return member.first()


@router.delete("/{id}", status_code=204)
def delete_group_member(id: int, db: Session = Depends(get_db)):
    member = db.query(models.Group_members).filter(models.Group_members.id == id)
    if not member.first():
        raise HTTPException(404, "Group member not found")
    member.delete()
    db.commit()
