from fastapi import APIRouter, HTTPException, Depends, Header
from app.db.schemas.log_schema import LogSchema
from app.db.mongodb import logs_col, devices_col, predictions_col
from app.core.security import decode_access_token
from datetime import datetime
from app.agents.health_monitor import analyze_log
from app.agents.predictive_maintenance import predict_failure
from app.agents.service_coordination import prepare_service_request
from app.agents.system_optimization import propose_fix
from bson.objectid import ObjectId

router = APIRouter()

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return None
    token = authorization.split(" ")[1] if " " in authorization else authorization
    payload = decode_access_token(token)
    return payload

@router.post("/{device_id}", summary="Ingest health log (device posts logs)")
def ingest_log(device_id: str, payload: LogSchema, user=Depends(get_current_user)):
    # ensure device exists
    device = devices_col.find_one({"device_id": device_id})
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")

    log_doc = {
        "device_id": device_id,
        "timestamp": datetime.utcnow(),
        "metrics": payload.metrics,
        "metadata": payload.metadata
    }
    res = logs_col.insert_one(log_doc)
    log_id = str(res.inserted_id)

    # Run health monitor agent
    health_report = analyze_log(payload.metrics)

    # Run predictive maintenance agent
    prediction = predict_failure(payload.metrics)

    # Store prediction
    pred_doc = {
        "device_id": device_id,
        "timestamp": datetime.utcnow(),
        "prediction": prediction.get("prediction"),
        "severity": prediction.get("severity"),
        "details": prediction,
    }
    predictions_col.insert_one(pred_doc)

    # If severe, create service request (simple stub)
    service_request = None
    if prediction.get("severity") == "High":
        sr = prepare_service_request(device_id, prediction.get("prediction"))
        sr["log_id"] = log_id
        # in production insert into service collection; here we return it in response
        service_request = sr

    # propose auto-fixes
    fixes = propose_fix(payload.metrics)

    return {
        "msg": "log_ingested",
        "log_id": log_id,
        "health_report": health_report,
        "prediction": prediction,
        "service_request": service_request,
        "fixes": fixes
    }
