from fastapi import FastAPI
import os
import sqlalchemy

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = sqlalchemy.create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "disable"}
)

# Criar tabela se não existir
with engine.connect() as conn:
    conn.execute(sqlalchemy.text("""
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL
        );
    """))
    conn.commit()


@app.get("/")
def root():
    return {"message": "API online e ligada ao PostgreSQL"}


@app.post("/add/{name}")
def add_item(name: str):
    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("INSERT INTO items (name) VALUES (:name)"), {"name": name})
            conn.commit()
        return {"status": "success", "added": name}
    except Exception as e:
        return {"status": "error", "details": str(e)}


@app.get("/items")
def list_items():
    try:
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text("SELECT * FROM items"))
            items = [dict(row) for row in result]
        return {"items": items}
    except Exception as e:
        return {"status": "error", "details": str(e)}
