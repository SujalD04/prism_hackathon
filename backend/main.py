from fastapi import FastAPI
from app.routes import devices, logs, predictions, service, auth
from app.db.mongodb import connect_db, close_db

app = FastAPI(title="Samsung Care+ AI Backend")

# Startup & Shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db()

# Routers
app.include_router(devices.router, prefix="/devices", tags=["Devices"])
app.include_router(logs.router, prefix="/logs", tags=["Logs"])
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
app.include_router(service.router, prefix="/service", tags=["Service"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"message": "Samsung Care+ AI Backend is running 🚀"}
