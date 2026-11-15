import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dcydwhlrpgoquvklbtbr.supabase.co").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_BbqOiax3pravZEMWfE-v7A_TYClluqi")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "minyaku-jelantah-berkah-secret-key-2026")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))
SETUP_TOKEN_EXPIRE_MINUTES = int(os.getenv("SETUP_TOKEN_EXPIRE_MINUTES", "15"))

