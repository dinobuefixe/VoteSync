from pydantic import BaseModel

# users

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


# friendships

class FriendshipsBase(BaseModel):
    id: int | None = None
    user_id: int
    friend_id: int
    status: str 

    class Config:
        from_attributes = True


class CreateFriendships(BaseModel):
    user_id: int
    friend_id: int
    status: str

    class Config:
        from_attributes = True


class FriendshipUpdate(BaseModel):
    status: str

# members

class GroupMembersBase(BaseModel):
    group_id: int
    user_id: int

    class Config:
        from_attributes = True


class CreateGroupMembers(GroupMembersBase):
    class Config:
        from_attributes = True


# groups

class UserGroupsBase(BaseModel):
    name: str

    class Config:
        from_attributes = True


class CreateUserGroups(UserGroupsBase):
    class Config:
        from_attributes = True


# decisions

class DecisionsBase(BaseModel):
    vote_id: str
    title: str
    decision_text: str

    class Config:
        from_attributes = True


class CreateDecisions(DecisionsBase):
    class Config:
        from_attributes = True


# votes

class VotesBase(BaseModel):
    user_id: int
    decision_id: int
    option_id: int

    class Config:
        from_attributes = True


class CreateVotes(VotesBase):
    class Config:
        from_attributes = True


# options

class OptionsBase(BaseModel):
    vote_id: int
    option_text: str

    class Config:
        from_attributes = True


class CreateOptions(OptionsBase):
    class Config:
        from_attributes = True