import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
 
# URL do PostgreSQL (exemplo):
# postgresql://usuario:senha@host:porta/nome_do_banco
DATABASE_URL = os.getenv("DATABASE_URL")
 
# Cria o engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "disable"}  # remove SSL se estiver em localhost
)
 
# Base para os modelos herdarem
Base = declarative_base()
 
# Sessao do banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
 
 
# Dependencia para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 