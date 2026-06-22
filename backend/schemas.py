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
<<<<<<< HEAD
<<<<<<< HEAD
    status: str 
=======
    status: str = "pending"
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
    status: str 
>>>>>>> 7cbe1b4 (feat/friends:pending-friendship-requests)

    class Config:
        from_attributes = True

class CreateFriendships(BaseModel):
    user_id: int
    friend_id: int
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    status: str = "pending"

    class Config:
        from_attributes = True

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
class FriendshipUpdate(BaseModel):
=======
class UpdateFriendships(BaseModel):
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
    status: str
=======
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
# ✅ NOVO: Schema com dados do amigo
class FriendshipWithFriendData(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    friend: UserResponse  # ✅ Dados completos do amigo
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

    class Config:
        from_attributes = True

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
class FriendshipWithFriendData(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    user: UserResponse
    friend: UserResponse
=======
class UpdateFriendships(BaseModel):
=======
>>>>>>> 7cbe1b4 (feat/friends:pending-friendship-requests)
    status: str
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)

    class Config:
        from_attributes = True

class FriendshipWithFriendData(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    user: UserResponse
    friend: UserResponse

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
    class Config:
        from_attributes = True


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
=======
# members
>>>>>>> 7cbe1b4 (feat/friends:pending-friendship-requests)
=======
# ────────────────────────────────────────────────────────────────────────────────
# GROUP MEMBERS
# ────────────────────────────────────────────────────────────────────────────────
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))

class GroupMembersBase(BaseModel):
    id: int | None = None
    group_id: int
    user_id: int

    class Config:
        from_attributes = True

<<<<<<< HEAD
class GroupMembersWithUser(BaseModel):
    """Membro do grupo com dados completos do utilizador"""
    id: int
    group_id: int
    user_id: int
    user: GroupMemberUser

    class Config:
        from_attributes = True

=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    description: str | None = None
<<<<<<< HEAD
    members: List[dict] = []  # ✅ Incluir membros
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
    description: str | None = None
    members: List[dict] = []  # ✅ Incluir membros
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
    members: List[GroupMembersWithUser] = []
>>>>>>> e098cb0 (Fix group creation, decision target rendering, backend schema, and README documentation)

    class Config:
        from_attributes = True

<<<<<<< HEAD

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
=======
class CreateUserGroups(UserGroupsBase):
    class Config:
        from_attributes = True

class UserGroupsResponse(BaseModel):
    id: int
    name: str
<<<<<<< HEAD
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    description: str | None = None
    members: List[dict] = []  # ✅ Incluir membros
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────────────────────────────────────
<<<<<<< HEAD
=======
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
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
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
class DecisionFriendResponse(BaseModel):
    id: int
    friendship_id: int
    friendship: FriendshipWithFriendData  # ✅ Dados completos da friendship + amigo

    class Config:
        from_attributes = True

<<<<<<< HEAD
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
>>>>>>> c3f90b4 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    target_friend_ids: List[int] = []  # ✅ IDs das friendships selecionadas
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
    target_friend_ids: List[int] = []  # ✅ IDs das friendships selecionadas
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
    target_friend_ids: List[int] = []  # ✅ IDs das friendships selecionadas
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    target_friend_ids: List[int] = []  # ✅ IDs das friendships selecionadas
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    target_friend_ids: List[int] = []  # ✅ IDs das friendships selecionadas
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)

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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    target_friends: List[DecisionFriendResponse] = []  # ✅ Amigos associados
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
    target_friends: List[DecisionFriendResponse] = []  # ✅ Amigos associados
>>>>>>> 9224db4 (Fix auth and friendships backend issues; update frontend deployment docs)
=======
    target_friends: List[DecisionFriendResponse] = []  # ✅ Amigos associados
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
>>>>>>> 1d52963 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    target_friends: List[DecisionFriendResponse] = []  # ✅ Amigos associados
=======
>>>>>>> fc68462 (feat:Decision-making feature and decisions listing page (frontend + backend + database))
=======
    target_friends: List[DecisionFriendResponse] = []  # ✅ Amigos associados
>>>>>>> f094ba3 (Fix auth and friendships backend issues; update frontend deployment docs)
>>>>>>> 94946f3 (Fix auth and friendships backend issues; update frontend deployment docs)

    class Config:
        from_attributes = True