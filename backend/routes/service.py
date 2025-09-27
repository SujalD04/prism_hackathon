from fastapi import APIRouter, HTTPException, Depends, Header
from app.db.mongodb import services_col
from app.core.security import decode_access_token
from datetime import datetime

router = APIRouter()

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")
    token = authorization.split(" ")[1] if " " in authorization else authorization
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@router.post("/book", summary="Book a service request")
def book_service(device_id: str, issue: str, scheduled_at: str = None, user=Depends(get_current_user)):
    doc = {
        "device_id": device_id,
        "issue": issue,
        "status": "scheduled" if scheduled_at else "pending",
        "scheduled_at": scheduled_at,
        "requested_by": user.get("uid"),
        "created_at": datetime.utcnow()
    }
    res = services_col.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return {"msg": "service booked", "service_request": doc}

@router.get("/list/{device_id}")
def list_requests(device_id: str, user=Depends(get_current_user)):
    cursor = services_col.find({"device_id": device_id})
    items = [ {k:v for k,v in doc.items() if k != "_id"} for doc in cursor ]
    return items
