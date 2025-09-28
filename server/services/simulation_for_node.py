# services/simulation_for_node.py
import sys
import json
import time
import numpy as np
import pandas as pd
import joblib
from tensorflow.keras.models import load_model
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# This is a simplified version of your simulation logic.
# In a real scenario, you'd put the full continuous loop here.
# For now, it just prints dummy data.
def run_simulation():
    i = 0
    while True:
        data_packet = {
            "timestamp": time.strftime('%H:%M:%S'),
            "probability": 0.1 + (i % 8) * 0.1,
            "final_status_text": "Normal" if i % 10 < 8 else "Warning",
            "final_status_style": "normal" if i % 10 < 8 else "warning",
            "card_class_extra": "",
            "verdict_text": "Status confirmed by predictive scan.",
            "forecast": [
                {"Time": "+10 min", "Predicted Metric": "11.50"},
                {"Time": "+20 min", "Predicted Metric": "11.80"}
            ]
        }
        # Print the JSON packet to standard output for Node.js to capture
        print(json.dumps(data_packet))
        sys.stdout.flush() # Ensure it gets sent immediately
        time.sleep(2)
        i += 1

if __name__ == "__main__":
    run_simulation()