// ============================================================
// GLOBAL STATE
// ============================================================

let currentRiskLevel = 'LOW';
let currentRiskProb = 0;

let mainMap = null;
let previewMap = null;
let forecastChart = null;


// ============================================================
// SIMULATED MONITORING LOCATIONS
// ============================================================

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


// Initial location = Kodagu
let currentLocationIndex = 0;
let currentLocation = monitoringLocations[0];


// ============================================================
// DOM LOADED
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    updateTime();

    setInterval(updateTime, 1000);

    initMaps();

    initChart();

    // Load sensor values without changing Kodagu
    loadInitialSensorData();

    // Fix all text colors
    fixPredictionFormColors();


    // ========================================================
    // SIDEBAR NAVIGATION
    // ========================================================

    document.querySelectorAll('.sidebar .nav-link').forEach(link => {

        link.addEventListener('click', function(e) {

            e.preventDefault();

            document
                .querySelectorAll('.sidebar .nav-link')
                .forEach(l => {
                    l.classList.remove('active');
                });

            this.classList.add('active');

        });

    });

});


// ============================================================
// FIX TEXT COLORS
// ============================================================

function fixPredictionFormColors() {

    const style = document.createElement('style');

    style.textContent = `

        /* =====================================================
           RISK PREDICTION PAGE
           ===================================================== */

        #sec-prediction label,
        #sec-prediction .form-label,
        #sec-prediction .form-check-label {
            color: #ffffff !important;
            font-weight: 600 !important;
            opacity: 1 !important;
        }

        #sec-prediction input,
        #sec-prediction select,
        #sec-prediction textarea {
            color: #111827 !important;
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
        }

        #sec-prediction input::placeholder,
        #sec-prediction textarea::placeholder {
            color: #64748b !important;
            opacity: 1 !important;
        }

        #sec-prediction h1,
        #sec-prediction h2,
        #sec-prediction h3,
        #sec-prediction h4,
        #sec-prediction h5,
        #sec-prediction h6 {
            color: #ffffff !important;
        }


        /* =====================================================
           COMMUNICATION PAGE
           ===================================================== */

        #sec-communication,
        #sec-communication p,
        #sec-communication span,
        #sec-communication strong,
        #sec-communication label {
            color: #ffffff !important;
        }

        #sec-communication h1,
        #sec-communication h2,
        #sec-communication h3,
        #sec-communication h4,
        #sec-communication h5,
        #sec-communication h6 {
            color: #ffffff !important;
            font-weight: 700 !important;
        }

        #sec-communication .card-header {
            color: #ffffff !important;
            font-weight: 700 !important;
        }

        #sec-communication .card-body {
            color: #ffffff !important;
        }

        #sec-communication button {
            color: #ffffff !important;
            font-weight: 700 !important;
        }


        /* Red network status box */
        #sec-communication .alert-danger {
            color: #991b1b !important;
            background-color: #fee2e2 !important;
        }

        #sec-communication .alert-danger * {
            color: #991b1b !important;
        }


        /* Green network status box */
        #sec-communication .alert-success {
            color: #166534 !important;
            background-color: #dcfce7 !important;
        }

        #sec-communication .alert-success * {
            color: #166534 !important;
        }


        /* =====================================================
           SETTINGS PAGE
           ===================================================== */

        #sec-settings {
            color: #ffffff !important;
        }

        #sec-settings p,
        #sec-settings span,
        #sec-settings label,
        #sec-settings strong,
        #sec-settings small {
            color: #ffffff !important;
        }

        #sec-settings h1,
        #sec-settings h2,
        #sec-settings h3,
        #sec-settings h4,
        #sec-settings h5,
        #sec-settings h6 {
            color: #ffffff !important;
            font-weight: 700 !important;
        }

        #sec-settings .card-header {
            color: #ffffff !important;
            font-weight: 700 !important;
        }

        #sec-settings .card-body {
            color: #ffffff !important;
        }

        #sec-settings .form-label,
        #sec-settings .form-check-label {
            color: #ffffff !important;
            font-weight: 600 !important;
        }

        #sec-settings .text-muted {
            color: #cbd5e1 !important;
        }

        #sec-settings input:not([type="checkbox"]):not([type="radio"]),
        #sec-settings select,
        #sec-settings textarea {
            color: #111827 !important;
            background-color: #ffffff !important;
            border: 1px solid #cbd5e1 !important;
        }

        #sec-settings input::placeholder,
        #sec-settings textarea::placeholder {
            color: #64748b !important;
        }

        #sec-settings input[type="checkbox"],
        #sec-settings input[type="radio"] {
            accent-color: #3b82f6 !important;
        }

        #sec-settings button {
            color: #ffffff !important;
            font-weight: 600 !important;
        }


        /* =====================================================
           GENERAL DARK THEME TEXT
           ===================================================== */

        .bg-panel,
        .bg-panel p,
        .bg-panel span,
        .bg-panel label,
        .bg-panel strong {
            color: #ffffff !important;
        }

    `;

    document.head.appendChild(style);

}


