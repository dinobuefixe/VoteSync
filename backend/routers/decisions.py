from fastapi import FastAPI
import os
import sqlalchemy
from .db import engine

app = FastAPI() 

@app.get("/decisions")
def list_decisions():
    try:
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text("SELECT * FROM decisions where group_id is))
            decisions = [dict(row) for row in result]
        return {"decisions": decisions}
    except Exception as e:
        return {"status": "error", "details": str(e)}