from fastapi import FastAPI
from app.database import db
from app.routes import router

app = FastAPI(title="Cinema App API", version="1.0.0")

app.include_router(router)


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()