// ============================================================
// INITIAL SENSOR DATA
// ============================================================

function loadInitialSensorData() {

    fetch('/sensor-data')

        .then(res => res.json())

        .then(data => {

            // Environmental values

            const envRain =
                document.getElementById('env-rain');

            const envMoist =
                document.getElementById('env-moist');

            const envSlope =
                document.getElementById('env-slope');

            const envTemp =
                document.getElementById('env-temp');

            const envHum =
                document.getElementById('env-hum');


            if (envRain)
                envRain.textContent = data.rainfall;

            if (envMoist)
                envMoist.textContent = data.soil_moisture;

            if (envSlope)
                envSlope.textContent = data.slope;

            if (envTemp)
                envTemp.textContent = data.temperature;

            if (envHum)
                envHum.textContent = data.humidity;


            // Prediction inputs

            const inputRain =
                document.getElementById('input-rain');

            const inputMoist =
                document.getElementById('input-moist');

            const inputSlope =
                document.getElementById('input-slope');

            const inputTemp =
                document.getElementById('input-temp');

            const inputHum =
                document.getElementById('input-hum');

            const inputElev =
                document.getElementById('input-elev');


            if (inputRain)
                inputRain.value = data.rainfall;

            if (inputMoist)
                inputMoist.value = data.soil_moisture;

            if (inputSlope)
                inputSlope.value = data.slope;

            if (inputTemp)
                inputTemp.value = data.temperature;

            if (inputHum)
                inputHum.value = data.humidity;

            if (inputElev)
                inputElev.value = data.elevation;


            // Keep initial location as Kodagu

            document
                .querySelectorAll('.location-display')
                .forEach(el => {

                    el.textContent =
                        currentLocation.name;

                });


            // Update map

            updateMapRisk(currentRiskLevel);

        })

        .catch(err => {

            console.error(
                'Error fetching initial sensor data',
                err
            );

        });

}


// ============================================================
// SPA NAVIGATION
// ============================================================

function showSection(sectionId) {

    document
        .querySelectorAll('.view-section')
        .forEach(sec => {

            sec.classList.remove('active-section');

        });


    const section =
        document.getElementById(
            'sec-' + sectionId
        );


    if (section) {

        section.classList.add(
            'active-section'
        );

    }


    // Resize maps when displayed

    if (
        sectionId === 'map' &&
        mainMap
    ) {

        setTimeout(() => {

            mainMap.invalidateSize();

        }, 100);

    }


    if (
        sectionId === 'dashboard' &&
        previewMap
    ) {

        setTimeout(() => {

            previewMap.invalidateSize();

        }, 100);

    }

}


// ============================================================
// TIME
// ============================================================

