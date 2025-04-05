// Initialize variables
let is24HourFormat = false;
let isAnalogDisplay = false;
let currentTheme = 'default';
let stopwatchRunning = false;
let timerRunning = false;
let stopwatchInterval;
let timerInterval;
let stopwatchTime = 0;
let lapCount = 0;
let timerTime = 0;
let timerDuration = 0;
let alarmSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
let lastActiveMode = 'clock';

// DOM Elements
const formatBtn = document.getElementById('format-btn');
const displayToggleBtn = document.getElementById('display-toggle-btn');
const modeButtons = document.querySelectorAll('.mode-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const watchModes = document.querySelectorAll('.watch-mode');
const analogClock = document.querySelector('.analog-clock');

// Stopwatch Elements
const stopwatchStartBtn = document.getElementById('stopwatch-start');
const stopwatchResetBtn = document.getElementById('stopwatch-reset');
const stopwatchMinutes = document.getElementById('stopwatch-minutes');
const stopwatchSeconds = document.getElementById('stopwatch-seconds');
const stopwatchMs = document.getElementById('stopwatch-ms');
const lapList = document.getElementById('lap-list');

// Timer Elements
const timerSetBtn = document.getElementById('timer-set');
const timerStartBtn = document.getElementById('timer-start');
const timerResetBtn = document.getElementById('timer-reset');
const timerMinutesInput = document.getElementById('timer-minutes');
const timerSecondsInput = document.getElementById('timer-seconds');
const timerMinutesDisplay = document.getElementById('timer-minutes-display');
const timerSecondsDisplay = document.getElementById('timer-seconds-display');
const timerSetup = document.getElementById('timer-setup');
const timerDisplay = document.getElementById('timer-display');

// Create hour markers for analog clock
function createHourMarkers() {
    const markers = document.querySelector('.markers');
    markers.innerHTML = '';
    
    for (let i = 1; i <= 12; i++) {
        const marker = document.createElement('div');
        marker.className = 'hour-marker';
        marker.style.transform = `rotate(${i * 30}deg) translateX(-50%)`;
        markers.appendChild(marker);
    }
}

// Load saved preferences from local storage
function loadPreferences() {
    const savedTheme = localStorage.getItem('watchTheme');
    const savedFormat = localStorage.getItem('watchFormat');
    const savedDisplay = localStorage.getItem('watchDisplay');
    const savedMode = localStorage.getItem('watchMode');
    
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.className = `theme-${currentTheme}`;
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        });
    }
    
    if (savedFormat === 'true') {
        is24HourFormat = true;
        formatBtn.textContent = 'Switch to 12-hour format';
    }
    
    if (savedDisplay === 'true') {
        isAnalogDisplay = true;
        displayToggleBtn.textContent = 'Switch to Digital';
        toggleDisplayMode();
    }
    
    if (savedMode) {
        switchMode(savedMode);
    }
}

// Function to update the time
function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Format hours based on selected format
    if (!is24HourFormat) {
        // 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM
        document.getElementById('ampm').textContent = ampm;
        document.getElementById('ampm').style.display = 'inline';
    } else {
        // 24-hour format
        document.getElementById('ampm').style.display = 'none';
    }
    
    // Add leading zeros if needed
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    
    // Update the display
    document.getElementById('hours').textContent = formattedHours;
    document.getElementById('minutes').textContent = formattedMinutes;
    document.getElementById('seconds').textContent = formattedSeconds;
    
    // Update analog clock if in analog mode
    if (isAnalogDisplay) {
        updateAnalogClock(hours, minutes, seconds);
    }
}

// Function to update analog clock
function updateAnalogClock(hours, minutes, seconds) {
    // Calculate rotation angles
    const secondsDegrees = (seconds / 60) * 360;
    const minutesDegrees = ((minutes + seconds / 60) / 60) * 360;
    const hoursDegrees = ((hours % 12 + minutes / 60) / 12) * 360;
    
    // Update hand rotations
    document.querySelector('.second-hand').style.transform = `rotate(${secondsDegrees}deg)`;
    document.querySelector('.minute-hand').style.transform = `rotate(${minutesDegrees}deg)`;
    document.querySelector('.hour-hand').style.transform = `rotate(${hoursDegrees}deg)`;
}

