# server/ml/simulation_engine.py
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)

import sys
import time
import json
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from sklearn.ensemble import IsolationForest
import warnings
import random

warnings.filterwarnings("ignore", category=UserWarning)

# --- Helper for printing debug logs ---
def log_debug(message):
    """Prints a message to the standard error stream for debugging."""
    print(f"[DEBUG] {message}", file=sys.stderr, flush=True)

# --- CONFIGURATION ---
CLASSIFICATION_FILES = {
    "smartphone": {"dataset": "ml/classification/dataset/smartphone_dataset.json", "scaler": "ml/classification/scaler/smartphone_scaler.joblib", "features": "ml/classification/feature/smartphone_features.joblib", "model": "ml/classification/h5/smartphone_classification.h5"},
    "smartwatch": {"dataset": "ml/classification/dataset/smartwatch_dataset.json", "scaler": "ml/classification/scaler/smartwatch_scaler.joblib", "features": "ml/classification/feature/smartwatch_features.joblib", "model": "ml/classification/h5/smartwatch_classification.h5"},
    "smartfridge": {"dataset": "ml/classification/dataset/smartfridge_dataset.json", "scaler": "ml/classification/scaler/smartfridge_scaler.joblib", "features": "ml/classification/feature/smartfridge_features.joblib", "model": "ml/classification/h5/smartfridge_classification.h5"}
}
CLASSIFICATION_SEQUENCE_LENGTH = 10

PREDICTIVE_FILES = {
    "smartphone": {"dataset": "ml/prediction/dataset/smartphone_unified_dataset_v2.csv", "scaler": "ml/prediction/scaler/smartphone_multi_task_scaler.joblib", "screener_model": "ml/prediction/models/smartphone/prediction_model_lgbm_final.joblib", "why_model": "ml/prediction/models/smartphone/diagnostician_why_model.joblib", "when_model": "ml/prediction/models/smartphone/diagnostician_when_model.joblib"},
    # --- THIS SECTION IS THE FIX ---
    "smartwatch": {
        "dataset": "ml/prediction/dataset/smartwatch_unified_dataset.csv", 
        "scaler": "ml/prediction/scaler/smartwatch_multi_task_scaler.joblib", 
        "screener_model": "ml/prediction/models/smartwatch/prediction_model_lgbm_if.joblib", 
        # Corrected paths: removed the extra "smartwatch_" prefix
        "why_model": "ml/prediction/models/smartwatch/diagnostician_why_model.joblib", 
        "when_model": "ml/prediction/models/smartwatch/diagnostician_when_model.joblib"
    },
    "smartfridge": {"dataset": "ml/prediction/dataset/refrigerator_unified_dataset.csv", "scaler": "ml/prediction/scaler/refrigerator_multi_task_scaler.joblib", "screener_model": "ml/prediction/models/smartfridge/refrigerator_screener_model.joblib", "why_model": "ml/prediction/models/smartfridge/refrigerator_diagnostician_why.joblib", "when_model": "ml/prediction/models/smartfridge/refrigerator_diagnostician_when.joblib"}
}
PREDICTIVE_FEATURE_CONFIG = {
    "smartphone": ['battery_level', 'cpu_usage_percent', 'memory_usage_percent', 'storage_usage_percent', 'app_crashes', 'network_signal_strength_dbm', 'screen_on_time_minutes', 'fast_charging_active', 'speaker_volume_percent', 'ambient_temp_c'],
    "smartwatch": ['battery_level', 'heart_rate_bpm', 'steps_per_hour', 'gps_active', 'screen_on_time_minutes', 'ambient_temp_c', 'water_pressure_atm', 'fall_detection_events'],
    "smartfridge": ['temperature_current_c', 'compressor_on', 'door_open', 'defrost_cycle_active', 'ambient_temp_c', 'filter_life_percent']
}
PREDICTIVE_SEQUENCE_LENGTHS = {"smartphone": 56, "smartwatch": 168, "smartfridge": 336}
FAILURE_MAPS = {
    "smartphone": {1: "Battery Failure", 2: "CPU Overheating", 3: "Memory Failure"},
    "smartwatch": {1: "Battery Failure", 2: "Heart Rate Sensor Failure", 3: "Water Seal Failure"},
    "smartfridge": {1: "Compressor Failure", 2: "Thermostat Failure", 3: "Seal Failure"}
}

def get_status_info(prob):
    if prob < 0.3: return "Normal", "normal"
    if prob < 0.7: return "Warning", "warning"
    return "Critical", "critical"

