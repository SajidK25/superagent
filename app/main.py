import time

from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.cors import CORSMiddleware

from app.lib.prisma import prisma
from app.routers import router

app = FastAPI(
    title="Superagent",
    description="Bring your agents to production",
    version="0.0.7",
)
origins= [
    "https://api.rapidagent.ai",
    "http://api.rapidagent.ai",
    "https://localhost:3000",
    "http://localhost:3000",
    "https://backend.rapidagent.ai",
    "http://backend.rapidagent.ai"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","POST","PUT","PATCH","DELETE"],
    allow_headers=["Access-Control-Allow-Origin"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"Total request time: {process_time} secs")
    return response


@app.on_event("startup")
async def startup():
    prisma.connect()


@app.on_event("shutdown")
async def shutdown():
    prisma.disconnect()


app.include_router(router)
