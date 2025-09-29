# Team
## CodeGalaxy – VIT Vellore
- Haani Behzad Kuniyil (22MIC0179)
- Sujal Ravindra Dixit (22MIC0115)
- Keerthana Krishnan T (22MID0038)
- Drisanth M (22MIC0139)
- Darsh Marothi (22MID0333)

# Samsung Care+ AI – Autonomous Device Health & Support Ecosystem

## Overview
Samsung Aura is an always-on **device health companion** that monitors all Samsung devices — smartphones, TVs, appliances, and wearables — using multimodal AI.  
It predicts failures, performs remote fixes, and coordinates service **without human intervention**.  

The solution is powered by a **multi-agent system** with specialized AI agents for:
- Diagnostics
- Predictive Maintenance
- Customer Interaction
- Service Coordination
- System Optimization

This ensures **proactive support**, reducing downtime, extending device lifespan, and providing a seamless user experience.

---

# Project Setup

This project consists of a **server**, a **client**, and a **Python environment**. Follow the steps below to set everything up.  

---

## 🔧 Server Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Create a `.env` file inside the `server` folder and add the following keys:
   ```env
   MONGODB_URI=your_mongodb_uri_here
   GEMINI_API_KEY=your_gemini_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 💻 Client Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the client development server:
   ```bash
   npm run dev
   ```

---

## 🐍 Python Environment Setup

1. In the **root directory** of the project, create a virtual environment:
   ```bash
   python -m venv .venv
   ```

2. Activate the virtual environment:

   - **Windows (PowerShell):**
     ```bash
     .venv\Scripts\activate
     ```

   - **Linux/MacOS:**
     ```bash
     source .venv/bin/activate
     ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

---

## 📊 Using the Dashboard

After setting up and running both the **server** and the **client**, open the application in your browser.  

1. Navigate to the **Dashboard** page.  
2. Select the **device** you wish to test.  
3. Inside the device view, you can simulate two scenarios:  
   - **CPU Fault Simulation** 🖥️  
   - **Battery Fault Simulation** 🔋  

👉 Choose a simulation of your choice.  

---

### 🖼️ Dashboard Walkthrough (Screenshots go here)

- **Dashboard:**  
  <img width="1917" height="907" alt="image" src="https://github.com/user-attachments/assets/ad80b98e-9fbe-4ca5-ab22-6d42f54c1455" />

- **Device Selection:**
   <img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/3f0c3ff4-e33d-48ed-80e3-d6e4bf970b0f" />

- **Simulation Options:**  
  <img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/9aaa9a93-ce69-430d-b0b2-f9f79b358217" />


---

### 📌 Dashboard Layout

Once inside the dashboard, you will see **three main sections**:

1. **Classification Model**  
   - Displays the **current system status**  
   - Provides a **recommended fix**  

   <img width="611" height="289" alt="image" src="https://github.com/user-attachments/assets/1c1747da-6eb2-4e90-b6d3-832aa7e712c9" />


2. **Predictive Model**  
   - Shows **predictions for up to the next 50 minutes**  

   <img width="603" height="382" alt="image" src="https://github.com/user-attachments/assets/dc2db059-5fa2-4250-9da8-6a17617cb9d3" />


3. **Live Health Graph**  
   - Displays the **real-time health status** of the system  

   <img width="1226" height="447" alt="image" src="https://github.com/user-attachments/assets/3f9fabec-a9e8-433d-a806-57ece2aca202" />

---

### 📸 Visual Input Section

In the **Visual Input** section, you can upload an image of your **broken device** or a **specific component**.  
The AI will analyze the image and provide a **recommended fix**.  

<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/cf5bff42-dce6-4e61-a448-f69a4e665319" />

---

### 🎙️ Audio Section

In the **Audio** section, you can interact with the **AI bot** through voice chat.  
The bot will listen to your issue and provide **recommended solutions** in real time.  

<img width="1918" height="910" alt="image" src="https://github.com/user-attachments/assets/dde897e4-5ad0-4965-ae24-a3ed6ce21fc7" />

---

### 📑 Report Generation Section

The **Report Generation** section provides a **summarized and diagnostic report** of all your activities, including:

- 🖥️ **Simulated Testing Results** (CPU/Battery faults)  
- 📸 **Visual Input Analysis** (uploaded device/component images)  
- 🎙️ **Audio Interaction Logs** (AI chat recommendations)  

This report helps in understanding the overall system health and suggested fixes in one place.  

<img width="1919" height="716" alt="image" src="https://github.com/user-attachments/assets/469fe756-c973-41ef-b3c9-26ef4950e46f" />
<img width="1919" height="778" alt="image" src="https://github.com/user-attachments/assets/1504c59f-2040-40bd-b026-087a663513ac" />

You can also download your report as a pdf.

<img width="1163" height="144" alt="image" src="https://github.com/user-attachments/assets/315880da-aec5-4c51-abb0-5b967cd9de12" />

---