def run_simulation(device):
    log_debug(f"Simulation script started for device: {device}")
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        class_conf = CLASSIFICATION_FILES[device]
        pred_conf = PREDICTIVE_FILES[device]
        failure_map = FAILURE_MAPS[device]
        
        log_debug("Loading classification artifacts...")
        df_class_raw = pd.read_json(os.path.join(base_dir, '..', class_conf["dataset"]))
        scaler_class = joblib.load(os.path.join(base_dir, '..', class_conf["scaler"]))
        features_class_list = joblib.load(os.path.join(base_dir, '..', class_conf["features"]))
        model_class = load_model(os.path.join(base_dir, '..', class_conf["model"]))
        log_debug("Classification artifacts loaded.")

        log_debug("Loading predictive artifacts...")
        df_pred_raw = pd.read_csv(os.path.join(base_dir, '..', pred_conf["dataset"]))
        features_pred_list = PREDICTIVE_FEATURE_CONFIG[device]
        scaler_pred = joblib.load(os.path.join(base_dir, '..', pred_conf["scaler"]))
        screener_model = joblib.load(os.path.join(base_dir, '..', pred_conf["screener_model"]))
        why_model = joblib.load(os.path.join(base_dir, '..', pred_conf["why_model"]))
        when_model = joblib.load(os.path.join(base_dir, '..', pred_conf["when_model"]))
        log_debug("Predictive artifacts loaded.")
        
        log_debug("Preparing full datasets...")
        df_metrics_full = pd.json_normalize(df_class_raw["metrics"])
        df_class_full_prepared = pd.concat([df_class_raw.drop(columns=["metrics", "label", "modelName", "recordId", "deviceId", "deviceType", "timestamp"]), df_metrics_full], axis=1)
        df_class_features = df_class_full_prepared[features_class_list]
        df_pred_features = df_pred_raw[features_pred_list]

        log_debug("Searching for a failure event...")
        device_id_col = 'device_id' if 'device_id' in df_pred_raw.columns else 'watch_id'
        failure_indices = df_pred_raw.index[df_pred_raw['failure_type'] != 0].tolist()
        if not failure_indices:
            start_index = 0
        else:
            failure_point = random.choice(failure_indices)
            start_index = max(0, failure_point - 300)
            log_debug(f"Failure found at index {failure_point}. Starting story at index {start_index}.")

    except Exception as e:
        log_debug(f"CRITICAL ERROR during setup: {e}")
        print(json.dumps({"error": f"Failed during setup: {e}"}), flush=True)
        return

    buffer_class, buffer_pred = [], []
    seq_len_class, seq_len_pred = CLASSIFICATION_SEQUENCE_LENGTH, PREDICTIVE_SEQUENCE_LENGTHS[device]

    log_debug("Starting main simulation loop...")
    while True:
        for i in range(start_index, len(df_pred_features)):
            class_index = i % len(df_class_features)
            
            row_class = df_class_features.iloc[class_index]
            row_pred = df_pred_features.iloc[i]

            buffer_class.append(row_class.values)
            buffer_pred.append(row_pred.values)

            if len(buffer_class) > seq_len_class: buffer_class.pop(0)
            if len(buffer_pred) > seq_len_pred: buffer_pred.pop(0)

            if len(buffer_class) == seq_len_class and len(buffer_pred) == seq_len_pred:
                scaled_class = scaler_class.transform(buffer_class)
                input_class = np.array(scaled_class).reshape(1, seq_len_class, -1)
                class_prob = model_class.predict(input_class, verbose=0)[0][0]
                current_health_status, current_health_style = get_status_info(class_prob)
                
                scaled_pred = scaler_pred.transform(buffer_pred)
                flattened_sequence = scaled_pred.reshape(1, -1)
                
                is_anomaly, predictive_prob = False, 0.0
                
                if isinstance(screener_model, IsolationForest):
                    anomaly_score = screener_model.decision_function(flattened_sequence)[0]
                    is_anomaly = anomaly_score < 0.0
                    predictive_prob = 1 / (1 + max(0, anomaly_score))
                elif hasattr(screener_model, 'predict_proba'):
                    predictive_prob = screener_model.predict_proba(flattened_sequence)[0][1]
                    is_anomaly = predictive_prob > 0.5
                
                if current_health_style == 'critical':
                    predictive_prob = max(predictive_prob, 0.85)
                    is_anomaly = True

                root_cause, first_anomaly_time = "None", None
                if is_anomaly:
                    predicted_code = why_model.predict(flattened_sequence)[0]
                    root_cause = failure_map.get(int(predicted_code), "Unknown Cause")
                    time_hours = when_model.predict(flattened_sequence)[0]
                    first_anomaly_time = f"+{int(abs(time_hours) * 60)} min"

                data_packet = {
                    "timestamp": pd.Timestamp.now().strftime('%H:%M:%S'),
                    "current_health_status": current_health_status,
                    "current_health_style": current_health_style,
                    "predictive_probability": float(predictive_prob),
                    "is_anomaly_predicted": bool(is_anomaly),
                    "root_cause": str(root_cause),
                    "first_anomaly_time": first_anomaly_time
                }
                
                print(json.dumps(data_packet), flush=True)
                time.sleep(1.5)
        
        start_index = 0
                
if __name__ == "__main__":
    device_arg = sys.argv[1] if len(sys.argv) > 1 else "smartphone"
    run_simulation(device_arg)

