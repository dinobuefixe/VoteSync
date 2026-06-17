from .database import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, Boolean, text, ForeignKey
from sqlalchemy.orm import relationship


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)  
    profile_picture = Column(String, nullable=True)
    
    # ✅ Relações
    friendships = relationship(
        "Friendships", 
        foreign_keys="Friendships.user_id", 
        backref="user"
    )
    friend_of = relationship(
        "Friendships", 
        foreign_keys="Friendships.friend_id", 
        backref="friend_user"
    )


class Friendships(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id])


class Group_members(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, nullable=False)
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)  # ✅ ForeignKey
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")


class User_Groups(Base):
    __tablename__ = "user_groups"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)


class Decisions(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, nullable=False)
    vote_id = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    decision_text = Column(String, nullable=False)
    description = Column(String, nullable=True)  # ✅ Adicionado
    end_date = Column(String, nullable=True)  # ✅ Adicionado
    created_by = Column(String, nullable=True)  # ✅ Adicionado
    target_group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=True)  # ✅ Adicionado
    created_at = Column(String, nullable=True)  # ✅ Adicionado
    
    # ✅ Relações
    votes = relationship("Votes", backref="decision")
    options = relationship("Options", backref="decision")
    target_group = relationship("User_Groups", backref="decisions")


class Votes(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)  # ✅ ForeignKey
    
    # ✅ Relações
    option = relationship("Options", backref="votes")


class Options(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, nullable=False)
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_text = Column(String, nullable=False)