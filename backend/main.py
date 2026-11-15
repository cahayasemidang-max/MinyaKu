import os
import sys

# Pastikan direktori backend masuk ke sys.path baik dijalankan dari root maupun dari dalam folder backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth_router import router as auth_router
from routers.user_router import router as user_router

app = FastAPI(
    title="MinyaKu (Jelantah Berkah) API",
    description="Backend API Modular (Autentikasi JWT & Manajemen Akun) terhubung ke Supabase",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "MinyaKu Modular API"}


app.include_router(auth_router)
app.include_router(user_router)
