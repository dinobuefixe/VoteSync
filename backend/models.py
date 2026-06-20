# backend/models.py
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
    is_admin = Column(Boolean, default=False, nullable=False)  # ✅ NOVO
    
    # ✅ Relações
    friendships = relationship(
        "Friendships",
        foreign_keys="Friendships.user_id",
        back_populates="user"
    )
    friend_of = relationship(
        "Friendships",
        foreign_keys="Friendships.friend_id",
        back_populates="friend"
    )


class Friendships(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id], back_populates="friend_of")
    user = relationship("Users", foreign_keys=[user_id], back_populates="friendships")


class Group_members(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, nullable=False)
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")
    user = relationship("Users", backref="group_memberships")  # ✅ NOVO


class User_Groups(Base):
    __tablename__ = "user_groups"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)


class DecisionFriends(Base):
    __tablename__ = "decision_friends"

    id = Column(Integer, primary_key=True, nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    friendship_id = Column(Integer, ForeignKey("friendships.id"), nullable=False)

    # ✅ Relação para aceder aos dados da friendship
    friendship = relationship("Friendships")


class Decisions(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, nullable=False)
    vote_id = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    decision_text = Column(String, nullable=False)
    description = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    target_group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=True)
    created_at = Column(String, nullable=True)
    
    # ✅ Relações
    votes = relationship("Votes", backref="decision")
    options = relationship("Options", backref="decision")
    target_group = relationship("User_Groups", backref="decisions")
    target_friends = relationship("DecisionFriends", backref="decision_ref")  # ✅ NOVO


class Votes(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
    
    # ✅ Relações
    option = relationship("Options", backref="votes")


class Options(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, nullable=False)
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    option_text = Column(String, nullable=False)