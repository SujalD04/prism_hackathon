import json
import uuid
import random
from datetime import datetime, timedelta

class DeviceSimulator:
    """
    Base class for all device simulators. It provides the core structure
    for generating time-series data with healthy and failing states.
    """
    def __init__(self, device_type, model_name, failure_type):
        self.device_id = f"{device_type.replace('_', '-')}-{uuid.uuid4()}"
        self.device_type = device_type
        self.model_name = model_name
        self.failure_type = failure_type
        self.current_time = datetime.utcnow()
        self.time_step = timedelta(minutes=10)
        self.state = self.get_healthy_state()

    def get_healthy_state(self):
        raise NotImplementedError("Each device must implement its own healthy state.")

    def simulate_failure_step(self):
        raise NotImplementedError("Each device must implement its own failure simulation.")

    def generate_record(self, is_failing=False):
        record = {
            "recordId": str(uuid.uuid4()),
            "deviceId": self.device_id,
            "deviceType": self.device_type,
            "timestamp": self.current_time.isoformat() + "Z",
            "modelName": self.model_name,
            "metrics": self.state,
            "label": {
                "failure_imminent": is_failing,
                "failure_type": self.failure_type if is_failing else "none"
            }
        }
        self.current_time += self.time_step
        return record

    def run_simulation(self, healthy_records=15, failing_records=5):
        dataset = []
        for _ in range(healthy_records):
            self.state = self.get_healthy_state()
            dataset.append(self.generate_record(is_failing=False))
        
        for i in range(failing_records):
            self.simulate_failure_step()
            dataset.append(self.generate_record(is_failing=True))
            
        return dataset

# --- ORIGINAL SIMULATORS ---

class WashingMachineSimulator(DeviceSimulator):
    def __init__(self):
        super().__init__("washing_machine", "Samsung Bespoke AI Laundry", "motor_strain_failure")
    def get_healthy_state(self):
        return {"vibration_level_g": round(random.uniform(0.1, 0.5), 2), "motor_current_amps": round(random.uniform(2.0, 4.0), 2), "spin_cycle_rpm": 1200, "error_code": "none", "water_level_sensor": "normal"}
    def simulate_failure_step(self):
        self.state["vibration_level_g"] += round(random.uniform(0.5, 1.5), 2)
        self.state["motor_current_amps"] += round(random.uniform(0.8, 2.0), 2)
        self.state["spin_cycle_rpm"] -= random.randint(50, 150)
        if self.state["vibration_level_g"] > 4.0: self.state["error_code"] = "3E"

class RobotVacuumSimulator(DeviceSimulator):
    def __init__(self):
        super().__init__("robot_vacuum", "Samsung Jet Bot AI+", "brush_motor_clog")
    def get_healthy_state(self):
        return {"brush_motor_current_amps": round(random.uniform(0.5, 0.8), 2), "suction_fan_rpm": random.randint(22000, 25000), "wheel_motor_current_amps": round(random.uniform(0.3, 0.5), 2), "navigation_error_count": 0, "error_code": "none"}
    def simulate_failure_step(self):
        self.state["brush_motor_current_amps"] += round(random.uniform(0.2, 0.5), 2)
        self.state["suction_fan_rpm"] -= random.randint(500, 1200)
        self.state["wheel_motor_current_amps"] += round(random.uniform(0.05, 0.1), 2)
        if self.state["brush_motor_current_amps"] > 2.0 and random.random() > 0.6: self.state["navigation_error_count"] += 1
        if self.state["brush_motor_current_amps"] > 2.5: self.state["error_code"] = "C03"; self.state["brush_motor_current_amps"] = 0; self.state["suction_fan_rpm"] = 0

class SmartphoneSimulator(DeviceSimulator):
    def __init__(self):
        super().__init__("smartphone", "Samsung Galaxy S25 Ultra", "malicious_app_activity")
        self.failure_step_count = 0
    def get_healthy_state(self):
        return {"installed_apps_count": random.randint(80, 95), "background_data_usage_mb": round(random.uniform(5, 20), 1), "cpu_usage_percent": round(random.uniform(5, 15), 1), "knox_threat_level": "none", "network_connections_active": random.randint(10, 20), "last_app_installed": "com.samsung.android.app.galaxy"}
    def simulate_failure_step(self):
        self.failure_step_count += 1
        if self.failure_step_count == 1: self.state["installed_apps_count"] += 1; self.state["last_app_installed"] = "com.superfree.photoeditor"; self.state["knox_threat_level"] = "warning_pup"
        elif self.failure_step_count in [2, 3]: self.state["background_data_usage_mb"] += random.randint(50, 150); self.state["cpu_usage_percent"] = round(random.uniform(30, 50), 1); self.state["network_connections_active"] += random.randint(15, 30)
        else: self.state["knox_threat_level"] = "critical_malware_detected"; self.state["malicious_connection_ip"] = "198.51.100.21"; self.state["background_data_usage_mb"] += random.randint(100, 250)

