from .database import Base
from sqlalchemy import Column, Integer, String, TIMESTAMP, Boolean, text


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer,primary_key=True,nullable=False)
    email = Column(String,nullable=False,unique=True)
    password = Column(String,nullable=False)
    name = Column(String,nullable=False)  
    profile_picture = Column(String,nullable=True)

class Friendships(Base):
    __tablename__ = "friendships"

    id = Column(Integer,primary_key=True,nullable=False)
    user_id = Column(Integer,nullable=False)
    friend_id = Column(Integer,nullable=False)
    status = Column(String,nullable=False)


class Group_members(Base):
    __tablename__ = "group_members"

    id = Column(Integer,primary_key=True,nullable=False)
    group_id = Column(Integer,nullable=False)
    user_id = Column(Integer,nullable=False)

class User_Groups(Base):
    __tablename__ = "user_groups"

    id = Column(Integer,primary_key=True,nullable=False)
    name = Column(String,nullable=False) 


class Decisions(Base):
    __tablename__ = "decisions"

    id = Column(Integer,primary_key=True,nullable=False)
    vote_id = Column(String,nullable=False,unique=True)
    title = Column(String,nullable=False)
    decision_text = Column(String,nullable=False)      

class Votes(Base):
    __tablename__ = "votes"

    id = Column(Integer,primary_key=True,nullable=False)
    user_id = Column(Integer,nullable=False)
    decision_id = Column(Integer,nullable=False)
    option_id = Column(Integer,nullable=False)

class Options(Base):
    __tablename__ = "options"

    id = Column(Integer,primary_key=True,nullable=False)
    vote_id = Column(Integer,nullable=False)
    option_text = Column(String,nullable=False)

