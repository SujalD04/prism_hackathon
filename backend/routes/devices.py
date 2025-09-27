from fastapi import APIRouter, Depends
from app.db.mongodb import db
from app.db.schemas.device_schema import DeviceSchema

router = APIRouter()

@router.post("/")
async def register_device(device: DeviceSchema):
    await db.devices.insert_one(device.dict())
    return {"message": "Device registered successfully"}

@router.get("/{device_id}")
async def get_device(device_id: str):
    device = await db.devices.find_one({"device_id": device_id})
    if not device:
        return {"error": "Device not found"}
    return device