function updateTime() {

    const now = new Date();


    const timeStr =
        now.toLocaleTimeString(
            [],
            {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        );


    const currentTime =
        document.getElementById(
            'current-time'
        );


    if (currentTime) {

        currentTime.textContent =
            timeStr;

    }


    document
        .querySelectorAll(
            '.current-time-display'
        )
        .forEach(el => {

            el.textContent =
                timeStr;

        });

}


// ============================================================
// INITIALIZE MAPS
// ============================================================

function initMaps() {

    // Initial location = Kodagu

    const center =
        currentLocation.coordinates;


    // ========================================================
    // PREVIEW MAP
    // ========================================================

    const previewElement =
        document.getElementById(
            'map-preview'
        );


    if (previewElement) {

        previewMap =
            L.map(
                'map-preview',
                {
                    zoomControl: false,
                    attributionControl: false
                }
            ).setView(
                center,
                10
            );


        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ).addTo(previewMap);

    }


    // ========================================================
    // MAIN MAP
    // ========================================================

    const mainElement =
        document.getElementById(
            'main-map'
        );


    if (mainElement) {

        mainMap =
            L.map(
                'main-map'
            ).setView(
                center,
                11
            );


        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution:
                    '© OpenStreetMap contributors'
            }
        ).addTo(mainMap);

    }


    updateMapRisk('LOW');

}


// ============================================================
// MAP LAYERS
// ============================================================

let mapLayerGroupMain =
    L.layerGroup();

let mapLayerGroupPrev =
    L.layerGroup();


// ============================================================
// UPDATE MAP RISK
// ============================================================

function updateMapRisk(level) {

    const center =
        currentLocation.coordinates;


    const locationName =
        currentLocation.name;


    // Clear old layers

    if (mainMap) {

        mapLayerGroupMain.clearLayers();

        mapLayerGroupMain.addTo(
            mainMap
        );

    }


    if (previewMap) {

        mapLayerGroupPrev.clearLayers();

        mapLayerGroupPrev.addTo(
            previewMap
        );

    }


    // Risk color

    let color =
        '#10b981';


    if (level === 'MEDIUM') {

        color =
            '#f59e0b';

    }


    if (level === 'HIGH') {

        color =
            '#ef4444';

    }


    // Risk radius

    const radius =
        level === 'HIGH'
            ? 8000
            : 5000;


    // Main map circle

    const circleMain =
        L.circle(
            center,
            {
                color: color,
                fillColor: color,
                fillOpacity: 0.4,
                radius: radius
            }
        ).bindPopup(

            `<b>Location:</b> ${locationName}<br>
             <b>Risk Status:</b> ${level}`

        );


    // Preview map circle

    const circlePrev =
        L.circle(
            center,
            {
                color: color,
                fillColor: color,
                fillOpacity: 0.4,
                radius: radius
            }
        );


    // Add layers

    mapLayerGroupMain.addLayer(
        circleMain
    );

    mapLayerGroupPrev.addLayer(
        circlePrev
    );


    // Move main map

    if (mainMap) {

        mainMap.setView(
            center,
            11
        );

    }


    // Move preview map

    if (previewMap) {

        previewMap.setView(
            center,
            10
        );

    }

}


// ============================================================
// INITIALIZE CHART
// ============================================================

