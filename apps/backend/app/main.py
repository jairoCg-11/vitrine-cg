from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, admin, stores

app = FastAPI(
    title="Vitrine CG API",
    description="API do shopping virtual popular de Campina Grande",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(stores.router)


@app.get("/health", tags=["Sistema"])
def health_check():
    """Verifica se a API está no ar."""
    return {
        "status": "ok",
        "service": "vitrine-cg-api",
        "version": "0.1.0",
    }
