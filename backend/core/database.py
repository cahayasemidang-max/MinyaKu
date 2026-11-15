import socket
from typing import Optional

import dns.resolver
import httpx
from fastapi import HTTPException, status

from core.config import SUPABASE_KEY

# Fallback DNS otomatis ke Cloudflare (1.1.1.1) & Google (8.8.8.8)
# jika DNS ISP lokal mengalami gangguan sementara ([Errno 11001] getaddrinfo failed)
_orig_getaddrinfo = socket.getaddrinfo


def _resilient_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    try:
        return _orig_getaddrinfo(host, port, family, type, proto, flags)
    except socket.gaierror:
        try:
            resolver = dns.resolver.Resolver(configure=False)
            resolver.nameservers = ["1.1.1.1", "8.8.8.8"]
            resolver.timeout = 3.0
            resolver.lifetime = 5.0
            answers = resolver.resolve(str(host), "A")
            ip = answers[0].to_text()
            return _orig_getaddrinfo(ip, port, socket.AF_INET, type, proto, flags)
        except Exception:
            raise


socket.getaddrinfo = _resilient_getaddrinfo


def supabase_headers(prefer: Optional[str] = None) -> dict:
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


async def supabase_request(
    method: str,
    url: str,
    *,
    headers: dict,
    params: Optional[dict] = None,
    json: Optional[dict] = None,
) -> httpx.Response:
    transport = httpx.AsyncHTTPTransport(retries=2)
    try:
        async with httpx.AsyncClient(timeout=15.0, transport=transport) as client:
            return await client.request(
                method,
                url,
                headers=headers,
                params=params,
                json=json,
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Koneksi ke server Supabase terputus atau gagal melakukan resolusi DNS: {exc}",
        )