// Function to update the date
function updateDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('date').textContent = dateString;
}

// Toggle between 12-hour and 24-hour formats
formatBtn.addEventListener('click', function() {
    is24HourFormat = !is24HourFormat;
    if (is24HourFormat) {
        formatBtn.textContent = 'Switch to 12-hour format';
    } else {
        formatBtn.textContent = 'Switch to 24-hour format';
    }
    localStorage.setItem('watchFormat', is24HourFormat);
    updateTime(); // Update immediately after format change
});

// Toggle between digital and analog display
displayToggleBtn.addEventListener('click', function() {
    toggleDisplayMode();
    localStorage.setItem('watchDisplay', isAnalogDisplay);
});

// Function to toggle display mode
function toggleDisplayMode() {
    isAnalogDisplay = !isAnalogDisplay;
    
    if (isAnalogDisplay) {
        displayToggleBtn.textContent = 'Switch to Digital';
        analogClock.classList.add('active');
        document.querySelector('.time-display').style.opacity = '0.3';
    } else {
        displayToggleBtn.textContent = 'Switch to Analog';
        analogClock.classList.remove('active');
        document.querySelector('.time-display').style.opacity = '1';
    }
}

// Switch between watch modes (clock, stopwatch, timer)
modeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const mode = this.dataset.mode;
        switchMode(mode);
        localStorage.setItem('watchMode', mode);
    });
});

// Function to switch between modes
function switchMode(mode) {
    // Save last active mode if switching from it
    if (lastActiveMode !== mode) {
        lastActiveMode = mode;
    }
    
    // Update active button
    modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Hide all modes first
    watchModes.forEach(watchMode => {
        watchMode.classList.remove('active');
    });
    
    // Show selected mode
    document.getElementById(`${mode}-mode`).classList.add('active');
}

// Theme switching
themeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const theme = this.dataset.theme;
        currentTheme = theme;
        
        // Update active button
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Apply theme
        document.body.className = `theme-${theme}`;
        
        // Save preference
        localStorage.setItem('watchTheme', theme);
    });
});

// Stopwatch functionality
stopwatchStartBtn.addEventListener('click', function() {
    if (!stopwatchRunning) {
        // Start stopwatch
        stopwatchRunning = true;
        this.textContent = 'Pause';
        this.classList.add('active');
        
        // Add lap button if not exists
        if (!document.getElementById('stopwatch-lap')) {
            const lapBtn = document.createElement('button');
            lapBtn.id = 'stopwatch-lap';
            lapBtn.textContent = 'Lap';
            lapBtn.addEventListener('click', addLap);
            document.querySelector('.stopwatch-controls').insertBefore(lapBtn, stopwatchResetBtn);
        }
        
        stopwatchInterval = setInterval(updateStopwatch, 10);
    } else {
        // Pause stopwatch
        stopwatchRunning = false;
        this.textContent = 'Resume';
        this.classList.remove('active');
        clearInterval(stopwatchInterval);
    }
});

// Reset stopwatch
stopwatchResetBtn.addEventListener('click', function() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    stopwatchTime = 0;
    updateStopwatchDisplay();
    stopwatchStartBtn.textContent = 'Start';
    stopwatchStartBtn.classList.remove('active');
    
    // Remove lap button
    const lapBtn = document.getElementById('stopwatch-lap');
    if (lapBtn) {
        lapBtn.remove();
    }
    
    // Clear lap list
    lapList.innerHTML = '';
    lapCount = 0;
});

// Update stopwatch
function updateStopwatch() {
    stopwatchTime += 10; // Increment by 10ms
    updateStopwatchDisplay();
}

