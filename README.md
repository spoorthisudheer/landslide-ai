# Landslide AI — AI-Based Early Warning & Landslide Risk Monitoring System

This project is a functional, interactive prototype for an AI-powered disaster-monitoring system, developed for a hackathon. 

## Features
- **Machine Learning Risk Prediction**: Uses a Random Forest classifier to predict landslide risk based on environmental factors (rainfall, soil moisture, slope, temperature, humidity, elevation).
- **Explainable AI**: Breaks down the factors contributing to high risk so decision-makers understand *why* the risk is elevated.
- **Risk Escalation Forecast**: Simulates how risk will increase over the next 24 hours if current conditions persist.
- **Interactive Dashboard**: Professional, dark-themed control-room style UI using Bootstrap 5.
- **Leaflet Map Monitor**: Visualizes the vulnerable regions and impact zones.
- **Mesh Network Communication Simulation**: Demonstrates a disaster-resilient communication layer by simulating conventional network failure and fallback to a mesh network.
- **Automated Reporting**: Generates a printable summary report.
- **Demo Mode**: Includes pre-configured Low, Medium, and High-risk scenarios for smooth live demonstration.

## Project Structure
```
landslide-ai/
│
├── app.py                   # Main Flask application
├── train_model.py           # Script to generate synthetic data and train the ML model
├── landslide_model.pkl      # Saved Random Forest model
├── requirements.txt         # Python dependencies
│
├── dataset/                 # Data folder
│   └── landslide_data.csv   # Generated synthetic dataset
│
├── templates/
│   └── index.html           # Single-Page Application HTML template
│
└── static/
    ├── css/
    │   └── style.css        # Dashboard styling
    └── js/
        └── dashboard.js     # Frontend logic, charts, maps, and API integration
```

## How to Run Locally

### Prerequisites
- Python 3.8+
- pip

### Installation Steps

1. **Clone/Navigate to the directory**:
   Ensure you are in the root directory of the project.

2. **Create a Virtual Environment (Optional but recommended)**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Train the Model**:
   Run the training script to generate the synthetic dataset and the `landslide_model.pkl` file.
   ```bash
   python train_model.py
   ```

5. **Start the Flask Server**:
   ```bash
   python app.py
   ```

6. **View the Dashboard**:
   Open a web browser and go to `http://127.0.0.1:5000`

## Live Demonstration Guide (3-5 Minutes)

Use this flow to present the prototype to judges:

1. **Dashboard Overview**: Open the main dashboard, point out the real-time layout, mock sensor readings, and the active network statuses at the top.
2. **Demo Mode Scenarios**: Draw attention to the "DEMO MODE" buttons at the top of the content area.
3. **High Risk Simulation**: Click **"Load High Risk"**.
4. **Observe the Changes**: 
   - Notice the Risk Level jump to **HIGH**.
   - Show the **"Why Is The Risk High?"** panel to demonstrate Explainable AI (it breaks down the contribution of rainfall vs soil moisture).
   - Point out the **Risk Escalation Forecast** chart showing the trajectory over the next 24 hours.
5. **Early Warning System**: Scroll to the Early Warning panel. Show that it has triggered a critical alert with recommended actions.
6. **Communication Resilience**: 
   - Navigate to the **Communication** tab on the left sidebar.
   - Explain the concept: "Conventional networks fail during landslides."
   - Click **SIMULATE NETWORK FAILURE**.
   - Show how the Internet status becomes UNAVAILABLE (top right and on screen), but the Mesh Network routing remains ACTIVE to deliver the warning.
7. **Report Generation**: Go to the **Reports** tab and click **Generate Report** to show how actionable data is summarized for authorities.
