from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from core.security import get_current_user
from schemas.user_schema import CreateUserRequest, UserPublicResponse, to_public_user
from services.user_service import (
    fetch_all_users,
    fetch_user_by_username,
    insert_new_user,
)

router = APIRouter(prefix="/api/users", tags=["Manajemen Akun Pengguna"])


@router.get("", response_model=List[UserPublicResponse])
async def list_users():
    """
    Mengambil daftar akun terdaftar dari tabel public.users di Supabase.
    """
    rows = await fetch_all_users()
    return [to_public_user(r) for r in rows]


@router.post("", response_model=UserPublicResponse, status_code=status.HTTP_201_CREATED)
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
    created = await insert_new_user(new_row)
    return to_public_user(created)

