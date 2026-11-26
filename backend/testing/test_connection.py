import asyncio
from app.database import db

async def main():
    await db.connect()

    async with db.pool.acquire() as conn:
        version = await conn.fetchval("SELECT version();")
        print(f"Подключение работает. Версия PostgreSQL:\n{version}")

        tables = await conn.fetch(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
            """
        )
        print("\nНайденные таблицы:")
        for row in tables:
            print(f"  - {row['table_name']}")

        current_user = await conn.fetchval("SELECT current_user;")
        current_db = await conn.fetchval("SELECT current_database();")
        print(f"\nПользователь: {current_user}\nБаза данных: {current_db}")

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())