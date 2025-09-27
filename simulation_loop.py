import time
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# ==============================================================================
# Configuration
# ==============================================================================
SEQUENCE_LENGTH = 10
DELAY_SECONDS = 2
FUTURE_STEPS = 5
# NEW: Threshold to detect a future problem. If the predicted metric goes above this, flag it.
PREDICTIVE_ANOMALY_THRESHOLD = 14.0 

# ==============================================================================
# Device -> File Paths
# ==============================================================================
CLASSIFICATION_FILES = {
    "smartphone": {"dataset": "classification/dataset/smartphone_dataset.json", "scaler": "classification/scaler/smartphone_scaler.joblib", "features": "classification/feature/smartphone_features.joblib", "model": "classification/h5/smartphone_classification.h5"},
    "smartwatch": {"dataset": "classification/dataset/smartwatch_dataset.json", "scaler": "classification/scaler/smartwatch_scaler.joblib", "features": "classification/feature/smartwatch_features.joblib", "model": "classification/h5/smartwatch_classification.h5"},
    "smartfridge": {"dataset": "classification/dataset/smartfridge_dataset.json", "scaler": "classification/scaler/smartfridge_scaler.joblib", "features": "classification/feature/smartfridge_features.joblib", "model": "classification/h5/smartfridge_classification.h5"}
}
PREDICTIVE_FILES = {
    "smartphone": {"dataset": "predictive/dataset/smartphone_dataset.csv", "scaler": "predictive/scaler/smartphone_scaler.joblib", "model": "predictive/h5/smartphone_predictive.h5"},
    "smartwatch": {"dataset": "predictive/dataset/smartwatch_dataset.csv", "scaler": "predictive/scaler/smartwatch_scaler.joblib", "model": "predictive/h5/smartwatch_predictive.h5"},
    "smartfridge": {"dataset": "predictive/dataset/smartfridge_dataset.csv", "scaler": "predictive/scaler/smartfridge_scaler.joblib", "model": "predictive/h5/smartfridge_predictive.h5"}
}

# ==============================================================================
# Helper Functions & Model Loading
# ==============================================================================
def health_status(pred_prob):
    if pred_prob < 0.3: return "Normal 🟢"
    elif pred_prob < 0.7: return "Warning 🟠"
    else: return "Critical 🔴"

# (Loading functions remain the same)
def load_classification_artifacts(device):
    files = CLASSIFICATION_FILES[device]
    df = pd.read_json(files["dataset"])
    df_metrics = pd.json_normalize(df["metrics"])
    df_labels = pd.json_normalize(df["label"])
    df = pd.concat([df.drop(columns=["metrics", "label", "recordId", "modelName"]), df_metrics, df_labels], axis=1)
    scaler = joblib.load(files["scaler"])
    features = joblib.load(files["features"])
    model = load_model(files["model"])
    return df, scaler, features, model

def load_predictive_artifacts(device):
    files = PREDICTIVE_FILES[device]
    df = pd.read_csv(files["dataset"])
    scaler = joblib.load(files["scaler"])
    model = load_model(files["model"])
    df_numeric = df.select_dtypes(include=[np.number])
    df_numeric = df_numeric.iloc[:, :scaler.n_features_in_]
    return df_numeric, scaler, model

# ==============================================================================
# Interactive Simulation Loop
# ==============================================================================
def run_interactive_simulation(device):
    print(f"\n🤖 Starting Interactive AI System for {device}...")
    
    print("Loading models and datasets...")
    df_class, scaler_class, features_class, model_class = load_classification_artifacts(device)
    df_pred, scaler_pred, model_pred = load_predictive_artifacts(device)
    df_features_class = df_class[features_class]
    
    buffer_class = []
    buffer_pred = df_pred.tail(SEQUENCE_LENGTH).values.tolist()

    print("\n✅ System Online. Starting real-time monitoring...\n" + "="*60)
    
    for idx, row_class in df_features_class.iterrows():
        x_scaled = scaler_class.transform([row_class.values])[0]
        buffer_class.append(x_scaled)
        
        if len(buffer_class) > SEQUENCE_LENGTH: buffer_class.pop(0)
            
        if len(buffer_class) == SEQUENCE_LENGTH:
            # --- [STEP 1] CLASSIFICATION MODEL GIVES CURRENT STATUS ---
            x_input_class = np.array(buffer_class).reshape(1, SEQUENCE_LENGTH, len(features_class))
            pred_prob = model_class.predict(x_input_class, verbose=0)[0][0]
            current_status = health_status(pred_prob)
            timestamp = df_class.loc[idx, "timestamp"]
            
            print(f"TIMESTAMP: {timestamp}")
            print(f"[1] Classification Check: Current health is '{current_status}'")

            # --- [STEP 2] PREDICTIVE MODEL SCANS THE FUTURE ---
            print(f"[2] Predictive Scan: Looking for future anomalies...")
            
            temp_buffer_pred = buffer_pred.copy()
            n_features_pred = scaler_pred.n_features_in_
            future_predictions = []
            is_anomaly_predicted = False

            for step in range(FUTURE_STEPS):
                seq_raw = np.array(temp_buffer_pred[-SEQUENCE_LENGTH:])
                seq_scaled = scaler_pred.transform(seq_raw)
                x_input_pred = seq_scaled.reshape(1, SEQUENCE_LENGTH, n_features_pred)
                pred_scaled = model_pred.predict(x_input_pred, verbose=0)
                
                dummy_row = np.zeros((1, n_features_pred))
                dummy_row[0, 0] = pred_scaled[0, 0]
                pred_unscaled = scaler_pred.inverse_transform(dummy_row)
                metric_pred = pred_unscaled[0, 0]
                future_predictions.append(metric_pred)

                # Check if the prediction crosses our threshold
                if metric_pred > PREDICTIVE_ANOMALY_THRESHOLD:
                    is_anomaly_predicted = True
                    print(f"     - In {(step + 1) * 10} mins: Metric={metric_pred:.2f}  <-- 🚨 ANOMALY DETECTED!")
                else:
                    print(f"     - In {(step + 1) * 10} mins: Metric={metric_pred:.2f}")

                next_forecast_input = seq_raw[-1, :].tolist()
                next_forecast_input[0] = metric_pred
                temp_buffer_pred.append(next_forecast_input)
                if len(temp_buffer_pred) > SEQUENCE_LENGTH: temp_buffer_pred.pop(0)

            # --- [STEP 3] SYSTEM MAKES A FINAL VERDICT ---
            final_status = current_status
            if is_anomaly_predicted and current_status == "Normal 🟢":
                final_status = "Warning 🟠 (due to future anomaly)"
                print(f"[3] FINAL VERDICT: Status UPGRADED by predictive model.")
            else:
                print(f"[3] FINAL VERDICT: Status confirmed by predictive model.")
            
            print(f"--> System Health Status: {final_status}")
            
            # Update main predictive buffer with new, actual data
            new_pred_row = df_pred.iloc[idx].values.tolist()
            buffer_pred.append(new_pred_row)
            if len(buffer_pred) > SEQUENCE_LENGTH: buffer_pred.pop(0)

            print("="*60)
            time.sleep(DELAY_SECONDS)

    print("\n✅ Simulation complete. Reached end of dataset.")

# ==============================================================================
# Entry Point
# ==============================================================================
if __name__ == "__main__":
    device = input("Select device (smartphone/smartwatch/smartfridge): ").strip().lower()
    if device not in CLASSIFICATION_FILES:
        print("Invalid device!")
    else:
        run_interactive_simulation(device)