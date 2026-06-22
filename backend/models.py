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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    is_admin = Column(Boolean, default=False, nullable=False)  # ✅ NOVO
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
    
    # ✅ Relações
    friendships = relationship(
        "Friendships",
        foreign_keys="Friendships.user_id",
        back_populates="user"
    )
    friend_of = relationship(
<<<<<<< HEAD
        "Friendships", 
        foreign_keys="Friendships.friend_id", 
        backref="friend_user"
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
        "Friendships",
        foreign_keys="Friendships.friend_id",
        back_populates="friend"
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
=======
=======
    is_admin = Column(Boolean, default=False, nullable=False)  # ✅ NOVO
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    
    # ✅ Relações
    friendships = relationship(
        "Friendships",
        foreign_keys="Friendships.user_id",
        back_populates="user"
    )
    friend_of = relationship(
<<<<<<< HEAD
        "Friendships", 
        foreign_keys="Friendships.friend_id", 
        backref="friend_user"
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
<<<<<<< HEAD
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
        "Friendships",
        foreign_keys="Friendships.friend_id",
        back_populates="friend"
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    )


class Friendships(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id], back_populates="friend_of")
    user = relationship("Users", foreign_keys=[user_id], back_populates="friendships")
=======
<<<<<<< HEAD
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id])
<<<<<<< HEAD
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id], back_populates="friend_of")
    user = relationship("Users", foreign_keys=[user_id], back_populates="friendships")
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
<<<<<<< HEAD
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)
    
    # ✅ Relação para dados do amigo
    friend = relationship("Users", foreign_keys=[friend_id], back_populates="friend_of")
    user = relationship("Users", foreign_keys=[user_id], back_populates="friendships")
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)


class Group_members(Base):
    __tablename__ = "group_members"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")
    user = relationship("Users", backref="group_memberships")  # ✅ NOVO
=======
<<<<<<< HEAD
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)  # ✅ ForeignKey
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")
<<<<<<< HEAD
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
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")
    user = relationship("Users", backref="group_memberships")  # ✅ NOVO
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
<<<<<<< HEAD
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
    group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # ✅ Relações
    group = relationship("User_Groups", backref="members")
    user = relationship("Users", backref="group_memberships")  # ✅ NOVO
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)


class User_Groups(Base):
    __tablename__ = "user_groups"

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    description = Column(String, nullable=True)
>>>>>>> e098cb0 (Fix group creation, decision target rendering, backend schema, and README documentation)


class DecisionFriends(Base):
    __tablename__ = "decision_friends"

    id = Column(Integer, primary_key=True, nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    friendship_id = Column(Integer, ForeignKey("friendships.id"), nullable=False)

    # ✅ Relação para aceder aos dados da friendship
    friendship = relationship("Friendships")
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))


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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    description = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    created_by = Column(String, nullable=True)
    target_group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=True)
    created_at = Column(String, nullable=True)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
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
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    description = Column(String, nullable=True)  # ✅ Adicionado
    end_date = Column(String, nullable=True)  # ✅ Adicionado
    created_by = Column(String, nullable=True)  # ✅ Adicionado
    target_group_id = Column(Integer, ForeignKey("user_groups.id"), nullable=True)  # ✅ Adicionado
    created_at = Column(String, nullable=True)  # ✅ Adicionado
<<<<<<< HEAD
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
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
<<<<<<< HEAD
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    
    # ✅ Relações
    votes = relationship("Votes", backref="decision")
    options = relationship("Options", backref="decision")
    target_group = relationship("User_Groups", backref="decisions")
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    target_friends = relationship("DecisionFriends", backref="decision_ref")  # ✅ NOVO
=======
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
    target_friends = relationship("DecisionFriends", backref="decision_ref")  # ✅ NOVO
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
    target_friends = relationship("DecisionFriends", backref="decision_ref")  # ✅ NOVO
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    target_friends = relationship("DecisionFriends", backref="decision_ref")  # ✅ NOVO
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    target_friends = relationship("DecisionFriends", backref="decision_ref")  # ✅ NOVO
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)


class Votes(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)  # ✅ ForeignKey
<<<<<<< HEAD
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # ✅ ForeignKey
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
<<<<<<< HEAD
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("options.id"), nullable=False)
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    
    # ✅ Relações
    option = relationship("Options", backref="votes")


class Options(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, nullable=False)
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
=======
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)  # ✅ ForeignKey
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
<<<<<<< HEAD
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
    vote_id = Column(Integer, ForeignKey("decisions.id"), nullable=False)
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    option_text = Column(String, nullable=False)