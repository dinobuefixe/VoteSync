from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("/", response_model=List[schemas.UserGroupsResponse])
def get_groups(user_id: int | None = Query(None), db: Session = Depends(get_db)):
    """Retorna todos os grupos com os seus membros, ou apenas os grupos do utilizador se user_id for fornecido."""
    query = db.query(models.Groups).options(
        joinedload(models.Groups.members).joinedload(models.Members.user)
    )
    if user_id is not None:
        query = query.join(models.Groups.members).filter(models.Members.user_id == user_id).distinct()
    groups = query.all()
    return groups


@router.get("/{id}", response_model=schemas.UserGroupsResponse)
def get_group(id: int, db: Session = Depends(get_db)):
    """Retorna um grupo específico com os seus membros"""
    group = db.query(models.Groups).options(
        joinedload(models.Groups.members).joinedload(models.Members.user)
    ).filter(models.Groups.id == id).first()
    
    if not group:
        raise HTTPException(404, "Group not found")
    return group


@router.post("/", response_model=schemas.UserGroupsResponse)
def create_group(group: schemas.UserGroupsCreate, db: Session = Depends(get_db)):
    """Cria um novo grupo com membros"""
    
    # Validar que os user_ids existem
    if group.member_ids:
        users = db.query(models.Users).filter(models.Users.id.in_(group.member_ids)).all()
        if len(users) != len(group.member_ids):
            raise HTTPException(400, "One or more users not found")
    
    # Criar o grupo
    new_group = models.Groups(
        name=group.name,
        description=getattr(group, 'description', None)
    )
    db.add(new_group)
    db.flush()  # Obter o ID do grupo
    
    # Adicionar membros
    if group.member_ids:
        for user_id in group.member_ids:
            member = models.Members(
                group_id=new_group.id,
                user_id=user_id
            )
            db.add(member)
    
    db.commit()

    # Recarregar o grupo com membros e utilizador aninhado
    group = db.query(models.Groups).options(
        joinedload(models.Groups.members).joinedload(models.Members.user)
    ).filter(models.Groups.id == new_group.id).first()
    return group


@router.put("/{id}", response_model=schemas.UserGroupsResponse)
def update_group(id: int, updated: schemas.UserGroupsCreate, db: Session = Depends(get_db)):
    """Atualiza um grupo e os seus membros"""
    
    group = db.query(models.Groups).filter(models.Groups.id == id).first()
    if not group:
        raise HTTPException(404, "Group not found")
    
    # Validar que os user_ids existem
    if updated.member_ids:
        users = db.query(models.Users).filter(models.Users.id.in_(updated.member_ids)).all()
        if len(users) != len(updated.member_ids):
            raise HTTPException(400, "One or more users not found")
    
    # Atualizar informações do grupo
    group.name = updated.name
    if hasattr(updated, 'description'):
        group.description = updated.description
    
    # Remover membros antigos
    db.query(models.Members).filter(models.Members.group_id == id).delete()
    
    # Adicionar novos membros
    if updated.member_ids:
        for user_id in updated.member_ids:
            member = models.Members(
                group_id=group.id,
                user_id=user_id
            )
            db.add(member)
    
    db.commit()

    group = db.query(models.Groups).options(
        joinedload(models.Groups.members).joinedload(models.Members.user)
    ).filter(models.Groups.id == id).first()
    return group


@router.delete("/{id}", status_code=204)
def delete_group(id: int, db: Session = Depends(get_db)):
    """Remove um grupo e todos os seus membros"""
    group = db.query(models.Groups).filter(models.Groups.id == id)
    if not group.first():
        raise HTTPException(404, "Group not found")
    
    # Remover membros primeiro (FK constraint)
    db.query(models.Members).filter(models.Members.group_id == id).delete()
    
    # Remover grupo
    group.delete()
    db.commit()