from __future__ import annotations

import json
import asyncpg
from app.database import db

async def get_categories() -> list[dict]:
    query = """
        SELECT c.id, c.name, c.slug, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id, c.name, c.slug
        ORDER BY c.id
    """
    async with db.pool.acquire() as conn:
        rows = await conn.fetch(query)
    return [dict(r) for r in rows]

async def get_products(
    category_id: int | None = None,
    tag_id: int | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    limit: int = 20,
    offset: int = 0,
) -> list[dict]:
    limit = max(1, min(limit, 100))
    offset = max(0, offset)

    conditions: list[str] = []
    params: list = []

    if category_id is not None:
        params.append(category_id)
        conditions.append(f"p.category_id = ${len(params)}")

    if min_price is not None:
        params.append(min_price)
        conditions.append(f"p.price >= ${len(params)}")

    if max_price is not None:
        params.append(max_price)
        conditions.append(f"p.price <= ${len(params)}")

    if search:
        params.append(f"%{search}%")
        conditions.append(
            f"(p.title ILIKE ${len(params)} OR p.description ILIKE ${len(params)})"
        )

    join_tags = ""
    if tag_id is not None:
        join_tags = "JOIN product_tags pt ON pt.product_id = p.id"
        params.append(tag_id)
        conditions.append(f"pt.tag_id = ${len(params)}")

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    params.append(limit)
    params.append(offset)

    query = f"""
        SELECT
            p.id, p.category_id, p.title, p.price,
            p.description, p.stock_count,
            c.name AS category_name
        FROM products p
        JOIN categories c ON c.id = p.category_id
        {join_tags}
        {where_clause}
        ORDER BY p.id
        LIMIT ${len(params) - 1} OFFSET ${len(params)}
    """

    async with db.pool.acquire() as conn:
        rows = await conn.fetch(query, *params)

    return [dict(r) for r in rows]


async def get_product_by_id(product_id: int) -> dict | None:
    query = """
        SELECT
            p.id, p.category_id, p.title, p.price,
            p.description, p.stock_count,
            c.name AS category_name,
            COALESCE(
                (
                    SELECT json_agg(json_build_object('id', t.id, 'name', t.name)
                                    ORDER BY t.id)
                    FROM product_tags pt
                    JOIN tags t ON t.id = pt.tag_id
                    WHERE pt.product_id = p.id
                ),
                '[]'::json
            ) AS tags
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.id = $1
    """
    async with db.pool.acquire() as conn:
        row = await conn.fetchrow(query, product_id)

    if row is None:
        return None

    result = dict(row)
    if isinstance(result["tags"], str):
        result["tags"] = json.loads(result["tags"])
    return result

async def create_order(
    customer_name: str,
    customer_email: str | None,
    items: list[dict],
) -> int:
    if not items:
        raise ValueError("Заказ должен содержать хотя бы один товар")

    merged: dict[int, int] = {}
    for item in items:
        pid = item["product_id"]
        qty = item["quantity"]
        if qty <= 0:
            raise ValueError(f"Количество товара {pid} должно быть положительным")
        merged[pid] = merged.get(pid, 0) + qty

    async with db.pool.acquire() as conn:
        async with conn.transaction():
            product_ids = sorted(merged.keys())

            total_price = 0.0
            line_items: list[tuple[int, int, float]] = []

            for pid in product_ids:
                row = await conn.fetchrow(
                    """
                    SELECT id, price, stock_count
                    FROM products
                    WHERE id = $1
                    FOR UPDATE
                    """,
                    pid,
                )
                if row is None:
                    raise ValueError(f"Товар с id={pid} не найден")

                qty = merged[pid]
                if row["stock_count"] < qty:
                    raise ValueError(
                        f"Недостаточно товара id={pid} на складе: "
                        f"запрошено {qty}, доступно {row['stock_count']}"
                    )

                price = float(row["price"])
                total_price += price * qty
                line_items.append((pid, qty, price))

            order_id = await conn.fetchval(
                """
                INSERT INTO orders (customer_name, customer_email, total_price)
                VALUES ($1, $2, $3)
                RETURNING id
                """,
                customer_name,
                customer_email,
                total_price,
            )

            for pid, qty, price in line_items:
                await conn.execute(
                    """
                    INSERT INTO order_items
                        (order_id, product_id, quantity, price_at_purchase)
                    VALUES ($1, $2, $3, $4)
                    """,
                    order_id, pid, qty, price,
                )
                await conn.execute(
                    "UPDATE products SET stock_count = stock_count - $1 WHERE id = $2",
                    qty, pid,
                )

            return order_id