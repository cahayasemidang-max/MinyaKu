from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from core.config import ACCESS_TOKEN_EXPIRE_MINUTES, SETUP_TOKEN_EXPIRE_MINUTES
from core.security import create_jwt_token, decode_jwt_token, get_current_user, security
from schemas.user_schema import (
    ChangePinRequest,
    CheckUsernameResponse,
    LoginRequest,
    LoginResponse,
    SetupPinRequest,
    UserPublicResponse,
    to_public_user,
)
from services.user_service import (
    fetch_user_by_id,
    fetch_user_by_username,
    update_user_pin,
)

router = APIRouter(prefix="/api/auth", tags=["Autentikasi & PIN"])


@router.get("/check-username/{username}", response_model=CheckUsernameResponse)
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


@router.post("/login", response_model=LoginResponse)
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
            message=f"Halo {user['nama_lengkap']}! Karena ini login pertama Anda, silakan buat PIN 6 digit untuk login selanjutnya.",
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


@router.post("/setup-pin", response_model=LoginResponse)
async def setup_first_pin(
    req: SetupPinRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Endpoint khusus Warga & Admin RT setelah berhasil verifikasi Nama Depan KK
    pada login pertama kali. Menyimpan PIN 6 digit baru dan mengubah is_first_login = False.
    """
    payload = decode_jwt_token(credentials.credentials)
    if payload.get("scope") != "setup_pin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token tidak valid untuk pembuatan PIN perdana.",
        )

    new_pin = req.new_pin.strip()
    confirm_pin = req.confirm_pin.strip()
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

    updated_user = await update_user_pin(user_id, new_pin, user)

    access_token = create_jwt_token(
        user=updated_user,
        scope="access",
        expires_minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    return LoginResponse(
        ok=True,
        requires_pin_setup=False,
        message="PIN 6 digit pribadi berhasil disimpan! Selanjutnya Anda cukup login menggunakan PIN ini.",
        access_token=access_token,
        user=to_public_user(updated_user),
    )


@router.get("/me", response_model=UserPublicResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return to_public_user(current_user)


@router.put("/change-pin")
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

    await update_user_pin(current_user["id"], req.new_pin.strip(), current_user)
    return {"ok": True, "message": "PIN pribadi Anda berhasil diperbarui."}

