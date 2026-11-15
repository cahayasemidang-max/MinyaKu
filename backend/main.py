import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import httpx
import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dcydwhlrpgoquvklbtbr.supabase.co").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_BbqOiax3pravZEMWfE-v7A_TYClluqi")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "minyaku-jelantah-berkah-secret-key-2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))
SETUP_TOKEN_EXPIRE_MINUTES = int(os.getenv("SETUP_TOKEN_EXPIRE_MINUTES", "15"))

app = FastAPI(
    title="MinyaKu (Jelantah Berkah) API",
    description="Backend API Autentikasi JWT & Manajemen Akun terhubung ke Supabase",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# ============================================================================
# Helper Supabase REST Client (PostgREST)
# ============================================================================
def supabase_headers(prefer: Optional[str] = None) -> dict:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


async def fetch_user_by_username(username: str) -> Optional[dict]:
    clean = username.strip()
    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {
        "username": f"ilike.{clean}",
        "select": "*",
        "limit": "1",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=supabase_headers(), params=params)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gagal menghubungi database Supabase: {resp.text}",
            )
        rows = resp.json()
        return rows[0] if rows else None


async def fetch_user_by_id(user_id: int) -> Optional[dict]:
    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {
        "id": f"eq.{user_id}",
        "select": "*",
        "limit": "1",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=supabase_headers(), params=params)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gagal menghubungi database Supabase: {resp.text}",
            )
        rows = resp.json()
        return rows[0] if rows else None


# ============================================================================
# Helper JWT (Create & Verify)
# ============================================================================
def create_jwt_token(user: dict, scope: str, expires_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user["id"]),
        "username": user["username"],
        "nama_lengkap": user["nama_lengkap"],
        "role": user["role"],
        "rt": user.get("rt"),
        "scope": scope,  # "access" atau "setup_pin"
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi token telah berakhir (expired). Silakan login kembali.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token JWT tidak valid.",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    payload = decode_jwt_token(credentials.credentials)
    if payload.get("scope") != "access":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token ini hanya untuk pembuatan PIN awal. Silakan selesaikan pembuatan PIN terlebih dahulu.",
        )
    user = await fetch_user_by_id(int(payload["sub"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Akun pengguna tidak ditemukan.",
        )
    if not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun ini sedang dinonaktifkan oleh Pengurus RW.",
        )
    return user


# ============================================================================
# Pydantic Schemas
# ============================================================================
class UserPublicResponse(BaseModel):
    id: int
    username: str
    nama_lengkap: str
    role: str
    rt: Optional[str] = None
    no_hp: Optional[str] = None
    is_first_login: bool
    saldo_rupiah: int = 0
    total_liter: float = 0.0
    active: bool = True


class LoginRequest(BaseModel):
    username: str = Field(..., description="Nomor rumah (misal B713) atau ID Admin")
    credential: str = Field(..., description="Nama depan KK (saat login pertama) atau PIN")


class LoginResponse(BaseModel):
    ok: bool
    requires_pin_setup: bool
    message: str
    access_token: Optional[str] = None
    setup_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserPublicResponse


class SetupPinRequest(BaseModel):
    new_pin: str = Field(..., min_length=3, max_length=50)
    confirm_pin: str = Field(..., min_length=3, max_length=50)


class ChangePinRequest(BaseModel):
    current_pin: str
    new_pin: str = Field(..., min_length=3, max_length=50)


class CheckUsernameResponse(BaseModel):
    found: bool
    username: Optional[str] = None
    nama_lengkap: Optional[str] = None
    role: Optional[str] = None
    rt: Optional[str] = None
    is_first_login: Optional[bool] = None


class CreateUserRequest(BaseModel):
    username: str = Field(..., description="Nomor rumah tanpa spasi (misal B715) atau ID Admin RT")
    password: str = Field(..., description="Nama depan Kepala Keluarga untuk login pertama")
    nama_lengkap: str
    role: str = Field(default="WARGA", pattern="^(WARGA|ADMIN_RT)$")
    rt: str = Field(..., pattern="^RT 0[1-7]$")
    no_hp: Optional[str] = "-"


def to_public_user(row: dict) -> UserPublicResponse:
    return UserPublicResponse(
        id=row["id"],
        username=row["username"],
        nama_lengkap=row["nama_lengkap"],
        role=row["role"],
        rt=row.get("rt"),
        no_hp=row.get("no_hp"),
        is_first_login=bool(row.get("is_first_login", False)),
        saldo_rupiah=int(row.get("saldo_rupiah") or 0),
        total_liter=float(row.get("total_liter") or 0.0),
        active=bool(row.get("active", True)),
    )


# ============================================================================
# Endpoints Autentikasi & Akun
# ============================================================================
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "MinyaKu Auth & Users API"}