class LaptopSimulator(DeviceSimulator):
    def __init__(self):
        super().__init__("laptop", "Samsung Galaxy Book4 Ultra", "thermal_throttling_fan_failure")
    def get_healthy_state(self):
        return {"cpu_temp_c": round(random.uniform(50.0, 65.0), 1), "fan_speed_rpm": random.randint(2500, 3500), "cpu_clock_speed_mhz": random.randint(4000, 4800), "power_consumption_w": round(random.uniform(30, 50), 1), "error_code": "none"}
    def simulate_failure_step(self):
        if self.state["fan_speed_rpm"] < 5500: self.state["fan_speed_rpm"] += random.randint(400, 600); self.state["cpu_temp_c"] += round(random.uniform(2.0, 5.0), 1)
        else: self.state["fan_speed_rpm"] -= random.randint(1000, 2000); self.state["cpu_temp_c"] += round(random.uniform(5.0, 8.0), 1)
        if self.state["cpu_temp_c"] > 95.0: self.state["cpu_clock_speed_mhz"] -= random.randint(800, 1500)
        self.state["cpu_temp_c"] = min(self.state["cpu_temp_c"], 99.9); self.state["fan_speed_rpm"] = max(self.state["fan_speed_rpm"], 0); self.state["cpu_clock_speed_mhz"] = max(self.state["cpu_clock_speed_mhz"], 800)
        if self.state["fan_speed_rpm"] == 0: self.state["error_code"] = "FAN_FAILURE"; self.state["cpu_clock_speed_mhz"] = 800

class SmartTVSimulator(DeviceSimulator):
    def __init__(self):
        super().__init__("smart_tv", "Samsung QN900D Neo QLED 8K", "backlight_led_failure")
        self.failing_zone = random.choice(["zone_1", "zone_2", "zone_3", "zone_4"])
    def get_healthy_state(self):
        base_current = random.randint(145, 155)
        return {"backlight_led_current_ma": {"zone_1": base_current + random.randint(-2, 2), "zone_2": base_current + random.randint(-2, 2), "zone_3": base_current + random.randint(-2, 2), "zone_4": base_current + random.randint(-2, 2)}, "brightness_uniformity_percent": round(random.uniform(98.5, 99.5), 2), "power_consumption_w": round(random.uniform(180, 210), 1), "image_flicker_detected": False, "error_code": "none"}
    def simulate_failure_step(self):
        current_in_failing_zone = self.state["backlight_led_current_ma"][self.failing_zone]
        if current_in_failing_zone < 250: self.state["backlight_led_current_ma"][self.failing_zone] += random.randint(15, 25); self.state["brightness_uniformity_percent"] -= round(random.uniform(0.5, 1.5), 2); self.state["power_consumption_w"] += round(random.uniform(8, 15), 1)
        else: self.state["backlight_led_current_ma"][self.failing_zone] = 0; self.state["brightness_uniformity_percent"] -= round(random.uniform(10, 20), 2); self.state["image_flicker_detected"] = True; self.state["error_code"] = "ERR_BACKLIGHT_ZONE_FAIL"
        self.state["brightness_uniformity_percent"] = max(self.state["brightness_uniformity_percent"], 60.0)

# --- NEW SIMULATORS ---

class WashingMachineDrainSimulator(DeviceSimulator):
    """ NEW: Simulates a washing machine with a clogged drain pump. """
    def __init__(self):
        super().__init__("washing_machine", "Samsung Bespoke AI Laundry", "drain_pump_blockage")
    def get_healthy_state(self):
        return {"water_level_sensor": 0, "drain_pump_current_amps": 0, "time_in_cycle_stage_sec": random.randint(120, 180), "error_code": "none"}
    def simulate_failure_step(self):
        self.state["water_level_sensor"] = random.randint(5, 15)
        self.state["time_in_cycle_stage_sec"] += random.randint(60, 120)
        self.state["drain_pump_current_amps"] = round(random.uniform(1.5, 2.5), 2)
        if self.state["time_in_cycle_stage_sec"] > 400: self.state["error_code"] = "5E"

class SmartphoneBatterySimulator(DeviceSimulator):
    """ NEW: Simulates a smartphone with a degrading battery over time. """
    def __init__(self):
        super().__init__("smartphone", "Samsung Galaxy S25 Ultra", "battery_degradation")
        self.state = self.get_healthy_state()
        self.state["charge_cycles"] = random.randint(50, 150)
    def get_healthy_state(self):
        return {"battery_health_percent": 100, "charge_cycles": 0, "max_capacity_mah": 5000, "unexpected_shutdown_flag": False}
    def simulate_failure_step(self):
        self.state["charge_cycles"] += random.randint(5, 10)
        self.state["max_capacity_mah"] -= random.randint(10, 20)
        self.state["battery_health_percent"] = round((self.state["max_capacity_mah"] / 5000) * 100)
        if self.state["battery_health_percent"] < 80 and random.random() > 0.7: self.state["unexpected_shutdown_flag"] = True

class SmartwatchSimulator(DeviceSimulator):
    """ NEW: Simulates a smartwatch with a failing GPS sensor. """
    def __init__(self):
        super().__init__("smartwatch", "Samsung Galaxy Watch7", "gps_sensor_failure")
    def get_healthy_state(self):
        return {"gps_lock_status": "locked", "satellite_count": random.randint(10, 15), "positional_accuracy_meters": round(random.uniform(3, 8), 1), "heart_rate_bpm": random.randint(120, 150)}
    def simulate_failure_step(self):
        self.state["satellite_count"] -= random.randint(1, 3)
        self.state["positional_accuracy_meters"] += round(random.uniform(5, 15), 1)
        if self.state["satellite_count"] < 6: self.state["gps_lock_status"] = "searching"
        if self.state["satellite_count"] < 3: self.state["gps_lock_status"] = "failed"; self.state["satellite_count"] = 0