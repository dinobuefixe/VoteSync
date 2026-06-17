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

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
# FRIENDSHIPS
# ────────────────────────────────────────────────────────────────────────────────

class FriendshipsBase(BaseModel):
    id: int | None = None
    user_id: int
    friend_id: int
    status: str = "accepted"

    class Config:
        from_attributes = True

class CreateFriendships(BaseModel):
    user_id: int
    friend_id: int
    status: str = "accepted"

    class Config:
        from_attributes = True

# ✅ NOVO: Schema com dados do amigo
class FriendshipWithFriendData(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    friend: UserResponse  # ✅ Dados completos do amigo

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True

class CreateUserGroups(UserGroupsBase):
    class Config:
        from_attributes = True

class UserGroupsResponse(BaseModel):
    id: int
    name: str

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

class DecisionsBase(BaseModel):
    vote_id: str
    title: str
    decision_text: str
    description: str | None = None
    end_date: str | None = None
    created_by: str | None = None
    target_group_id: int | None = None
    created_at: str | None = None

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

    class Config:
        from_attributes = True