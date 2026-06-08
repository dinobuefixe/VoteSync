from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/user-groups", tags=["User Groups"])


@router.get("/", response_model=List[schemas.UserGroupsBase])
def get_groups(db: Session = Depends(get_db)):
    return db.query(models.User_Groups).all()


@router.get("/{id}", response_model=schemas.UserGroupsBase)
def get_group(id: int, db: Session = Depends(get_db)):
    group = db.query(models.User_Groups).filter(models.User_Groups.id == id).first()
    if not group:
        raise HTTPException(404, "Group not found")
    return group


@router.post("/", response_model=schemas.UserGroupsBase)
def create_group(group: schemas.UserGroupsBase, db: Session = Depends(get_db)):
    new_group = models.User_Groups(**group.dict())
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group


@router.put("/{id}", response_model=schemas.UserGroupsBase)
def update_group(id: int, updated: schemas.UserGroupsBase, db: Session = Depends(get_db)):
    group = db.query(models.User_Groups).filter(models.User_Groups.id == id)
    if not group.first():
        raise HTTPException(404, "Group not found")
    group.update(updated.dict())
    db.commit()
    return group.first()


@router.delete("/{id}", status_code=204)
def delete_group(id: int, db: Session = Depends(get_db)):
    group = db.query(models.User_Groups).filter(models.User_Groups.id == id)
    if not group.first():
        raise HTTPException(404, "Group not found")
    group.delete()
    db.commit()
