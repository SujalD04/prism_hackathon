from fastapi import APIRouter, HTTPException, Depends, Header
from app.db.mongodb import predictions_col
from app.core.security import decode_access_token

router = APIRouter()

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return None
    token = authorization.split(" ")[1] if " " in authorization else authorization
    payload = decode_access_token(token)
    return payload

@router.get("/latest/{device_id}", summary="Get latest prediction for device")
def get_latest(device_id: str, user=Depends(get_current_user)):
    doc = predictions_col.find_one({"device_id": device_id}, sort=[("timestamp", -1)], projection={"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="No predictions found")
    return doc

@router.get("/history/{device_id}", summary="Get prediction history")
def history(device_id: str, limit: int = 20):
    cursor = predictions_col.find({"device_id": device_id}, sort=[("timestamp", -1)], limit=limit)
    return [ {k:v for k,v in doc.items() if k != "_id"} for doc in cursor ]
