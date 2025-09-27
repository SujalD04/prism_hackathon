from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.mongodb import users_col
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter()

class RegisterReq(BaseModel):
    name: str
    email: str
    password: str

class LoginReq(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(req: RegisterReq):
    if users_col.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {"name": req.name, "email": req.email, "password_hash": hash_password(req.password)}
    res = users_col.insert_one(user_doc)
    user_doc["_id"] = str(res.inserted_id)
    return {"msg": "registered", "user": {"email": req.email}}

@router.post("/login")
def login(req: LoginReq):
    user = users_col.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"email": user["email"], "uid": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}
