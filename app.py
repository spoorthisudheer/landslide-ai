from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import random
import time

app = Flask(__name__)

# Load the model
try:
    model = joblib.load('landslide_model.pkl')
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Network Status State
network_status = {
    'internet': 'ACTIVE',
    'mesh': 'ACTIVE'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 500
        
    try:
        data = request.json
        features = [
            float(data.get('rainfall', 0)),
            float(data.get('soil_moisture', 0)),
            float(data.get('slope', 0)),
            float(data.get('temperature', 0)),
            float(data.get('humidity', 0)),
            float(data.get('elevation', 0))
        ]
        
        # Predict probability
        probs = model.predict_proba([features])[0]
        
        # Risk levels: 0: Low, 1: Medium, 2: High
        # We will map the probability of Medium + High to a general risk percentage
        # A simple approach: (prob(medium) * 0.5 + prob(high) * 1.0) * 100
        risk_prob = (probs[1] * 0.5 + probs[2]) * 100
        
        if risk_prob < 40:
            risk_level = 'LOW'
        elif risk_prob < 70:
            risk_level = 'MEDIUM'
        else:
            risk_level = 'HIGH'
            
        # Feature Importance Explanation (Demo approximation)
        # Random Forest can give feature importances, but they are static for the model.
        # To make it dynamic, we'll weigh the static importances by the normalized input values.
        static_importances = model.feature_importances_
        feature_names = ['Rainfall', 'Soil Moisture', 'Slope', 'Temperature', 'Humidity', 'Elevation']
        
        # Normalize features roughly based on max expected values
        max_vals = [300, 100, 60, 40, 100, 3000]
        normalized_features = [min(f / m, 1.0) for f, m in zip(features, max_vals)]
        
        weighted_importances = [s * n for s, n in zip(static_importances, normalized_features)]
        total_weight = sum(weighted_importances) + 1e-6
        contributions = [(w / total_weight) * 100 for w in weighted_importances]
        
        factors = []
        for name, cont, val in zip(feature_names, contributions, features):
            if cont > 10: # Only show significant factors
                desc = f"High value of {val:.1f} contributes significantly to risk." if val > (max_vals[feature_names.index(name)] * 0.6) else f"Base contribution from {name.lower()}."
                factors.append({
                    'name': name,
                    'contribution': round(cont),
                    'description': desc
                })
                
        # Sort factors by contribution
        factors.sort(key=lambda x: x['contribution'], reverse=True)

        return jsonify({
            'probability': round(risk_prob),
            'level': risk_level,
            'factors': factors
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/sensor-data', methods=['GET'])
def get_sensor_data():
    # Return simulated sensor data
    return jsonify({
        'rainfall': round(random.uniform(0, 150), 1),
        'soil_moisture': round(random.uniform(30, 90), 1),
        'slope': round(random.uniform(15, 45), 1),
        'temperature': round(random.uniform(20, 35), 1),
        'humidity': round(random.uniform(50, 95), 1),
        'elevation': 1240,
        'timestamp': time.strftime("%I:%M %p")
    })

@app.route('/simulate-network', methods=['POST'])
def simulate_network():
    global network_status
    data = request.json
    action = data.get('action')
    
    if action == 'fail':
        network_status['internet'] = 'UNAVAILABLE'
    elif action == 'restore':
        network_status['internet'] = 'ACTIVE'
        
    return jsonify(network_status)
    
@app.route('/network-status', methods=['GET'])
def get_network_status():
    return jsonify(network_status)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
