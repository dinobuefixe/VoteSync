import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import FastAPI
import os

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = sqlalchemy.create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "disable"}
)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

with engine.connect() as conn:
    conn.execute(sqlalchemy.text("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS votes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            decision_id INTEGER REFERENCES decisions(id),
            option_id INTEGER REFERENCES options(id)
        );

        CREATE TABLE IF NOT EXISTS options (
            id SERIAL PRIMARY KEY,
            vote_id INTEGER REFERENCES votes(id),
            option_text TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS decisions (
            id SERIAL PRIMARY KEY,
            vote_id INTEGER REFERENCES votes(id),
            decision_text TEXT NOT NULL,
            title TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_groups (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS group_members (
            id SERIAL PRIMARY KEY,
            group_id INTEGER REFERENCES user_groups(id),
            user_id INTEGER REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS friendships (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            friend_id INTEGER REFERENCES users(id),
            status TEXT NOT NULL
        );
    """))
    conn.commit()

