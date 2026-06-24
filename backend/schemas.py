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
    status: str = "pending"

    class Config:
        from_attributes = True

class CreateFriendships(BaseModel):
    user_id: int
    friend_id: int
    status: str = "pending"

    class Config:
        from_attributes = True

class UpdateFriendships(BaseModel):
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


# ────────────────────────────────────────────────────────────────────────────────
# GROUP MEMBERS
# ────────────────────────────────────────────────────────────────────────────────

class GroupMemberUser(BaseModel):
    """Dados do utilizador dentro de um membro do grupo"""
    id: int
    name: str
    email: str
    profile_picture: str | None = None

    class Config:
        from_attributes = True

class GroupMembersBase(BaseModel):
    id: int | None = None
    group_id: int
    user_id: int

    class Config:
        from_attributes = True

class GroupMembersWithUser(BaseModel):
    """Membro do grupo com dados completos do utilizador"""
    id: int
    group_id: int
    user_id: int
    user: GroupMemberUser

    class Config:
        from_attributes = True

class CreateGroupMembers(GroupMembersBase):
    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
# USER GROUPS
# ────────────────────────────────────────────────────────────────────────────────

class UserGroupsBase(BaseModel):
    """Base para criar/atualizar grupos"""
    name: str
    description: str | None = None

    class Config:
        from_attributes = True

class UserGroupsCreate(BaseModel):
    """Schema para criar/atualizar grupo COM suporte a member_ids"""
    name: str
    description: str | None = None
    member_ids: List[int] = []  # ✅ NOVO - IDs dos amigos a adicionar

    class Config:
        from_attributes = True

class UserGroupsResponse(BaseModel):
    """Response com membros carregados"""
    id: int
    name: str
    description: str | None = None
    members: List[GroupMembersWithUser] = []

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

class DecisionFriendResponse(BaseModel):
    id: int
    friendship_id: int
    friendship: FriendshipWithFriendData  # ✅ Dados completos da friendship + amigo

    class Config:
        from_attributes = True

class DecisionsBase(BaseModel):
    vote_id: str
    title: str
    decision_text: str
    description: str | None = None
    end_date: str | None = None
    created_by: str | None = None
    group_id: int | None = None
    created_at: str | None = None
    status: str | None = None

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
    group_id: int | None = None
    created_at: str | None = None
    options: List[OptionsResponse] = []
    status: str | None = None


    class Config:
        from_attributes = True