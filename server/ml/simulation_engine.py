# server/ml/simulation_engine.py
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' # ADD THIS LINE
# This must be set BEFORE importing TensorFlow

import sys
import json
import time
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# --- CONFIGURATION (Paths are relative to the /server root) ---
CLASSIFICATION_FILES = {
    "smartphone": {"dataset": "ml/classification/dataset/smartphone_dataset.json", "scaler": "ml/classification/scaler/smartphone_scaler.joblib", "features": "ml/classification/feature/smartphone_features.joblib", "model": "ml/classification/h5/smartphone_classification.h5"},
    "smartwatch": {"dataset": "ml/classification/dataset/smartwatch_dataset.json", "scaler": "ml/classification/scaler/smartwatch_scaler.joblib", "features": "ml/classification/feature/smartwatch_features.joblib", "model": "ml/classification/h5/smartwatch_classification.h5"},
    "smartfridge": {"dataset": "ml/classification/dataset/smartfridge_dataset.json", "scaler": "ml/classification/scaler/smartfridge_scaler.joblib", "features": "ml/classification/feature/smartfridge_features.joblib", "model": "ml/classification/h5/smartfridge_classification.h5"}
}
PREDICTIVE_FILES = {
    "smartphone": {"dataset": "ml/predictive/dataset/smartphone_dataset.csv", "scaler": "ml/predictive/scaler/smartphone_scaler.joblib", "model": "ml/predictive/h5/smartphone_predictive.h5"},
    "smartwatch": {"dataset": "ml/predictive/dataset/smartwatch_dataset.csv", "scaler": "ml/predictive/scaler/smartwatch_scaler.joblib", "model": "ml/predictive/h5/smartwatch_predictive.h5"},
    "smartfridge": {"dataset": "ml/predictive/dataset/smartfridge_dataset.csv", "scaler": "ml/predictive/scaler/smartfridge_scaler.joblib", "model": "ml/predictive/h5/smartfridge_predictive.h5"}
}
SEQUENCE_LENGTH = 10
FUTURE_STEPS = 5
PREDICTIVE_ANOMALY_THRESHOLD = 14.0

# --- HELPER & LOADING FUNCTIONS (Unchanged) ---
# ... (all your existing functions like get_status_info and load_artifacts are correct) ...
def get_status_info(pred_prob):
    if pred_prob < 0.3: return "Normal", "normal"
    elif pred_prob < 0.7: return "Warning", "warning"
    else: return "Critical", "critical"

def load_artifacts(device):
    cls_files = CLASSIFICATION_FILES[device]; df_class = pd.read_json(cls_files["dataset"])
    df_metrics = pd.json_normalize(df_class["metrics"]); df_labels = pd.json_normalize(df_class["label"])
    df_class = pd.concat([df_class.drop(columns=["metrics", "label", "recordId", "modelName"]), df_metrics, df_labels], axis=1)
    scaler_class = joblib.load(cls_files["scaler"]); features_class = joblib.load(cls_files["features"]); model_class = load_model(cls_files["model"])
    pred_files = PREDICTIVE_FILES[device]; df_pred_raw = pd.read_csv(pred_files["dataset"])
    scaler_pred = joblib.load(pred_files["scaler"]); model_pred = load_model(pred_files["model"])
    df_pred_numeric = df_pred_raw.select_dtypes(include=[np.number])
    df_pred = df_pred_numeric.iloc[:, :scaler_pred.n_features_in_]
    return df_class, scaler_class, features_class, model_class, df_pred, scaler_pred, model_pred


# --- MAIN SIMULATION FUNCTION (Unchanged) ---
def run_simulation(device):
    # ... (the rest of your simulation logic is correct) ...
    df_class, scaler_class, features_class, model_class, df_pred, scaler_pred, model_pred = load_artifacts(device)
    df_features_sim = df_class[features_class]
    buffer_class = []; buffer_pred = df_pred.tail(SEQUENCE_LENGTH).values.tolist()

    while True:
        for idx, row in df_features_sim.iterrows():
            x_scaled = scaler_class.transform([row.values])[0]
            buffer_class.append(x_scaled)
            if len(buffer_class) > SEQUENCE_LENGTH: buffer_class.pop(0)

            if len(buffer_class) == SEQUENCE_LENGTH:
                # [STEP 1] CLASSIFICATION
                x_input_class = np.array(buffer_class).reshape(1, SEQUENCE_LENGTH, len(features_class))
                pred_prob = model_class.predict(x_input_class, verbose=0)[0][0]
                current_status_text, current_status_style = get_status_info(pred_prob)
                
                # [STEP 2] PREDICTION
                temp_buffer_pred = buffer_pred.copy(); n_features_pred = scaler_pred.n_features_in_
                future_predictions = []; is_anomaly_predicted = False; first_anomaly_time = None
                for step in range(FUTURE_STEPS):
                    seq_raw = np.array(temp_buffer_pred[-SEQUENCE_LENGTH:])
                    seq_scaled = scaler_pred.transform(seq_raw)
                    x_input_pred = seq_scaled.reshape(1, SEQUENCE_LENGTH, n_features_pred)
                    pred_scaled = model_pred.predict(x_input_pred, verbose=0)
                    dummy_row = np.zeros((1, n_features_pred)); dummy_row[0, 0] = pred_scaled[0, 0]
                    pred_unscaled = scaler_pred.inverse_transform(dummy_row)
                    metric_pred = pred_unscaled[0, 0]; time_str = f"+{(step+1)*10} min"
                    future_predictions.append({"Time": time_str, "Predicted Metric": f"{metric_pred:.2f}"})
                    if metric_pred > PREDICTIVE_ANOMALY_THRESHOLD:
                        is_anomaly_predicted = True
                        if first_anomaly_time is None: first_anomaly_time = time_str
                    next_forecast_input = seq_raw[-1, :].tolist(); next_forecast_input[0] = metric_pred
                    temp_buffer_pred.append(next_forecast_input); temp_buffer_pred.pop(0)

                # [STEP 3] FINAL VERDICT
                final_status_text, final_status_style = current_status_text, current_status_style
                card_class_extra = ""
                verdict_text = "Status confirmed by predictive scan."
                if is_anomaly_predicted and current_status_text == "Normal":
                    final_status_text = "Warning"; final_status_style = "warning"; card_class_extra = "metric-card-upgraded"
                    verdict_text = f"🚨 **Status Upgraded!** Anomaly predicted in **{first_anomaly_time}**."

                # --- Package results into a single JSON object ---
                data_packet = {
                    "timestamp": pd.Timestamp.now().strftime('%H:%M:%S'),
                    "probability": float(pred_prob),
                    "current_status_text": current_status_text,
                    "final_status_text": final_status_text,
                    "final_status_style": final_status_style,
                    "card_class_extra": card_class_extra,
                    "verdict_text": verdict_text,
                    "is_anomaly_predicted": is_anomaly_predicted,
                    "first_anomaly_time": first_anomaly_time,
                    "forecast": future_predictions
                }
                
                print(json.dumps(data_packet))
                sys.stdout.flush()
                
                new_pred_row = df_pred.iloc[idx].values.tolist(); buffer_pred.append(new_pred_row); buffer_pred.pop(0)
                time.sleep(2)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        device_arg = sys.argv[1]
        if device_arg in CLASSIFICATION_FILES:
            run_simulation(device_arg)
        else:
            print(json.dumps({"error": f"Invalid device: {device_arg}"}))
            sys.stdout.flush()
    else:
        print(json.dumps({"error": "No device specified."}))
        sys.stdout.flush()