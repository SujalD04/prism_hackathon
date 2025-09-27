import time
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# -------------------------
# Configuration
# -------------------------
SEQUENCE_LENGTH = 10
DELAY_SECONDS = 2  # simulate each datapoint every 2 seconds
FUTURE_STEPS = 10  # number of future predictions to show

# -------------------------
# Device -> Classification files
# -------------------------
CLASSIFICATION_FILES = {
    "smartphone": {
        "dataset": "classification/dataset/smartphone_dataset.json",
        "scaler": "classification/scaler/smartphone_scaler.joblib",
        "features": "classification/feature/smartphone_features.joblib",
        "model": "classification/h5/smartphone_classification.h5"
    },
    "smartwatch": {
        "dataset": "classification/dataset/smartwatch_dataset.json",
        "scaler": "classification/scaler/smartwatch_scaler.joblib",
        "features": "classification/feature/smartwatch_features.joblib",
        "model": "classification/h5/smartwatch_classification.h5"
    },
    "smartfridge": {
        "dataset": "classification/dataset/smartfridge_dataset.json",
        "scaler": "classification/scaler/smartfridge_scaler.joblib",
        "features": "classification/feature/smartfridge_features.joblib",
        "model": "classification/h5/smartfridge_classification.h5"
    }
}

# -------------------------
# Device -> Predictive files
# -------------------------
PREDICTIVE_FILES = {
    "smartphone": {
        "dataset": "predictive/dataset/smartphone_dataset.csv",
        "scaler": "predictive/scaler/smartphone_scaler.joblib",
        "model": "predictive/h5/smartphone_predictive.h5"
    },
    "smartwatch": {
        "dataset": "predictive/dataset/smartwatch_dataset.csv",
        "scaler": "predictive/scaler/smartwatch_scaler.joblib",
        "model": "predictive/h5/smartwatch_predictive.h5"
    },
    "smartfridge": {
        "dataset": "predictive/dataset/smartfridge_dataset.csv",
        "scaler": "predictive/scaler/smartfridge_scaler.joblib",
        "model": "predictive/h5/smartfridge_predictive.h5"
    }
}

# -------------------------
# Utility: Map prediction probability to health status
# -------------------------
def health_status(pred_prob):
    if pred_prob < 0.3:
        return "Normal 🟢"
    elif pred_prob < 0.7:
        return "Warning 🟠"
    else:
        return "Critical 🔴"

# -------------------------
# Load classification artifacts
# -------------------------
def load_classification_artifacts(device):
    files = CLASSIFICATION_FILES[device]
    df = pd.read_json(files["dataset"])
    
    # Flatten metrics and labels
    df_metrics = pd.json_normalize(df["metrics"])
    df_labels = pd.json_normalize(df["label"])
    df = pd.concat([df.drop(columns=["metrics", "label", "recordId", "modelName"]), df_metrics, df_labels], axis=1)
    
    scaler = joblib.load(files["scaler"])
    features = joblib.load(files["features"])
    model = load_model(files["model"])
    
    return df, scaler, features, model

# -------------------------
# Load predictive artifacts
# -------------------------
def load_predictive_artifacts(device):
    files = PREDICTIVE_FILES[device]
    df = pd.read_csv(files["dataset"])
    
    scaler = joblib.load(files["scaler"])
    model = load_model(files["model"])
    
    # Keep only numeric columns
    df_numeric = df.select_dtypes(include=[np.number])
    
    # Slice exactly the number of features scaler expects
    df_numeric = df_numeric.iloc[:, :scaler.n_features_in_]
    
    return df_numeric, scaler, model


# -------------------------
# Real-time simulation loop
# -------------------------
def run_simulation(device):
    print(f"\n🎮 Starting real-time simulation for {device}...")

    # Load classification pipeline
    df_class, scaler_class, features_class, model_class = load_classification_artifacts(device)
    df_features = df_class[features_class]

    # Limit to first 18 rows (~first 8-9 windows of SEQUENCE_LENGTH=10)
    MAX_ROWS = SEQUENCE_LENGTH + 8
    df_features = df_features.head(MAX_ROWS)
    df_class = df_class.head(MAX_ROWS)  # also slice timestamps

    sequence_buffer = []

    for idx, row in df_features.iterrows():
        # Transform features
        x_scaled = scaler_class.transform([row.values])[0]
        sequence_buffer.append(x_scaled)

        # Keep only last SEQUENCE_LENGTH rows
        if len(sequence_buffer) > SEQUENCE_LENGTH:
            sequence_buffer.pop(0)

        # Only predict if buffer is ready
        if len(sequence_buffer) == SEQUENCE_LENGTH:
            x_input = np.array(sequence_buffer).reshape(1, SEQUENCE_LENGTH, len(features_class))
            pred_prob = model_class.predict(x_input, verbose=0)[0][0]
            status = health_status(pred_prob)
            timestamp = df_class.loc[idx, "timestamp"]
            print(f"[{timestamp}] Current Health: {status} (prob={pred_prob:.2f})")

        time.sleep(DELAY_SECONDS)

    print("\n✅ Classification simulation complete for limited window. Predictive pipeline not loaded yet.")
    
    # After classification, ask user if they want predictive
    run_predictive = input("\nDo you want to see Future Health prediction? (y/n): ").strip().lower()
    if run_predictive != "y":
        return
    
    # -------------------------
    # Predictive simulation
    # -------------------------
    # Load predictive pipeline
    df_pred, scaler_pred, model_pred = load_predictive_artifacts(device)

    # Ensure only numeric features
    df_pred = df_pred.select_dtypes(include=[np.number])

    # Take last SEQUENCE_LENGTH rows for initial sequence
    buffer_pred = df_pred.tail(SEQUENCE_LENGTH).values.tolist()

    print(f"\n⏳ Running predictive model for next {FUTURE_STEPS} steps...")
    for step in range(FUTURE_STEPS):
        # Convert last SEQUENCE_LENGTH rows to array
        seq_raw = np.array(buffer_pred[-SEQUENCE_LENGTH:])
        
        # Scale the sequence
        seq_scaled = scaler_pred.transform(seq_raw)
        
        # Add batch dimension: shape (1, SEQUENCE_LENGTH, num_features)
        x_input = seq_scaled.reshape(1, SEQUENCE_LENGTH, seq_scaled.shape[1])
        
        # Predict next value
        pred_value = model_pred.predict(x_input, verbose=0)[0][0]
        
        # Timestamp for display
        timestamp = pd.Timestamp.now() + pd.Timedelta(minutes=step*10)
        print(f"[{timestamp}] Predicted Health Metric: {pred_value:.2f}")
        
        # Append last raw row to buffer for rolling window
        # (use seq_raw[-1] as a placeholder for next step)
        buffer_pred.append(seq_raw[-1].tolist())


# -------------------------
# Entry point
# -------------------------
if __name__ == "__main__":
    device = input("Select device (smartphone/smartwatch/smartfridge): ").strip().lower()
    if device not in CLASSIFICATION_FILES:
        print("Invalid device!")
    else:
        run_simulation(device)
