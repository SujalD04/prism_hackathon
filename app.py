# app.py
import streamlit as st
import time
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# ==============================================================================
# App Configuration & Styling
# ==============================================================================
st.set_page_config(page_title="Samsung Care+ AI", layout="wide")

st.markdown("""
<style>
.metric-card {
    padding: 1rem; border-radius: 1rem; color: white; margin-bottom: 1rem;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    border: 3px solid transparent;
}
.metric-card-upgraded {
    border: 3px solid #00BFFF; /* Deep sky blue to indicate an AI override */
    box-shadow: 0 8px 16px 0 rgba(0,191,255,0.5);
}
.metric-card-normal { background-color: #28a745; }
.metric-card-warning { background-color: #ffc107; color: black; }
.metric-card-critical { background-color: #dc3545; }
.metric-card h3 { color: white !important; font-size: 1.2rem; margin-bottom: 0.5rem; }
.metric-card-warning h3 { color: black !important; }
.metric-card p { font-size: 2.5rem; font-weight: bold; margin: 0; }
.stDataFrame { text-align: center; }
.report-box { padding: 1rem; border-radius: 0.5rem; background-color: #f0f2f6; margin-bottom: 1rem; }
</style>
""", unsafe_allow_html=True)


st.title("🚀 Samsung Care+ AI")
st.subheader("Autonomous Device Health & Support Ecosystem")


# ==============================================================================
# Constants & File Paths
# ==============================================================================
SEQUENCE_LENGTH = 10
DELAY_SECONDS = 2.0
DIAGNOSTIC_TIME_SECONDS = 10
FUTURE_STEPS = 5
PREDICTIVE_ANOMALY_THRESHOLD = 14
CHART_WINDOW_SIZE = 30 

# (File paths remain the same)
CLASSIFICATION_FILES = {"smartphone": {"dataset": "classification/dataset/smartphone_dataset.json", "scaler": "classification/scaler/smartphone_scaler.joblib", "features": "classification/feature/smartphone_features.joblib", "model": "classification/h5/smartphone_classification.h5"}, "smartwatch": {"dataset": "classification/dataset/smartwatch_dataset.json", "scaler": "classification/scaler/smartwatch_scaler.joblib", "features": "classification/feature/smartwatch_features.joblib", "model": "classification/h5/smartwatch_classification.h5"}, "smartfridge": {"dataset": "classification/dataset/smartfridge_dataset.json", "scaler": "classification/scaler/smartfridge_scaler.joblib", "features": "classification/feature/smartfridge_features.joblib", "model": "classification/h5/smartfridge_classification.h5"}}
PREDICTIVE_FILES = {"smartphone": {"dataset": "predictive/dataset/smartphone_dataset.csv", "scaler": "predictive/scaler/smartphone_scaler.joblib", "model": "predictive/h5/smartphone_predictive.h5"}, "smartwatch": {"dataset": "predictive/dataset/smartwatch_dataset.csv", "scaler": "predictive/scaler/smartwatch_scaler.joblib", "model": "predictive/h5/smartwatch_predictive.h5"}, "smartfridge": {"dataset": "predictive/dataset/smartfridge_dataset.csv", "scaler": "predictive/scaler/smartfridge_scaler.joblib", "model": "predictive/h5/smartfridge_predictive.h5"}}

# ==============================================================================
# Helper Functions & Cached Model Loading
# ==============================================================================
def get_status_info(pred_prob):
    if pred_prob < 0.3: return "Normal", "normal"
    elif pred_prob < 0.7: return "Warning", "warning"
    else: return "Critical", "critical"

@st.cache_data
def load_artifacts(device):
    # (This function remains the same)
    cls_files = CLASSIFICATION_FILES[device]; df_class = pd.read_json(cls_files["dataset"])
    df_metrics = pd.json_normalize(df_class["metrics"]); df_labels = pd.json_normalize(df_class["label"])
    df_class = pd.concat([df_class.drop(columns=["metrics", "label", "recordId", "modelName"]), df_metrics, df_labels], axis=1)
    scaler_class = joblib.load(cls_files["scaler"]); features_class = joblib.load(cls_files["features"]); model_class = load_model(cls_files["model"])
    pred_files = PREDICTIVE_FILES[device]; df_pred_raw = pd.read_csv(pred_files["dataset"])
    scaler_pred = joblib.load(pred_files["scaler"]); model_pred = load_model(pred_files["model"])
    df_pred_numeric = df_pred_raw.select_dtypes(include=[np.number])
    df_pred = df_pred_numeric.iloc[:, :scaler_pred.n_features_in_]
    return df_class, scaler_class, features_class, model_class, df_pred, scaler_pred, model_pred

# ==============================================================================
# Application Workflow
# ==============================================================================

if 'flow_step' not in st.session_state:
    st.session_state.flow_step = "start"

if st.session_state.flow_step == "start":
    if st.button("Track Device Health", type="primary"):
        st.session_state.flow_step = "select"; st.rerun()
    st.image("https://images.samsung.com/is/image/samsung/assets/in/support/useful-links/in-care-plus-banner-1440x480.jpg", use_container_width=True)

