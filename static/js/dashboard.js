// Global State
let currentRiskLevel = 'LOW';
let currentRiskProb = 0;
let mainMap, previewMap;
let forecastChart;

// Simulated monitoring locations
const monitoringLocations = [
    {
        name: "Kodagu, Karnataka",
        coordinates: [12.3375, 75.8069]
    },
    {
        name: "Wayanad, Kerala",
        coordinates: [11.6854, 76.1320]
    },
    {
        name: "Idukki, Kerala",
        coordinates: [9.9189, 76.9685]
    },
    {
        name: "Nilgiris, Tamil Nadu",
        coordinates: [11.4102, 76.6950]
    },
    {
        name: "Darjeeling, West Bengal",
        coordinates: [27.0410, 88.2663]
    }
];

let currentLocationIndex = 0;
let currentLocation = monitoringLocations[0];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    
    initMaps();
    initChart();
    
    // Initial sensor data load without changing location
    loadInitialSensorData();
    
function loadInitialSensorData() {
    fetch('/sensor-data')
        .then(res => res.json())
        .then(data => {

            document.getElementById('env-rain').textContent = data.rainfall;
            document.getElementById('env-moist').textContent = data.soil_moisture;
            document.getElementById('env-slope').textContent = data.slope;
            document.getElementById('env-temp').textContent = data.temperature;
            document.getElementById('env-hum').textContent = data.humidity;

            document.getElementById('input-rain').value = data.rainfall;
            document.getElementById('input-moist').value = data.soil_moisture;
            document.getElementById('input-slope').value = data.slope;
            document.getElementById('input-temp').value = data.temperature;
            document.getElementById('input-hum').value = data.humidity;
            document.getElementById('input-elev').value = data.elevation;

            // Keep initial location as Kodagu
            document.querySelectorAll('.location-display').forEach(el => {
                el.textContent = currentLocation.name;
            });

            updateMapRisk(currentRiskLevel);
        })
        .catch(err => console.error("Error fetching initial sensor data", err));
}
    
    // Setup Sidebar Nav
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// SPA Navigation
function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active-section');
    });
    document.getElementById('sec-' + sectionId).classList.add('active-section');
    
    // Resize maps if they were hidden
    if(sectionId === 'map' && mainMap) {
        setTimeout(() => mainMap.invalidateSize(), 100);
    }
    if(sectionId === 'dashboard' && previewMap) {
        setTimeout(() => previewMap.invalidateSize(), 100);
    }
}

// Time Updates
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    document.getElementById('current-time').textContent = timeStr;
    document.querySelectorAll('.current-time-display').forEach(el => el.textContent = timeStr);
}