// Update stopwatch display
function updateStopwatchDisplay() {
    const ms = Math.floor((stopwatchTime % 1000) / 10);
    const seconds = Math.floor((stopwatchTime / 1000) % 60);
    const minutes = Math.floor((stopwatchTime / (1000 * 60)) % 60);
    
    stopwatchMs.textContent = ms < 10 ? '0' + ms : ms;
    stopwatchSeconds.textContent = seconds < 10 ? '0' + seconds : seconds;
    stopwatchMinutes.textContent = minutes < 10 ? '0' + minutes : minutes;
}

// Add lap time
function addLap() {
    if (!stopwatchRunning) return;
    
    lapCount++;
    const lapTime = stopwatchTime;
    const ms = Math.floor((lapTime % 1000) / 10);
    const seconds = Math.floor((lapTime / 1000) % 60);
    const minutes = Math.floor((lapTime / (1000 * 60)) % 60);
    
    const formattedTime = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}:${ms < 10 ? '0' + ms : ms}`;
    
    const lapItem = document.createElement('li');
    lapItem.textContent = `Lap ${lapCount}: ${formattedTime}`;
    lapList.prepend(lapItem); // Add new lap at the top
    
    // Add highlight effect
    lapItem.classList.add('highlight');
    setTimeout(() => {
        lapItem.classList.remove('highlight');
    }, 500);
}

// Timer functionality
timerSetBtn.addEventListener('click', function() {
    const minutes = parseInt(timerMinutesInput.value) || 0;
    const seconds = parseInt(timerSecondsInput.value) || 0;
    
    if (minutes === 0 && seconds === 0) {
        // Shake animation for invalid input
        timerSetup.classList.add('shake');
        setTimeout(() => {
            timerSetup.classList.remove('shake');
        }, 500);
        return;
    }
    
    timerDuration = (minutes * 60 + seconds) * 1000;
    timerTime = timerDuration;
    updateTimerDisplay();
    
    timerSetup.style.display = 'none';
    timerDisplay.style.display = 'block';
});

// Start/pause timer
timerStartBtn.addEventListener('click', function() {
    if (!timerRunning) {
        // Start timer
        if (timerTime <= 0) return;
        
        timerRunning = true;
        this.textContent = 'Pause';
        this.classList.add('active');
        timerInterval = setInterval(updateTimer, 1000);
    } else {
        // Pause timer
        timerRunning = false;
        this.textContent = 'Resume';
        this.classList.remove('active');
        clearInterval(timerInterval);
    }
});

// Reset timer
timerResetBtn.addEventListener('click', function() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerStartBtn.textContent = 'Start';
    timerStartBtn.classList.remove('active');
    
    timerSetup.style.display = 'flex';
    timerDisplay.style.display = 'none';
    
    // Stop alarm if it's playing
    alarmSound.pause();
    alarmSound.currentTime = 0;
});

// Update timer
function updateTimer() {
    if (timerTime <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerStartBtn.textContent = 'Start';
        timerStartBtn.classList.remove('active');
        
        // Play alarm sound
        alarmSound.play();
        
        // Flash effect
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            timerDisplay.classList.toggle('flash');
            flashCount++;
            if (flashCount >= 10) {
                clearInterval(flashInterval);
                timerDisplay.classList.remove('flash');
            }
        }, 500);
        
        return;
    }
    
    timerTime -= 1000;
    updateTimerDisplay();
}

// Update timer display
function updateTimerDisplay() {
    const seconds = Math.floor((timerTime / 1000) % 60);
    const minutes = Math.floor((timerTime / (1000 * 60)) % 60);
    
    timerSecondsDisplay.textContent = seconds < 10 ? '0' + seconds : seconds;
    timerMinutesDisplay.textContent = minutes < 10 ? '0' + minutes : minutes;
}

// Initialize the watch
function initWatch() {
    // Create hour markers for analog clock
    createHourMarkers();
    
    // Load saved preferences
    loadPreferences();
    
    // Update date and time
    updateDate();
    updateTime();
    
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Update date every minute (less frequent as it doesn't change as often)
    setInterval(updateDate, 60000);
    
    // Add animation classes
    document.querySelector('.watch-face').classList.add('animate-in');
}

// Start the watch when the page loads
window.addEventListener('load', initWatch);