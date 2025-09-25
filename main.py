import json
from data_generator import (
    WashingMachineSimulator, 
    RobotVacuumSimulator, 
    SmartphoneSimulator,
    LaptopSimulator,
    SmartTVSimulator,
    # Import the new simulators
    WashingMachineDrainSimulator,
    SmartphoneBatterySimulator,
    SmartwatchSimulator
)

def save_dataset(data, filename):
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Successfully generated and saved dataset to '{filename}'")

if __name__ == "__main__":
    print("🚀 Starting large-scale dataset generation...")

    # --- Existing Scenarios with MORE DATA ---
    print("\n--- Simulating: Washing Machine Motor Strain ---")
    wm_sim = WashingMachineSimulator()
    wm_dataset = wm_sim.run_simulation(healthy_records=500, failing_records=50)
    save_dataset(wm_dataset, "washing_machine_motor_strain_dataset.json")
    
    print("\n--- Simulating: Robot Vacuum Clogged Brush ---")
    rv_sim = RobotVacuumSimulator()
    rv_dataset = rv_sim.run_simulation(healthy_records=800, failing_records=60)
    save_dataset(rv_dataset, "robot_vacuum_clogged_brush_dataset.json")

    print("\n--- Simulating: Smartphone Malicious App ---")
    sp_sim = SmartphoneSimulator()
    sp_dataset = sp_sim.run_simulation(healthy_records=1000, failing_records=40)
    save_dataset(sp_dataset, "smartphone_malicious_app_dataset.json")

    print("\n--- Simulating: Laptop Thermal Throttling ---")
    lt_sim = LaptopSimulator()
    lt_dataset = lt_sim.run_simulation(healthy_records=1200, failing_records=80)
    save_dataset(lt_dataset, "laptop_thermal_failure_dataset.json")

    print("\n--- Simulating: Smart TV Backlight Failure ---")
    tv_sim = SmartTVSimulator()
    tv_dataset = tv_sim.run_simulation(healthy_records=2000, failing_records=60)
    save_dataset(tv_dataset, "smart_tv_backlight_failure_dataset.json")

    # --- NEW SCENARIOS ---
    print("\n--- NEW Simulating: Washing Machine Drain Blockage ---")
    wmd_sim = WashingMachineDrainSimulator()
    wmd_dataset = wmd_sim.run_simulation(healthy_records=400, failing_records=40)
    save_dataset(wmd_dataset, "washing_machine_drain_blockage_dataset.json")

    print("\n--- NEW Simulating: Smartphone Battery Degradation ---")
    spb_sim = SmartphoneBatterySimulator()
    spb_dataset = spb_sim.run_simulation(healthy_records=1500, failing_records=100)
    save_dataset(spb_dataset, "smartphone_battery_degradation_dataset.json")

    print("\n--- NEW Simulating: Smartwatch GPS Failure ---")
    sw_sim = SmartwatchSimulator()
    sw_dataset = sw_sim.run_simulation(healthy_records=600, failing_records=50)
    save_dataset(sw_dataset, "smartwatch_gps_failure_dataset.json")


    print("\n🎉 All 8 datasets have been generated with increased record counts!")