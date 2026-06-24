import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .models import * 


DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "disable"}
)

Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)  # cria as tabelas que não existem
    print("✅ Tabelas criadas/verificadas!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()