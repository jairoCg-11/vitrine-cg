from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.limiter import limiter
from app.routers import auth, admin, stores, public, banner

app = FastAPI(
    title="Vitrine CG API",
    description="API do Shopping Virtual Popular de Campina Grande",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://vitrine-cg.inovautomatica.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(stores.router)
app.include_router(public.router)
app.include_router(banner.router)


@app.get("/health")
def health():
    return {"status": "ok"}
