from pydantic import BaseModel
from typing import Optional

class DeviceSchema(BaseModel):
    device_id: str
    device_type: str
    status: str
    user_id: Optional[str]
