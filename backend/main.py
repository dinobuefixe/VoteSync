from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.routers import users, friendships, members, groups, decisions, votes, options, auth
from backend.database import Base, engine, init_db
from backend import models 

app = FastAPI()

app.mount("/static", StaticFiles(directory="FrontEnd"), name="static")

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def serve_frontend():
    return FileResponse("FrontEnd/HTML/index.html")

app.include_router(users.router)
app.include_router(friendships.router)
app.include_router(members.router)
app.include_router(groups.router)
app.include_router(decisions.router)
app.include_router(votes.router)
app.include_router(options.router)
app.include_router(auth.router)


Base.metadata.create_all(bind=engine)