function initChart() {

    const chartElement =
        document.getElementById(
            'forecastChart'
        );


    if (!chartElement) {

        return;

    }


    const ctx =
        chartElement.getContext('2d');


    Chart.defaults.color =
        '#94a3b8';


    Chart.defaults.borderColor =
        '#334155';


    forecastChart =
        new Chart(
            ctx,
            {

                type: 'line',

                data: {

                    labels: [
                        'Now',
                        '+6h',
                        '+12h',
                        '+18h',
                        '+24h'
                    ],

                    datasets: [

                        {

                            label:
                                'Risk Escalation (%)',

                            data: [
                                0,
                                0,
                                0,
                                0,
                                0
                            ],

                            borderColor:
                                '#3b82f6',

                            backgroundColor:
                                'rgba(59, 130, 246, 0.2)',

                            borderWidth: 2,

                            fill: true,

                            tension: 0.4

                        }

                    ]

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

            }
        );

}


// ============================================================
// UPDATE CHART
// ============================================================

function updateChart(
    currentProb,
    level
) {

    if (!forecastChart) {

        return;

    }


    let forecast = [
        currentProb
    ];


    // HIGH RISK

    if (level === 'HIGH') {

        forecast.push(
            Math.min(
                currentProb + 5,
                100
            )
        );

        forecast.push(
            Math.min(
                currentProb + 12,
                100
            )
        );

        forecast.push(
            Math.min(
                currentProb + 18,
                100
            )
        );

        forecast.push(
            Math.min(
                currentProb + 25,
                100
            )
        );


        forecastChart.data.datasets[0]
            .borderColor =
            '#ef4444';


        forecastChart.data.datasets[0]
            .backgroundColor =
            'rgba(239, 68, 68, 0.2)';

    }


    // MEDIUM RISK

    else if (level === 'MEDIUM') {

        forecast.push(
            Math.min(
                currentProb + 3,
                100
            )
        );

        forecast.push(
            Math.min(
                currentProb + 8,
                100
            )
        );

        forecast.push(
            Math.min(
                currentProb + 14,
                100
            )
        );

        forecast.push(
            Math.min(
                currentProb + 20,
                100
            )
        );


        forecastChart.data.datasets[0]
            .borderColor =
            '#f59e0b';


        forecastChart.data.datasets[0]
            .backgroundColor =
            'rgba(245, 158, 11, 0.2)';

    }


    // LOW RISK

    else {

        forecast.push(
            Math.max(
                currentProb - 2,
                0
            )
        );

        forecast.push(
            Math.max(
                currentProb - 5,
                0
            )
        );

        forecast.push(
            Math.max(
                currentProb - 5,
                0
            )
        );

        forecast.push(
            Math.max(
                currentProb - 8,
                0
            )
        );


        forecastChart.data.datasets[0]
            .borderColor =
            '#10b981';


        forecastChart.data.datasets[0]
            .backgroundColor =
            'rgba(16, 185, 129, 0.2)';

    }


    forecastChart.data.datasets[0]
        .data = forecast;


    forecastChart.update();

}


// ============================================================
// DEMO SCENARIOS
// ============================================================

function loadScenario(type) {

    if (type === 'low') {

        document.getElementById(
            'input-rain'
        ).value = 10;

        document.getElementById(
            'input-moist'
        ).value = 30;

        document.getElementById(
            'input-slope'
        ).value = 15;

    }


    else if (type === 'medium') {

        document.getElementById(
            'input-rain'
        ).value = 80;

        document.getElementById(
            'input-moist'
        ).value = 65;

        document.getElementById(
            'input-slope'
        ).value = 30;

    }


    else if (type === 'high') {

        document.getElementById(
            'input-rain'
        ).value = 210;

        document.getElementById(
            'input-moist'
        ).value = 92;

        document.getElementById(
            'input-slope'
        ).value = 45;

    }


    submitPrediction();

}


// ============================================================
// SIMULATE SENSOR UPDATE
// ============================================================

function fetchSensorData() {

    // ========================================================
    // MOVE TO NEXT LOCATION
    // ========================================================

    currentLocationIndex =
        (currentLocationIndex + 1)
        % monitoringLocations.length;


    currentLocation =
        monitoringLocations[
            currentLocationIndex
        ];


    fetch('/sensor-data')

        .then(res => res.json())

        .then(data => {

            // =================================================
            // ENVIRONMENTAL VALUES
            // =================================================

            const envRain =
                document.getElementById(
                    'env-rain'
                );

            const envMoist =
                document.getElementById(
                    'env-moist'
                );

            const envSlope =
                document.getElementById(
                    'env-slope'
                );

            const envTemp =
                document.getElementById(
                    'env-temp'
                );

            const envHum =
                document.getElementById(
                    'env-hum'
                );


            if (envRain)
                envRain.textContent =
                    data.rainfall;


            if (envMoist)
                envMoist.textContent =
                    data.soil_moisture;


            if (envSlope)
                envSlope.textContent =
                    data.slope;


            if (envTemp)
                envTemp.textContent =
                    data.temperature;


            if (envHum)
                envHum.textContent =
                    data.humidity;


            // =================================================
            // PREDICTION INPUTS
            // =================================================

            document.getElementById(
                'input-rain'
            ).value =
                data.rainfall;


            document.getElementById(
                'input-moist'
            ).value =
                data.soil_moisture;


            document.getElementById(
                'input-slope'
            ).value =
                data.slope;


            document.getElementById(
                'input-temp'
            ).value =
                data.temperature;


            document.getElementById(
                'input-hum'
            ).value =
                data.humidity;


            document.getElementById(
                'input-elev'
            ).value =
                data.elevation;


            // =================================================
            // LOCATION TEXT
            // =================================================

            document
                .querySelectorAll(
                    '.location-display'
                )
                .forEach(el => {

                    el.textContent =
                        currentLocation.name;

                });


            // =================================================
            // UPDATE MAP
            // =================================================

            updateMapRisk(
                currentRiskLevel
            );


            console.log(
                'Sensor update:',
                currentLocation.name
            );

        })


        .catch(err => {

            console.error(
                'Error fetching sensor data',
                err
            );

        });

}


// ============================================================
// SUBMIT PREDICTION
// ============================================================

function submitPrediction() {

    const data = {

        rainfall:
            document.getElementById(
                'input-rain'
            ).value,

        soil_moisture:
            document.getElementById(
                'input-moist'
            ).value,

        slope:
            document.getElementById(
                'input-slope'
            ).value,

        temperature:
            document.getElementById(
                'input-temp'
            ).value,

        humidity:
            document.getElementById(
                'input-hum'
            ).value,

        elevation:
            document.getElementById(
                'input-elev'
            ).value

    };


    fetch(
        '/predict',
        {

            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body:
                JSON.stringify(data)

        }
    )


    .then(res => res.json())


    .then(result => {

        if (result.error) {

            alert(
                'Error: ' +
                result.error
            );

            return;

        }


        // Update global risk

        currentRiskLevel =
            result.level;


        currentRiskProb =
            result.probability;


        // Update UI

        updateUI(result);

    })


    .catch(err => {

        console.error(
            'Error in prediction',
            err
        );

    });

}


// ============================================================
// UPDATE UI
// ============================================================

function updateUI(result) {

    // Default LOW risk

    let colorClass =
        'text-success';


    let progressBg =
        'bg-success';


    let warningIcon =
        'fa-shield-check text-success';


    let warningTitle =
        'Status Normal';


    let warningText =
        'No immediate threats detected.';


    let showAlert =
        false;


    // ========================================================
    // MEDIUM
    // ========================================================

    if (result.level === 'MEDIUM') {

        colorClass =
            'text-warning';


        progressBg =
            'bg-warning';


        warningIcon =
            'fa-triangle-exclamation text-warning';


        warningTitle =
            'ELEVATED RISK';


        warningText =
            'Conditions are deteriorating. Monitor situation closely.';

    }


    // ========================================================
    // HIGH
    // ========================================================

    else if (result.level === 'HIGH') {

        colorClass =
            'text-danger';


        progressBg =
            'bg-danger';


        warningIcon =
            'fa-skull-crossbones text-danger';


        warningTitle =
            'LANDSLIDE WARNING';


        warningText =
            'Residents in the identified high-risk zone should follow local disaster-management instructions and move to safer areas when officially advised.';


        showAlert =
            true;

    }


    // ========================================================
    // HEADER ALERT
    // ========================================================

    const headerAlert =
        document.getElementById(
            'header-alert'
        );


    const alertToggle =
        document.getElementById(
            'alertToggle'
        );


    if (
        headerAlert &&
        alertToggle &&
        showAlert &&
        alertToggle.checked
    ) {

        headerAlert.style.display =
            'inline-block';

    }

    else if (headerAlert) {

        headerAlert.style.display =
            'none';

    }


    // ========================================================
    // DASHBOARD RISK CARD
    // ========================================================

    const levelDisplay =
        document.getElementById(
            'risk-display-level'
        );


    if (levelDisplay) {

        levelDisplay.textContent =
            result.level;


        levelDisplay.className =
            `display-3 fw-bold risk-text ${colorClass}`;

    }


    const riskProb =
        document.getElementById(
            'risk-display-prob'
        );


    if (riskProb) {

        riskProb.textContent =
            result.probability;

    }


    const progressBar =
        document.getElementById(
            'risk-progress'
        );


    if (progressBar) {

        progressBar.style.width =
            `${result.probability}%`;


        progressBar.className =
            `progress-bar ${progressBg}`;

    }


    // ========================================================
    // PREDICTION RESULT
    // ========================================================

    const predLevel =
        document.getElementById(
            'pred-result-level'
        );


    if (predLevel) {

        predLevel.textContent =
            `Level: ${result.level}`;


        predLevel.className =
            `risk-text mt-3 ${colorClass}`;

    }


    const predProb =
        document.getElementById(
            'pred-result-prob'
        );


    if (predProb) {

        predProb.textContent =
            `${result.probability}%`;


        predProb.className =
            `display-1 fw-bold risk-text ${colorClass}`;

    }


    // ========================================================
    // EARLY WARNING
    // ========================================================

    const warningContent =
        document.getElementById(
            'warning-content'
        );


    if (warningContent) {

        warningContent.innerHTML = `

            <i
                class="fa-solid ${warningIcon}"
                style="font-size: 3rem;"
            ></i>

            <h4 class="mt-3 ${colorClass}">
                ${warningTitle}
            </h4>

            <p>
                ${warningText}
            </p>

        `;

    }


    const warningActions =
        document.getElementById(
            'warning-actions'
        );


    if (warningActions) {

        warningActions.style.display =
            result.level === 'HIGH'
                ? 'block'
                : 'none';

    }


    // ========================================================
    // MAP
    // ========================================================

    updateMapRisk(
        result.level
    );


    // ========================================================
    // CHART
    // ========================================================

    updateChart(
        result.probability,
        result.level
    );


    // ========================================================
    // EXPLAINABILITY
    // ========================================================

    const explainContainer =
        document.getElementById(
            'explainability-container'
        );


    if (!explainContainer) {

        return;

    }


    explainContainer.innerHTML =
        '';


    if (
        result.factors &&
        result.factors.length > 0
    ) {

        result.factors.forEach(f => {

            let barColor =
                'bg-info';


            if (
                f.contribution > 30
            ) {

                barColor =
                    'bg-danger';

            }

            else if (
                f.contribution > 15
            ) {

                barColor =
                    'bg-warning';

            }


            const html = `

                <div
                    class="explain-bar-container"
                >

                    <div class="explain-label">

                        <strong>
                            ${f.name}
                        </strong>

                        <span>
                            ${f.contribution}%
                        </span>

                    </div>


                    <div
                        class="explain-progress"
                    >

                        <div
                            class="explain-fill ${barColor}"
                            style="width: ${f.contribution}%"
                        ></div>

                    </div>


                    <div
                        class="explain-desc"
                    >

                        ${f.description}

                    </div>

                </div>

            `;


            explainContainer.innerHTML +=
                html;

        });

    }

    else {

        explainContainer.innerHTML =
            '<p class="text-muted">Insufficient data for explanation.</p>';

    }

}


// ============================================================
// SIMULATE NETWORK FAILURE
// ============================================================

function simulateNetworkFailure() {

    fetch(
        '/simulate-network',
        {

            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                action: 'fail'
            })

        }
    )


    .then(res => res.json())


    .then(status => {

        updateNetworkUI(status);


        const failButton =
            document.getElementById(
                'btn-sim-fail'
            );


        const restoreButton =
            document.getElementById(
                'btn-sim-restore'
            );


        const message =
            document.getElementById(
                'mesh-alert-message'
            );


        if (failButton) {

            failButton.style.display =
                'none';

        }


        if (restoreButton) {

            restoreButton.style.display =
                'block';

        }


        if (message) {

            message.style.display =
                'block';

        }

    })

    .catch(err => {

        console.error(
            'Network simulation error',
            err
        );

    });

}


