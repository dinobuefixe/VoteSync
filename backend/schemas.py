from pydantic import BaseModel
from typing import Optional, List

# ────────────────────────────────────────────────────────────────────────────────
# USERS
# ────────────────────────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: str
    password: str
    name: str
    profile_picture: str | None = None

    class Config:
        from_attributes = True

class CreateUser(UserBase):
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    profile_picture: str | None = None
    is_admin: bool = False  # ✅ NOVO

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
# FRIENDSHIPS
# ────────────────────────────────────────────────────────────────────────────────

class FriendshipResponse(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str

    class Config:
        from_attributes = True

class FriendsBase(BaseModel):
    id: int | None = None
    user_id: int
    friend_id: int
    status: str 

    class Config:
        from_attributes = True

class CreateFriendships(BaseModel):
    user_id: int
    friend_id: int
    status: str = "pending"

    class Config:
        from_attributes = True

class FriendshipUpdate(BaseModel):
    status: str

    class Config:
        from_attributes = True

class FriendshipWithFriendData(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    user: UserResponse
    friend: UserResponse

    class Config:
        from_attributes = True

# ✅ NOVO: Schema com dados do amigo
class FriendshipWithFriendData(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    friend: UserResponse  # ✅ Dados completos do amigo

<<<<<<< HEAD
=======
    class Config:
        from_attributes = True


>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
# ────────────────────────────────────────────────────────────────────────────────
# GROUP MEMBERS
# ────────────────────────────────────────────────────────────────────────────────

class GroupMembersBase(BaseModel):
    group_id: int
    user_id: int

    class Config:
        from_attributes = True

class CreateGroupMembers(GroupMembersBase):
    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
# USER GROUPS
# ────────────────────────────────────────────────────────────────────────────────

class UserGroupsBase(BaseModel):
    name: str
    description: str | None = None

    class Config:
        from_attributes = True

class CreateUserGroups(UserGroupsBase):
    class Config:
        from_attributes = True

class UserGroupsResponse(BaseModel):
    id: int
    name: str
<<<<<<< HEAD
    description: str | None = None
    members: List[dict] = []  # ✅ Incluir membros
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
# OPTIONS
# ────────────────────────────────────────────────────────────────────────────────

class OptionsBase(BaseModel):
    vote_id: int
    option_text: str

    class Config:
        from_attributes = True

class CreateOptions(OptionsBase):
    class Config:
        from_attributes = True

class OptionsResponse(BaseModel):
    id: int
    vote_id: int
    option_text: str

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
# VOTES
# ────────────────────────────────────────────────────────────────────────────────

class VotesBase(BaseModel):
    user_id: int
    decision_id: int
    option_id: int

    class Config:
        from_attributes = True

class CreateVotes(VotesBase):
    class Config:
        from_attributes = True

class VotesResponse(BaseModel):
    id: int
    user_id: int
    decision_id: int
    option_id: int

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
# DECISIONS
# ────────────────────────────────────────────────────────────────────────────────

<<<<<<< HEAD
class DecisionFriendResponse(BaseModel):
    id: int
    friendship_id: int
    friendship: FriendshipWithFriendData  # ✅ Dados completos da friendship + amigo

    class Config:
        from_attributes = True

=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
class DecisionsBase(BaseModel):
    vote_id: str
    title: str
    decision_text: str
    description: str | None = None
    end_date: str | None = None
    created_by: str | None = None
    target_group_id: int | None = None
    created_at: str | None = None
<<<<<<< HEAD
    target_friend_ids: List[int] = []  # ✅ IDs das friendships selecionadas
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

    class Config:
        from_attributes = True

class CreateDecisions(DecisionsBase):
    class Config:
        from_attributes = True

class DecisionsResponse(BaseModel):
    id: int
    vote_id: str
    title: str
    decision_text: str
    description: str | None = None
    end_date: str | None = None
    created_by: str | None = None
    target_group_id: int | None = None
    created_at: str | None = None
    options: List[OptionsResponse] = []
<<<<<<< HEAD
    target_friends: List[DecisionFriendResponse] = []  # ✅ Amigos associados
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

    class Config:
        from_attributes = True