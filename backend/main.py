from fastapi import FastAPI, Request
import os
import sqlalchemy
from .db import engine
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .models import Base
from . import models, schemas
from backend.routers import users
from .db import engine

app = FastAPI() 
models.Base.metadata.create_all(bind=engine)
app.include_router(users.router)


@app.get("/users")
def list_users():
    try:
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text("SELECT * FROM users"))
            users = [dict(row) for row in result]
        return {"users": users}
    except Exception as e:
        return {"status": "error", "details": str(e)}


@app.get("/search/{name}")
def search_user(name: str):
    try:
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text("SELECT * FROM users WHERE name = :name"), {"name": name})
            users = [dict(row) for row in result]
        return {"users": users}
    except Exception as e:
        return {"status": "error", "details": str(e)}



@app.post("/add")
async def create_user(request: Request):
    data = await request.json()
    name = data["name"]
    email = data["email"]
    password = data["password"]

    try:
        with engine.connect() as conn:
            conn.execute(
                sqlalchemy.text(
                    "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)"
                ),
                {"name": name, "email": email, "password": password}
            )
            conn.commit()

        return {"status": "success", "added": name}

    except Exception as e:
        return {"status": "error", "details": str(e)}