if st.session_state.flow_step == "select":
    st.subheader("1. Select a Device to Monitor")
    device = st.selectbox("Choose a device:", ("smartphone", "smartwatch", "smartfridge"), key="device_select")
    if st.button(f"Begin Diagnostics for {device.title()}"):
        st.session_state.device = device; st.session_state.flow_step = "simulate"; st.rerun()

if st.session_state.flow_step == "simulate":
    device = st.session_state.device
    st.header(f"Live AI System Monitoring: {device.title()}")

    # --- NEW: Refined UI Layout ---
    col1, col2 = st.columns(2, gap="large")
    final_verdict_placeholder = col1.empty()
    with col2:
        st.markdown("##### 🧠 AI Model Analysis")
        classification_report_placeholder = st.empty()
        prediction_report_placeholder = st.empty()
    chart_placeholder = st.container()

    # --- Diagnostics and Data Loading ---
    progress_bar = st.progress(0, text="Running initial diagnostics...")
    for i in range(100):
        time.sleep(DIAGNOSTIC_TIME_SECONDS / 100)
        progress_bar.progress(i + 1, text=f"Calibrating AI models for {device}...")
    progress_bar.empty()

    df_class, scaler_class, features_class, model_class, df_pred, scaler_pred, model_pred = load_artifacts(device)
    df_features_sim = df_class[features_class]
    buffer_class = []; buffer_pred = df_pred.tail(SEQUENCE_LENGTH).values.tolist()
    chart_data = pd.DataFrame(columns=["Timestamp", "Failure Probability"])
    
    with chart_placeholder:
        st.subheader("📈 Live Failure Probability Trend")
        live_chart = st.line_chart(chart_data.set_index("Timestamp"))

    # --- Main CONTINUOUS Interactive Simulation Loop ---
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
                timestamp_str = df_class.loc[idx, "timestamp"]

                # [STEP 2] PREDICTION
                temp_buffer_pred = buffer_pred.copy(); n_features_pred = scaler_pred.n_features_in_
                future_predictions = []; is_anomaly_predicted = False
                first_anomaly_time = None # NEW: To store the time of the first anomaly
                for step in range(FUTURE_STEPS):
                    seq_raw = np.array(temp_buffer_pred[-SEQUENCE_LENGTH:])
                    seq_scaled = scaler_pred.transform(seq_raw)
                    x_input_pred = seq_scaled.reshape(1, SEQUENCE_LENGTH, n_features_pred)
                    pred_scaled = model_pred.predict(x_input_pred, verbose=0)
                    dummy_row = np.zeros((1, n_features_pred)); dummy_row[0, 0] = pred_scaled[0, 0]
                    pred_unscaled = scaler_pred.inverse_transform(dummy_row)
                    metric_pred = pred_unscaled[0, 0]
                    time_str = f"+{(step+1)*10} min"
                    future_predictions.append({"Time": time_str, "Predicted Metric": f"{metric_pred:.2f}"})
                    if metric_pred > PREDICTIVE_ANOMALY_THRESHOLD:
                        is_anomaly_predicted = True
                        if first_anomaly_time is None: # Store only the EARLIEST anomaly time
                            first_anomaly_time = time_str
                    next_forecast_input = seq_raw[-1, :].tolist(); next_forecast_input[0] = metric_pred
                    temp_buffer_pred.append(next_forecast_input)
                    if len(temp_buffer_pred) > SEQUENCE_LENGTH: temp_buffer_pred.pop(0)

                # [STEP 3] FINAL VERDICT LOGIC
                final_status_text, final_status_style = current_status_text, current_status_style
                card_class_extra = ""
                if is_anomaly_predicted and current_status_text == "Normal":
                    final_status_text = "Warning"; final_status_style = "warning"
                    card_class_extra = "metric-card-upgraded"

                # [STEP 4] UPDATE UI
                with final_verdict_placeholder:
                    st.markdown(f'''<div class="metric-card metric-card-{final_status_style} {card_class_extra}">
                                    <h3>System Health Verdict</h3><p>{final_status_text}</p></div>''', unsafe_allow_html=True)
                
                with classification_report_placeholder.container():
                    st.markdown("🔬 **Classification Model:**")
                    st.info(f"The current device check shows a **{current_status_text}** status.")

                with prediction_report_placeholder.container():
                    st.markdown("🔮 **Predictive Model:**")
                    if is_anomaly_predicted:
                        st.warning(f"Scan complete. Potential anomaly detected in **{first_anomaly_time}**.")
                    else:
                        st.success("Scan complete. No future anomalies detected.")
                    st.dataframe(pd.DataFrame(future_predictions), use_container_width=True)

                # Update live chart
                new_row = pd.DataFrame([{"Timestamp": pd.to_datetime(timestamp_str), "Failure Probability": pred_prob}])
                chart_data = pd.concat([chart_data, new_row], ignore_index=True)
                if len(chart_data) > CHART_WINDOW_SIZE: chart_data = chart_data.tail(CHART_WINDOW_SIZE)
                with chart_placeholder: live_chart.line_chart(chart_data.set_index("Timestamp"))
                
                new_pred_row = df_pred.iloc[idx].values.tolist()
                buffer_pred.append(new_pred_row)
                if len(buffer_pred) > SEQUENCE_LENGTH: buffer_pred.pop(0)

                time.sleep(DELAY_SECONDS)