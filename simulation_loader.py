# simulation_loader.py
import os
import json
import joblib
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.getcwd()  # adjust if running from a different location

DEVICE_TYPES = ["smartphone", "smartwatch", "smartfridge"]

MODEL_FOLDERS = {
    "classification": {
        "model": os.path.join(BASE_DIR, "classification", "h5"),
        "scaler": os.path.join(BASE_DIR, "classification", "scaler"),
        "feature": os.path.join(BASE_DIR, "classification", "feature"),
        "dataset": os.path.join(BASE_DIR, "classification", "dataset")
    },
    "predictive": {
        "model": os.path.join(BASE_DIR, "predictive", "h5"),
        "scaler": os.path.join(BASE_DIR, "predictive", "scaler"),
        "dataset": os.path.join(BASE_DIR, "predictive", "dataset")
    }
}

def load_classification_components(device_type):
    """Load classification model, scaler, features, and dataset for a device."""
    paths = MODEL_FOLDERS["classification"]
    
    model_path = os.path.join(paths["model"], f"{device_type}_classification.h5")
    scaler_path = os.path.join(paths["scaler"], f"{device_type}_scaler.joblib")
    feature_path = os.path.join(paths["feature"], f"{device_type}_features.joblib")
    dataset_path = os.path.join(paths["dataset"], f"{device_type}_dataset.json")
    
    # Load model, scaler, features
    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    features = joblib.load(feature_path)
    
    # Load dataset
    with open(dataset_path, "r") as f:
        dataset = json.load(f)
    
    return model, scaler, features, dataset

def load_predictive_components(device_type):
    """Load predictive model, scaler, and dataset for a device."""
    paths = MODEL_FOLDERS["predictive"]
    
    model_path = os.path.join(paths["model"], f"{device_type}_predictive.h5")
    scaler_path = os.path.join(paths["scaler"], f"{device_type}_scaler.joblib")
    dataset_path = os.path.join(paths["dataset"], f"{device_type}_dataset.csv")
    
    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    
    # CSV dataset
    dataset = pd.read_csv(dataset_path)
    
    return model, scaler, dataset

if __name__ == "__main__":
    # Quick test
    device = "smartphone"
    cls_model, cls_scaler, cls_features, cls_dataset = load_classification_components(device)
    pred_model, pred_scaler, pred_dataset = load_predictive_components(device)
    print(f"Loaded models and datasets for {device}.")