// Initialize Maps
function initMaps() {
    // Kodagu, Karnataka coordinates
    const center = [12.3375, 75.8069];
    
    // Preview Map (Dashboard)
    previewMap = L.map('map-preview', {
        zoomControl: false,
        attributionControl: false
    }).setView(center, 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(previewMap);
    
    // Main Map (Map Monitor)
    mainMap = L.map('main-map').setView(center, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(mainMap);
    
    updateMapRisk('LOW');
}

let mapLayerGroupMain = L.layerGroup();
let mapLayerGroupPrev = L.layerGroup();

function updateMapRisk(level) {
    const center = currentLocation.coordinates;
    const locationName = currentLocation.name;

    if(mainMap) {
        mapLayerGroupMain.clearLayers();
        mapLayerGroupMain.addTo(mainMap);
    }

    if(previewMap) {
        mapLayerGroupPrev.clearLayers();
        mapLayerGroupPrev.addTo(previewMap);
    }

    let color = '#10b981'; // LOW
    if(level === 'MEDIUM') color = '#f59e0b';
    if(level === 'HIGH') color = '#ef4444';

    const radius = level === 'HIGH' ? 8000 : 5000;

    const circleMain = L.circle(center, {
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        radius: radius
    }).bindPopup(
        `<b>Location:</b> ${locationName}<br><b>Risk Status:</b> ${level}`
    );

    const circlePrev = L.circle(center, {
        color: color,
        fillColor: color,
        fillOpacity: 0.4,
        radius: radius
    });

    mapLayerGroupMain.addLayer(circleMain);
    mapLayerGroupPrev.addLayer(circlePrev);

    // Move both maps to the new monitoring location
    if(mainMap) {
        mainMap.setView(center, 11);
    }

    if(previewMap) {
        previewMap.setView(center, 10);
    }
}

// Initialize Chart
function initChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#334155';
    
    forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Now', '+6h', '+12h', '+18h', '+24h'],
            datasets: [{
                label: 'Risk Escalation (%)',
                data: [0, 0, 0, 0, 0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateChart(currentProb, level) {
    let forecast = [currentProb];
    
    // Simulate escalation based on risk level
    if(level === 'HIGH') {
        forecast.push(Math.min(currentProb + 5, 100));
        forecast.push(Math.min(currentProb + 12, 100));
        forecast.push(Math.min(currentProb + 18, 100));
        forecast.push(Math.min(currentProb + 25, 100));
        forecastChart.data.datasets[0].borderColor = '#ef4444';
        forecastChart.data.datasets[0].backgroundColor = 'rgba(239, 68, 68, 0.2)';
    } else if(level === 'MEDIUM') {
        forecast.push(Math.min(currentProb + 3, 100));
        forecast.push(Math.min(currentProb + 8, 100));
        forecast.push(Math.min(currentProb + 14, 100));
        forecast.push(Math.min(currentProb + 20, 100));
        forecastChart.data.datasets[0].borderColor = '#f59e0b';
        forecastChart.data.datasets[0].backgroundColor = 'rgba(245, 158, 11, 0.2)';
    } else {
        forecast.push(Math.max(currentProb - 2, 0));
        forecast.push(Math.max(currentProb - 5, 0));
        forecast.push(Math.max(currentProb - 5, 0));
        forecast.push(Math.max(currentProb - 8, 0));
        forecastChart.data.datasets[0].borderColor = '#10b981';
        forecastChart.data.datasets[0].backgroundColor = 'rgba(16, 185, 129, 0.2)';
    }
    
    forecastChart.data.datasets[0].data = forecast;
    forecastChart.update();
}


// Demo Scenarios
function loadScenario(type) {
    if (type === 'low') {
        document.getElementById('input-rain').value = 10;
        document.getElementById('input-moist').value = 30;
        document.getElementById('input-slope').value = 15;
    } else if (type === 'medium') {
        document.getElementById('input-rain').value = 80;
        document.getElementById('input-moist').value = 65;
        document.getElementById('input-slope').value = 30;
    } else if (type === 'high') {
        document.getElementById('input-rain').value = 210;
        document.getElementById('input-moist').value = 92;
        document.getElementById('input-slope').value = 45;
    }
    submitPrediction();
}

// Fetch Sensor Data (Simulated)
function fetchSensorData() {

    // Move to the next monitoring location
    currentLocationIndex =
        (currentLocationIndex + 1) % monitoringLocations.length;

    currentLocation = monitoringLocations[currentLocationIndex];

    fetch('/sensor-data')
        .then(res => res.json())
        .then(data => {

            // Update Dashboard environmental parameters
            document.getElementById('env-rain').textContent = data.rainfall;
            document.getElementById('env-moist').textContent = data.soil_moisture;
            document.getElementById('env-slope').textContent = data.slope;
            document.getElementById('env-temp').textContent = data.temperature;
            document.getElementById('env-hum').textContent = data.humidity;

            // Populate prediction inputs
            document.getElementById('input-rain').value = data.rainfall;
            document.getElementById('input-moist').value = data.soil_moisture;
            document.getElementById('input-slope').value = data.slope;
            document.getElementById('input-temp').value = data.temperature;
            document.getElementById('input-hum').value = data.humidity;
            document.getElementById('input-elev').value = data.elevation;

            // Update location text on dashboard
            const locationElements =
                document.querySelectorAll('.location-display');

            locationElements.forEach(el => {
                el.textContent = currentLocation.name;
            });

            // Update the map
            updateMapRisk(currentRiskLevel);

            console.log(
                "Sensor update:",
                currentLocation.name
            );
        })
        .catch(err =>
            console.error("Error fetching sensor data", err)
        );
}
// Submit Prediction
function submitPrediction() {
    const data = {
        rainfall: document.getElementById('input-rain').value,
        soil_moisture: document.getElementById('input-moist').value,
        slope: document.getElementById('input-slope').value,
        temperature: document.getElementById('input-temp').value,
        humidity: document.getElementById('input-hum').value,
        elevation: document.getElementById('input-elev').value
    };

    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if(result.error) {
            alert("Error: " + result.error);
            return;
        }
        
        currentRiskLevel = result.level;
        currentRiskProb = result.probability;
        
        updateUI(result);
    })
    .catch(err => console.error("Error in prediction", err));
}

function updateUI(result) {
    // 1. Update Colors and Text
    let colorClass = 'text-success';
    let progressBg = 'bg-success';
    let warningIcon = 'fa-shield-check text-success';
    let warningTitle = 'Status Normal';
    let warningText = 'No immediate threats detected.';
    let showAlert = false;
    
    if (result.level === 'MEDIUM') {
        colorClass = 'text-warning';
        progressBg = 'bg-warning';
        warningIcon = 'fa-triangle-exclamation text-warning';
        warningTitle = 'ELEVATED RISK';
        warningText = 'Conditions are deteriorating. Monitor situation closely.';
    } else if (result.level === 'HIGH') {
        colorClass = 'text-danger';
        progressBg = 'bg-danger';
        warningIcon = 'fa-skull-crossbones text-danger';
        warningTitle = 'LANDSLIDE WARNING';
        warningText = 'Residents in the identified high-risk zone should follow local disaster-management instructions and move to safer areas when officially advised.';
        showAlert = true;
    }

    // Header Alert
    const headerAlert = document.getElementById('header-alert');
    if(showAlert && document.getElementById('alertToggle').checked) {
        headerAlert.style.display = 'inline-block';
    } else {
        headerAlert.style.display = 'none';
    }

    // Dashboard Risk Card
    const levelDisplay = document.getElementById('risk-display-level');
    levelDisplay.textContent = result.level;
    levelDisplay.className = `display-3 fw-bold risk-text ${colorClass}`;
    
    document.getElementById('risk-display-prob').textContent = result.probability;
    
    const progressBar = document.getElementById('risk-progress');
    progressBar.style.width = `${result.probability}%`;
    progressBar.className = `progress-bar ${progressBg}`;

    // Prediction Result Card
    const predLevel = document.getElementById('pred-result-level');
    predLevel.textContent = `Level: ${result.level}`;
    predLevel.className = `risk-text mt-3 ${colorClass}`;
    
    const predProb = document.getElementById('pred-result-prob');
    predProb.textContent = `${result.probability}%`;
    predProb.className = `display-1 fw-bold risk-text ${colorClass}`;

    // Early Warning Card
    document.getElementById('warning-content').innerHTML = `
        <i class="fa-solid ${warningIcon}" style="font-size: 3rem;"></i>
        <h4 class="mt-3 ${colorClass}">${warningTitle}</h4>
        <p>${warningText}</p>
    `;
    
    document.getElementById('warning-actions').style.display = result.level === 'HIGH' ? 'block' : 'none';

    // Map Update
    updateMapRisk(result.level);
    
    // Chart Update
    updateChart(result.probability, result.level);
    
    // Explainability Update
    const explainContainer = document.getElementById('explainability-container');
    explainContainer.innerHTML = '';
    
    if (result.factors && result.factors.length > 0) {
        result.factors.forEach(f => {
            // Determine color of bar based on contribution
            let barColor = 'bg-info';
            if (f.contribution > 30) barColor = 'bg-danger';
            else if (f.contribution > 15) barColor = 'bg-warning';
            
            const html = `
                <div class="explain-bar-container">
                    <div class="explain-label">
                        <strong>${f.name}</strong>
                        <span>${f.contribution}%</span>
                    </div>
                    <div class="explain-progress">
                        <div class="explain-fill ${barColor}" style="width: ${f.contribution}%"></div>
                    </div>
                    <div class="explain-desc">${f.description}</div>
                </div>
            `;
            explainContainer.innerHTML += html;
        });
    } else {
        explainContainer.innerHTML = '<p class="text-muted">Insufficient data for explanation.</p>';
    }
}

// Communication Resilience Simulation
function simulateNetworkFailure() {
    fetch('/simulate-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fail' })
    })
    .then(res => res.json())
    .then(status => {
        updateNetworkUI(status);
        document.getElementById('btn-sim-fail').style.display = 'none';
        document.getElementById('btn-sim-restore').style.display = 'block';
        document.getElementById('mesh-alert-message').style.display = 'block';
    });
}

