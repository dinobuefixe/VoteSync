from fastapi import FastAPI
from backend.routers import users, friendships, group_members, user_groups, decisions, votes, options

app = FastAPI()

app.include_router(users.router)
app.include_router(friendships.router)
app.include_router(group_members.router)
app.include_router(user_groups.router)
app.include_router(decisions.router)
app.include_router(votes.router)
app.include_router(options.router)


