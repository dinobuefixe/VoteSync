from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.routers import users, friendships, group_members, user_groups, decisions, votes, options
from backend.database import Base, engine
from backend import models  # importa os modelos

app = FastAPI()

app.mount("/static", StaticFiles(directory="FrontEnd"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("FrontEnd/HTML/index.html")

app.include_router(users.router)
app.include_router(friendships.router)
app.include_router(group_members.router)
app.include_router(user_groups.router)
app.include_router(decisions.router)
app.include_router(votes.router)
app.include_router(options.router)

Base.metadata.create_all(bind=engine)