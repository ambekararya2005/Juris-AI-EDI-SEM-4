from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.services.rag import load_vector_store
from app.api.routes import auth, documents, search

# Allow all local dev origins (CRA :3000, Vite :5173, etc.)
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    settings.FRONTEND_URL,
]
if settings.FRONTEND_PROD_URL:
    CORS_ORIGINS.append(settings.FRONTEND_PROD_URL)


def _cors_headers(request: Request) -> dict[str, str]:
    origin = request.headers.get("origin") or "http://localhost:3000"
    if origin not in CORS_ORIGINS and not origin.startswith(("http://localhost:", "http://127.0.0.1:")):
        origin = "http://localhost:3000"
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Origin",
        "Access-Control-Expose-Headers": "*",
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_vector_store()
    yield


app = FastAPI(title="JurisAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.middleware("http")
async def cors_on_every_response(request: Request, call_next):
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={}, headers=_cors_headers(request))
    try:
        response = await call_next(request)
    except Exception as exc:
        response = JSONResponse(status_code=500, content={"detail": str(exc)})
    for k, v in _cors_headers(request).items():
        response.headers[k] = v
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=_cors_headers(request),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers=_cors_headers(request),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers=_cors_headers(request),
    )


app.include_router(auth.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(search.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "JurisAI"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