@app.get("/api/auth/check-username/{username}", response_model=CheckUsernameResponse)
async def check_username_status(username: str):
    """
    Mengecek apakah username (Nomor Rumah / ID Admin) terdaftar dan apakah
    masih login pertama kali (is_first_login = true) atau sudah punya PIN.
    """
    user = await fetch_user_by_username(username)
    if not user:
        return CheckUsernameResponse(found=False)
    return CheckUsernameResponse(
        found=True,
        username=user["username"],
        nama_lengkap=user["nama_lengkap"],
        role=user["role"],
        rt=user.get("rt"),
        is_first_login=bool(user.get("is_first_login", False)),
    )


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    user = await fetch_user_by_username(req.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Akun dengan Nomor Rumah / Username '{req.username.strip()}' tidak ditemukan.",
        )

    if not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun Anda sedang dinonaktifkan oleh Pengurus RW.",
        )

    role = user["role"]
    is_first_login = bool(user.get("is_first_login", False))
    credential_clean = req.credential.strip()

    # 1. Alur Khusus Warga & Relawan (ADMIN_RT) saat Login Pertama Kali
    if role in ("WARGA", "ADMIN_RT") and is_first_login:
        expected_first_password = (user.get("password") or "").strip()
        if credential_clean.lower() != expected_first_password.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password awal tidak cocok. Gunakan Nama Depan Kepala Keluarga (tidak peka huruf besar/kecil).",
            )

        setup_token = create_jwt_token(
            user=user,
            scope="setup_pin",
            expires_minutes=SETUP_TOKEN_EXPIRE_MINUTES,
        )
        return LoginResponse(
            ok=True,
            requires_pin_setup=True,
            message=f"Halo {user['nama_lengkap']}! Karena ini login pertama Anda, silakan buat PIN pribadi untuk login selanjutnya.",
            setup_token=setup_token,
            user=to_public_user(user),
        )

    # 2. Alur Super Admin RW (tidak menggunakan is_first_login)
    if role == "SUPER_ADMIN_RW":
        valid_pin = (user.get("pin") or "").strip()
        valid_pwd = (user.get("password") or "").strip()
        if credential_clean != valid_pin and credential_clean != valid_pwd:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password / PIN Super Admin RW tidak sesuai.",
            )
    else:
        # 3. Alur Warga & Relawan yang sudah punya PIN (is_first_login = False)
        valid_pin = (user.get("pin") or "").strip()
        if not valid_pin or credential_clean != valid_pin:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="PIN yang Anda masukkan salah.",
            )

    access_token = create_jwt_token(
        user=user,
        scope="access",
        expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    return LoginResponse(
        ok=True,
        requires_pin_setup=False,
        message=f"Selamat datang kembali, {user['nama_lengkap']}!",
        access_token=access_token,
        user=to_public_user(user),
    )


@app.post("/api/auth/setup-pin", response_model=LoginResponse)
async def setup_first_pin(
    req: SetupPinRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Endpoint khusus Warga & Admin RT setelah berhasil verifikasi Nama Depan KK
    pada login pertama kali. Menyimpan PIN baru dan mengubah is_first_login = False.
    """
    payload = decode_jwt_token(credentials.credentials)
    if payload.get("scope") != "setup_pin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token tidak valid untuk pembuatan PIN perdana.",
        )

    new_pin = req.new_pin.strip()
    confirm_pin = req.confirm_pin.strip()
    if not new_pin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN baru tidak boleh kosong.",
        )
    if new_pin != confirm_pin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Konfirmasi PIN baru tidak cocok.",
        )

    user_id = int(payload["sub"])
    user = await fetch_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Akun tidak ditemukan.",
        )

    if user["role"] == "SUPER_ADMIN_RW":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Super Admin RW tidak memerlukan setup PIN perdana.",
        )

    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {"id": f"eq.{user_id}"}
    update_body = {
        "pin": new_pin,
        "is_first_login": False,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.patch(
            url,
            headers=supabase_headers(prefer="return=representation"),
            params=params,
            json=update_body,
        )
        if resp.status_code not in (200, 204):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gagal menyimpan PIN ke Supabase: {resp.text}",
            )
        updated_rows = resp.json()
        updated_user = updated_rows[0] if updated_rows else {**user, **update_body}

    access_token = create_jwt_token(
        user=updated_user,
        scope="access",
        expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    return LoginResponse(
        ok=True,
        requires_pin_setup=False,
        message="PIN pribadi berhasil disimpan! Selanjutnya Anda cukup login menggunakan Nomor Rumah/Username dan PIN ini.",
        access_token=access_token,
        user=to_public_user(updated_user),
    )


@app.get("/api/auth/me", response_model=UserPublicResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return to_public_user(current_user)


@app.put("/api/auth/change-pin")
async def change_pin(
    req: ChangePinRequest,
    current_user: dict = Depends(get_current_user),
):
    current_pin = (current_user.get("pin") or "").strip()
    if current_pin and req.current_pin.strip() != current_pin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN saat ini yang Anda masukkan tidak sesuai.",
        )

    new_pin = req.new_pin.strip()
    if not new_pin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN baru tidak boleh kosong.",
        )

    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {"id": f"eq.{current_user['id']}"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.patch(
            url,
            headers=supabase_headers(prefer="return=representation"),
            params=params,
            json={"pin": new_pin, "is_first_login": False},
        )
        if resp.status_code not in (200, 204):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gagal memperbarui PIN: {resp.text}",
            )

    return {"ok": True, "message": "PIN pribadi Anda berhasil diperbarui."}


@app.get("/api/users", response_model=List[UserPublicResponse])
async def list_users():
    """
    Mengambil daftar akun terdaftar dari tabel public.users di Supabase.
    """
    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {"select": "*", "order": "id.asc"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=supabase_headers(), params=params)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gagal mengambil daftar akun: {resp.text}",
            )
        rows = resp.json()
        return [to_public_user(r) for r in rows]


@app.post("/api/users", response_model=UserPublicResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    req: CreateUserRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Hanya SUPER_ADMIN_RW yang dapat mendaftarkan akun Warga / Admin RT baru.
    Akun baru otomatis memiliki is_first_login = True dan pin = None.
    """
    if current_user["role"] != "SUPER_ADMIN_RW":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak: Hanya Super Admin RW yang dapat menambahkan akun baru.",
        )

    existing = await fetch_user_by_username(req.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username / Nomor Rumah '{req.username.strip()}' sudah terdaftar.",
        )

    new_row = {
        "username": req.username.strip().upper(),
        "password": req.password.strip(),
        "pin": None,
        "is_first_login": True,
        "nama_lengkap": req.nama_lengkap.strip(),
        "role": req.role,
        "rt": req.rt,
        "no_hp": (req.no_hp or "-").strip(),
        "saldo_rupiah": 0,
        "total_liter": 0.0,
        "active": True,
    }
    url = f"{SUPABASE_URL}/rest/v1/users"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            url,
            headers=supabase_headers(prefer="return=representation"),
            json=new_row,
        )
        if resp.status_code not in (200, 201):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gagal membuat akun di Supabase: {resp.text}",
            )
        created = resp.json()[0]
        return to_public_user(created)

