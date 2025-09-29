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
