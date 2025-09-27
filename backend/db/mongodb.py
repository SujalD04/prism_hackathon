from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    print("✅ Connected to MongoDB")

async def close_db():
    global client
    if client:
        client.close()
        print("❌ MongoDB connection closed")