// ============================================================
// RESTORE NETWORK
// ============================================================

function restoreNetwork() {

    fetch(
        '/simulate-network',
        {

            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                action: 'restore'
            })

        }
    )


    .then(res => res.json())


    .then(status => {

        updateNetworkUI(status);


        const failButton =
            document.getElementById(
                'btn-sim-fail'
            );


        const restoreButton =
            document.getElementById(
                'btn-sim-restore'
            );


        const message =
            document.getElementById(
                'mesh-alert-message'
            );


        if (failButton) {

            failButton.style.display =
                'block';

        }


        if (restoreButton) {

            restoreButton.style.display =
                'none';

        }


        if (message) {

            message.style.display =
                'none';

        }

    })

    .catch(err => {

        console.error(
            'Network restore error',
            err
        );

    });

}


// ============================================================
// UPDATE NETWORK UI
// ============================================================

function updateNetworkUI(status) {

    const iconInt =
        document.getElementById(
            'icon-internet'
        );


    const textInt =
        document.getElementById(
            'status-internet'
        );


    const panelInt =
        document.getElementById(
            'comm-internet-status'
        );


    if (
        !iconInt ||
        !textInt ||
        !panelInt
    ) {

        return;

    }


    // ========================================================
    // INTERNET UNAVAILABLE
    // ========================================================

    if (
        status.internet ===
        'UNAVAILABLE'
    ) {

        iconInt.className =
            'fa-solid fa-wifi-slash text-danger';


        textInt.textContent =
            'Failed';


        textInt.className =
            'status-inactive';


        panelInt.className =
            'alert alert-danger mt-2';


        panelInt.innerHTML = `

            <i
                class="fa-solid fa-xmark-circle"
            ></i>

            Status: UNAVAILABLE

        `;

    }


    // ========================================================
    // INTERNET ACTIVE
    // ========================================================

    else {

        iconInt.className =
            'fa-solid fa-wifi text-light';


        textInt.textContent =
            'Active';


        textInt.className =
            'status-active';


        panelInt.className =
            'alert alert-success mt-2';


        panelInt.innerHTML = `

            <i
                class="fa-solid fa-check-circle"
            ></i>

            Status: ACTIVE

        `;

    }

}