function restoreNetwork() {
    fetch('/simulate-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' })
    })
    .then(res => res.json())
    .then(status => {
        updateNetworkUI(status);
        document.getElementById('btn-sim-fail').style.display = 'block';
        document.getElementById('btn-sim-restore').style.display = 'none';
        document.getElementById('mesh-alert-message').style.display = 'none';
    });
}

function updateNetworkUI(status) {
    const iconInt = document.getElementById('icon-internet');
    const textInt = document.getElementById('status-internet');
    const panelInt = document.getElementById('comm-internet-status');
    
    if (status.internet === 'UNAVAILABLE') {
        iconInt.className = 'fa-solid fa-wifi-slash text-danger';
        textInt.textContent = 'Failed';
        textInt.className = 'status-inactive';
        
        panelInt.className = 'alert alert-danger mt-2';
        panelInt.innerHTML = '<i class="fa-solid fa-xmark-circle"></i> Status: UNAVAILABLE';
    } else {
        iconInt.className = 'fa-solid fa-wifi text-light';
        textInt.textContent = 'Active';
        textInt.className = 'status-active';
        
        panelInt.className = 'alert alert-success mt-2';
        panelInt.innerHTML = '<i class="fa-solid fa-check-circle"></i> Status: ACTIVE';
    }
}

// Report Generation
function generateReport() {
    document.getElementById('report-output').style.display = 'block';
    
    document.getElementById('report-risk-level').textContent = `${currentRiskLevel} (${currentRiskProb}%)`;
    
    document.getElementById('rep-rain').textContent = document.getElementById('input-rain').value + ' mm';
    document.getElementById('rep-moist').textContent = document.getElementById('input-moist').value + ' %';
    document.getElementById('rep-slope').textContent = document.getElementById('input-slope').value + ' °';
    
    const intStatus = document.getElementById('status-internet').textContent;
    document.getElementById('report-comm-status').textContent = `Internet: ${intStatus}, Mesh: Active`;
    
    // Copy factors
    const explainHTML = document.getElementById('explainability-container').innerHTML;
    document.getElementById('report-factors').innerHTML = explainHTML;
    
    // Jump to bottom
    window.scrollTo(0, document.body.scrollHeight);
}
