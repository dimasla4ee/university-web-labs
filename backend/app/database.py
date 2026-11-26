import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv()

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "192.168.56.3"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "database": os.environ.get("DB_NAME", "cinema_db"),
    "user": os.environ.get("DB_USER", "cinema_app"),
    "password": os.environ["DB_PASSWORD"],
}

class Database:
    pool: asyncpg.Pool = None

    @classmethod
    async def connect(cls):
        cls.pool = await asyncpg.create_pool(
            min_size=2,
            max_size=10,
            **DB_CONFIG
        )
        print("Пул соединений с PostgreSQL создан")

    @classmethod
    async def disconnect(cls):
        if cls.pool:
            await cls.pool.close()
            print("Пул соединений закрыт")

db = Database()