// ============================================================
// GENERATE REPORT
// ============================================================

function generateReport() {

    const reportOutput =
        document.getElementById(
            'report-output'
        );


    if (reportOutput) {

        reportOutput.style.display =
            'block';

    }


    // ========================================================
    // RISK LEVEL
    // ========================================================

    const reportRisk =
        document.getElementById(
            'report-risk-level'
        );


    if (reportRisk) {

        reportRisk.textContent =
            `${currentRiskLevel} (${currentRiskProb}%)`;

    }


    // ========================================================
    // ENVIRONMENTAL VALUES
    // ========================================================

    const repRain =
        document.getElementById(
            'rep-rain'
        );


    const repMoist =
        document.getElementById(
            'rep-moist'
        );


    const repSlope =
        document.getElementById(
            'rep-slope'
        );


    const inputRain =
        document.getElementById(
            'input-rain'
        );


    const inputMoist =
        document.getElementById(
            'input-moist'
        );


    const inputSlope =
        document.getElementById(
            'input-slope'
        );


    if (
        repRain &&
        inputRain
    ) {

        repRain.textContent =
            inputRain.value + ' mm';

    }


    if (
        repMoist &&
        inputMoist
    ) {

        repMoist.textContent =
            inputMoist.value + ' %';

    }


    if (
        repSlope &&
        inputSlope
    ) {

        repSlope.textContent =
            inputSlope.value + ' °';

    }


    // ========================================================
    // COMMUNICATION STATUS
    // ========================================================

    const intStatus =
        document.getElementById(
            'status-internet'
        );


    const reportComm =
        document.getElementById(
            'report-comm-status'
        );


    if (
        intStatus &&
        reportComm
    ) {

        reportComm.textContent =
            `Internet: ${intStatus.textContent}, Mesh: Active`;

    }


    // ========================================================
    // LOCATION
    // ========================================================

    document
        .querySelectorAll(
            '.location-display'
        )
        .forEach(el => {

            el.textContent =
                currentLocation.name;

        });


    // ========================================================
    // COPY FACTORS
    // ========================================================

    const explainContainer =
        document.getElementById(
            'explainability-container'
        );


    const reportFactors =
        document.getElementById(
            'report-factors'
        );


    if (
        explainContainer &&
        reportFactors
    ) {

        reportFactors.innerHTML =
            explainContainer.innerHTML;

    }


    // ========================================================
    // SCROLL TO REPORT
    // ========================================================

    window.scrollTo({

        top:
            document.body.scrollHeight,

        behavior:
            'smooth'

    });

}