from typing import List, Optional
from fastapi import HTTPException, status

from core.config import SUPABASE_URL
from core.database import supabase_headers, supabase_request


async def fetch_user_by_username(username: str) -> Optional[dict]:
    clean = username.strip()
    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {
        "username": f"ilike.{clean}",
        "select": "*",
        "limit": "1",
    }
    resp = await supabase_request("GET", url, headers=supabase_headers(), params=params)
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
    resp = await supabase_request("GET", url, headers=supabase_headers(), params=params)
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal menghubungi database Supabase: {resp.text}",
        )
    rows = resp.json()
    return rows[0] if rows else None


async def fetch_all_users() -> List[dict]:
    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {"select": "*", "order": "id.asc"}
    resp = await supabase_request("GET", url, headers=supabase_headers(), params=params)
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal mengambil daftar akun: {resp.text}",
        )
    return resp.json()


async def update_user_pin(user_id: int, new_pin: str, fallback_user: dict) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/users"
    params = {"id": f"eq.{user_id}"}
    update_body = {
        "pin": new_pin,
        "is_first_login": False,
    }
    resp = await supabase_request(
        "PATCH",
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
    return updated_rows[0] if updated_rows else {**fallback_user, **update_body}


async def insert_new_user(new_row: dict) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/users"
    resp = await supabase_request(
        "POST",
        url,
        headers=supabase_headers(prefer="return=representation"),
        json=new_row,
    )
    if resp.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gagal membuat akun di Supabase: {resp.text}",
        )
    return resp.json()[0]

