from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("/", response_model=List[schemas.GroupMembersBase])
def get_group_members(db: Session = Depends(get_db)):
    """vai buscar todos os membros do grupo"""
    return db.query(models.Members).all()


@router.get("/{memberId}", response_model=List[schemas.UserGroupsResponse])
def get_groups_by_user(memberId: int, db: Session = Depends(get_db)):
    groups = db.query(models.Groups).options(
        joinedload(models.Members.group).joinedload(models.Groups.members).joinedload(models.Members.user)
    ).filter(
        models.Members.user_id == memberId
    ).all()
    return groups


@router.post("/", response_model=schemas.GroupMembersBase)
def create_group_member(member: schemas.GroupMembersBase, db: Session = Depends(get_db)):
    new_member = models.Members(**member.dict())
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    return new_member


@router.put("/{memberId}", response_model=schemas.GroupMembersBase)
def update_group_member(memberId: int, updated: schemas.GroupMembersBase, db: Session = Depends(get_db)):
    member = db.query(models.Members).filter(models.Members.id == memberId)
    if not member.first():
        raise HTTPException(404, "Group member not found")
    member.update(updated.dict())
    db.commit()
    return member.first()


@router.delete("/{memberId}", status_code=204)
def delete_group_member(memberId: int, db: Session = Depends(get_db)):
    member = db.query(models.Members).filter(models.Members.id == memberId)
    if not member.first():
        raise HTTPException(404, "Group member not found")
    member.delete()
    db.commit()
