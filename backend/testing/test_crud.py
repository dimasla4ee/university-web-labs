import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import db
from app.crud import get_categories, get_products, get_product_by_id, create_order

PASSED = 0
FAILED = 0


def check(name: str, condition: bool, detail: str = ""):
    global PASSED, FAILED
    if condition:
        PASSED += 1
        print(f"  ✅ {name}")
    else:
        FAILED += 1
        print(f"  ❌ {name} {detail}")


async def expect_error(name: str, coro, expected_substring: str):
    global PASSED, FAILED
    try:
        await coro
        FAILED += 1
        print(f"  ❌ {name} — ожидалась ошибка, но её не было")
    except ValueError as e:
        if expected_substring.lower() in str(e).lower():
            PASSED += 1
            print(f"  ✅ {name} (получено: {e})")
        else:
            FAILED += 1
            print(f"  ❌ {name} — неверный текст ошибки: {e}")


# ──── Сами проверки ────
async def main():
    await db.connect()
    try:
        print("\n📂 get_categories")
        cats = await get_categories()
        check("вернулось 5 категорий", len(cats) == 5, f"(получено {len(cats)})")
        check("есть 'drama'", any(c["slug"] == "drama" for c in cats))
        check("есть product_count", "product_count" in cats[0])

        print("\n🎬 get_products")
        all_p = await get_products()
        check("вернулось 6 товаров", len(all_p) == 6, f"(получено {len(all_p)})")

        dramas = await get_products(category_id=2)
        check("фильтр по category_id=2", all(p["category_id"] == 2 for p in dramas))

        cheap = await get_products(max_price=480)
        check("фильтр max_price=480", all(float(p["price"]) <= 480 for p in cheap))

        search = await get_products(search="Прайм")
        check("поиск 'Прайм' нашёл 1", len(search) == 1, f"(получено {len(search)})")

        page = await get_products(limit=2, offset=0)
        check("пагинация limit=2", len(page) == 2, f"(получено {len(page)})")

        print("\n🔎 get_product_by_id")
        p = await get_product_by_id(3)
        check("товар id=3 найден", p is not None)
        check("title == 'Праймтайм'", p and p["title"] == "Праймтайм")
        check("есть теги", p and isinstance(p["tags"], list) and len(p["tags"]) >= 3)

        missing = await get_product_by_id(99999)
        check("несуществующий id → None", missing is None)

        print("\n🛒 create_order")
        stock_before = (await get_product_by_id(1))["stock_count"]
        order_id = await create_order(
            customer_name="Тест Тестов",
            customer_email="test@example.com",
            items=[{"product_id": 1, "quantity": 2}],
        )
        check("заказ создан, id > 0", order_id > 0, f"(id={order_id})")
        stock_after = (await get_product_by_id(1))["stock_count"]
        check(
            "остаток уменьшился на 2",
            stock_after == stock_before - 2,
            f"(было {stock_before}, стало {stock_after})",
        )

        await expect_error(
            "недостаточный остаток → ValueError",
            create_order(
                customer_name="Жадный",
                customer_email=None,
                items=[{"product_id": 5, "quantity": 999999}],
            ),
            "недостаточно",
        )

        await expect_error(
            "несуществующий товар → ValueError",
            create_order(
                customer_name="Петр",
                customer_email=None,
                items=[{"product_id": 99999, "quantity": 1}],
            ),
            "не найден",
        )

        await expect_error(
            "пустой items → ValueError",
            create_order(
                customer_name="Пусто",
                customer_email=None,
                items=[],
            ),
            "хотя бы один",
        )
    finally:
        await db.disconnect()

    print(f"\n{'=' * 40}")
    print(f"✅ Прошло: {PASSED}   ❌ Упало: {FAILED}")
    print(f"{'=' * 40}")
    sys.exit(0 if FAILED == 0 else 1)


if __name__ == "__main__":
    asyncio.run(main())