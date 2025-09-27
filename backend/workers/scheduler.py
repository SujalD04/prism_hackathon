import threading
import time
from app.db.mongodb import devices_col, logs_col, predictions_col
from app.agents.predictive_maintenance import predict_failure

def periodic_check(interval_seconds: int = 3600):
    def job():
        try:
            # Example: run lightweight predictive check on latest log of each device
            devices = devices_col.find({})
            for d in devices:
                device_id = d.get("device_id")
                last_log = logs_col.find_one({"device_id": device_id}, sort=[("timestamp", -1)])
                if last_log:
                    res = predict_failure(last_log.get("metrics", {}))
                    predictions_col.insert_one({
                        "device_id": device_id,
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                        "prediction": res.get("prediction"),
                        "severity": res.get("severity"),
                        "details": res
                    })
        finally:
            # reschedule
            threading.Timer(interval_seconds, job).start()
    threading.Timer(interval_seconds, job).start()

# To start scheduler: call periodic_check() from app startup if desired.
