from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

from app import crud

router = APIRouter(prefix="/api", tags=["cinema"])


class OrderItemIn(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreateIn(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=150)
    customer_email: Optional[EmailStr] = None
    items: list[OrderItemIn] = Field(..., min_length=1)


def _value_error_to_http(e: ValueError) -> HTTPException:
    msg = str(e).lower()
    if "не найден" in msg:
        return HTTPException(status_code=404, detail=str(e))
    if "недостаточно" in msg:
        return HTTPException(status_code=409, detail=str(e))
    if "положительн" in msg or "хотя бы один" in msg:
        return HTTPException(status_code=422, detail=str(e))
    return HTTPException(status_code=400, detail=str(e))


@router.get("/categories")
async def list_categories():
    return await crud.get_categories()


@router.get("/products")
async def list_products(
    category_id: Optional[int] = Query(None, gt=0),
    tag_id: Optional[int] = Query(None, gt=0),
    search: Optional[str] = Query(None, min_length=1, max_length=200),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(
            status_code=422,
            detail="min_price не может быть больше max_price",
        )
    return await crud.get_products(
        category_id=category_id,
        tag_id=tag_id,
        search=search,
        min_price=min_price,
        max_price=max_price,
        limit=limit,
        offset=offset,
    )


@router.get("/products/{product_id}")
async def get_product(product_id: int):
    if product_id <= 0:
        raise HTTPException(status_code=422, detail="product_id должен быть положительным")
    product = await crud.get_product_by_id(product_id)
    if product is None:
        raise HTTPException(status_code=404, detail=f"Товар с id={product_id} не найден")
    return product


@router.post("/orders", status_code=201)
async def create_order(payload: OrderCreateIn):
    try:
        order_id = await crud.create_order(
            customer_name=payload.customer_name,
            customer_email=str(payload.customer_email) if payload.customer_email else None,
            items=[item.model_dump() for item in payload.items],
        )
    except ValueError as e:
        raise _value_error_to_http(e)
    return {"order_id": order_id, "status": "created"}