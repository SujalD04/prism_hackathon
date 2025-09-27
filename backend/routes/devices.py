from fastapi import APIRouter, Depends, HTTPException, Header
from app.db.schemas.device_schema import DeviceSchema
from app.db.mongodb import devices_col
from app.core.security import decode_access_token

router = APIRouter()

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.split(" ")[1] if " " in authorization else authorization
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@router.post("/", summary="Register a device")
def add_device(device: DeviceSchema, user=Depends(get_current_user)):
    doc = device.dict()
    # associate owner_id if missing
    if not doc.get("owner_id"):
        doc["owner_id"] = user.get("uid")
    # upsert by device_id
    devices_col.update_one({"device_id": doc["device_id"]}, {"$set": doc}, upsert=True)
    return {"msg": "device registered", "device_id": doc["device_id"]}

@router.get("/{device_id}", summary="Get device details")
def get_device(device_id: str, user=Depends(get_current_user)):
    doc = devices_col.find_one({"device_id": device_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Device not found")
    # optionally filter by owner in production
    return doc
