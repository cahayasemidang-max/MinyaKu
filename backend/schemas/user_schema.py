from typing import Optional
from pydantic import BaseModel, Field


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
    credential: str = Field(..., description="Nama depan KK (saat login pertama) atau PIN 6 digit")


class LoginResponse(BaseModel):
    ok: bool
    requires_pin_setup: bool
    message: str
    access_token: Optional[str] = None
    setup_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserPublicResponse


class SetupPinRequest(BaseModel):
    new_pin: str = Field(..., pattern=r"^\d{6}$", description="PIN 6 digit angka")
    confirm_pin: str = Field(..., pattern=r"^\d{6}$", description="Konfirmasi PIN 6 digit angka")


class ChangePinRequest(BaseModel):
    current_pin: str
    new_pin: str = Field(..., pattern=r"^\d{6}$", description="PIN baru 6 digit angka")


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

