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
<<<<<<< HEAD
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
=======
    
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
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    )


class Friendships(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id], back_populates="friend_of")
    user = relationship("Users", foreign_keys=[user_id], back_populates="friendships")
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id])
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))


class Group_members(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")
    user = relationship("Users", backref="group_memberships")  # ✅ NOVO
=======
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)  # ✅ ForeignKey
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))


class User_Groups(Base):
    __tablename__ = "user_groups"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
<<<<<<< HEAD


class DecisionFriends(Base):
    __tablename__ = "decision_friends"

    id = Column(Integer, primary_key=True, nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    friendship_id = Column(Integer, ForeignKey("friendships.id"), nullable=False)

    # ✅ Relação para aceder aos dados da friendship
    friendship = relationship("Friendships")
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))


class Decisions(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, nullable=False)
    vote_id = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    decision_text = Column(String, nullable=False)
<<<<<<< HEAD
    description = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    target_group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=True)
    created_at = Column(String, nullable=True)
=======
    description = Column(String, nullable=True)  # ✅ Adicionado
    end_date = Column(String, nullable=True)  # ✅ Adicionado
    created_by = Column(String, nullable=True)  # ✅ Adicionado
    target_group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=True)  # ✅ Adicionado
    created_at = Column(String, nullable=True)  # ✅ Adicionado
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    
    # ✅ Relações
    votes = relationship("Votes", backref="decision")
    options = relationship("Options", backref="decision")
    target_group = relationship("User_Groups", backref="decisions")
<<<<<<< HEAD
    target_friends = relationship("DecisionFriends", backref="decision_ref")  # ✅ NOVO
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))


class Votes(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    
    # ✅ Relações
    option = relationship("Options", backref="votes")


class Options(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    option_text = Column(String, nullable=False)