# Team
## CodeGalaxy – VIT Vellore
- Haani Behzad Kuniyil (22MIC0179)
- Sujal Ravindra Dixit (22MIC0115)
- Keerthana Krishnan T (22MID0038)
- Drisanth M (22MIC0139)
- Darsh Marothi (22MID0333)

# Samsung Care+ AI – Autonomous Device Health & Support Ecosystem

## Overview
Samsung Care+ AI is an always-on **device health companion** that monitors all Samsung devices — smartphones, TVs, appliances, and wearables — using multimodal AI.  
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

- **Device Selection Page:**  
  ![Device Selection Screenshot]<img width="1917" height="907" alt="image" src="https://github.com/user-attachments/assets/ad80b98e-9fbe-4ca5-ab22-6d42f54c1455" />


- **Simulation Options:**  
  ![Simulation Options Screenshot](screenshots/simulation-options.png)

---

### 📌 Dashboard Layout

Once inside the dashboard, you will see **three main sections**:

1. **Top-Left: Classification Model**  
   - Displays the **current system status**  
   - Provides a **recommended fix**  

   ![Classification Model Screenshot](screenshots/classification-model.png)

2. **Top-Right: Predictive Model**  
   - Shows **predictions for up to the next 50 minutes**  

   ![Predictive Model Screenshot](screenshots/predictive-model.png)

3. **Bottom: Live Health Graph**  
   - Displays the **real-time health status** of the system  

   ![Live Health Graph Screenshot](screenshots/live-health-graph.png)

---

### 📸 Visual Input Section

In the **Visual Input** section, you can upload an image of your **broken device** or a **specific component**.  
The AI will analyze the image and provide a **recommended fix**.  

![Visual Input Screenshot](screenshots/visual-input.png)

---

### 🎙️ Audio Section

In the **Audio** section, you can interact with the **AI bot** through voice chat.  
The bot will listen to your issue and provide **recommended solutions** in real time.  

![Audio Section Screenshot](screenshots/audio-section.png)

---
