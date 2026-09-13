import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# Create synthetic dataset for demo purposes
# Features: rainfall (mm), soil_moisture (%), slope (degrees), temperature (C), humidity (%), elevation (m)
# Target: risk_level (0: Low, 1: Medium, 2: High)

np.random.seed(42)
n_samples = 1000

data = {
    'rainfall': np.random.uniform(0, 300, n_samples),
    'soil_moisture': np.random.uniform(10, 100, n_samples),
    'slope': np.random.uniform(0, 60, n_samples),
    'temperature': np.random.uniform(10, 40, n_samples),
    'humidity': np.random.uniform(30, 100, n_samples),
    'elevation': np.random.uniform(100, 3000, n_samples)
}

df = pd.DataFrame(data)

# Logic to generate risk labels
# Higher rainfall, moisture, and slope -> Higher Risk
def calculate_risk(row):
    score = (row['rainfall'] / 300) * 0.4 + (row['soil_moisture'] / 100) * 0.3 + (row['slope'] / 60) * 0.3
    if score < 0.4:
        return 0 # Low
    elif score < 0.7:
        return 1 # Medium
    else:
        return 2 # High

df['risk_level'] = df.apply(calculate_risk, axis=1)

# Save the dataset
os.makedirs('dataset', exist_ok=True)
df.to_csv('dataset/landslide_data.csv', index=False)
print("Synthetic dataset saved to dataset/landslide_data.csv")

# Prepare data for training
X = df.drop('risk_level', axis=1)
y = df['risk_level']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Random Forest
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")

# Save the model
joblib.dump(model, 'landslide_model.pkl')
print("Model saved to landslide_model.pkl")

# Save feature names for reference
feature_names = X.columns.tolist()
joblib.dump(feature_names, 'feature_names.pkl')
