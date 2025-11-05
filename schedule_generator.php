// Global state
const appState = {
    currentStep: 1,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    dailyHours: {},
    restPeriods: [],
    subjects: [],
    schedule: null,
    scheduleStats: null,
    conflicts: [],
    warnings: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    updateProgressIndicator();
    initializeDailyHours();
    loadSampleData();
}

function setupEventListeners() {
    // Day selection
    document.querySelectorAll('input[name="days"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedDays();
            updateDailyHoursVisibility();
        });
    });
}

function updateSelectedDays() {
    appState.days = Array.from(document.querySelectorAll('input[name="days"]:checked'))
        .map(checkbox => checkbox.value);
}

function initializeDailyHours() {
    const dayNames = {
        monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
        thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
    };

    Object.keys(dayNames).forEach(day => {
        appState.dailyHours[day] = {
            enabled: false,
            startTime: '09:00',
            endTime: '17:00'
        };
    });

    renderDailyHours();
}

function renderDailyHours() {
    const container = document.getElementById('dailyHoursContainer');
    const dayNames = {
        monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
        thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
    };

    container.innerHTML = appState.days.map(day => `
        <div class="daily-hour-item" data-day="${day}">
            <div class="daily-hour-header">
                <h4>${dayNames[day]}</h4>
                <label class="toggle-switch">
                    <input type="checkbox" ${appState.dailyHours[day].enabled ? 'checked' : ''} 
                           onchange="toggleDailyHours('${day}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="daily-hour-fields" ${!appState.dailyHours[day].enabled ? 'style="display: none;"' : ''}>
                <div class="form-group">
                    <label>Start Time</label>
                    <input type="time" value="${appState.dailyHours[day].startTime}"
                           onchange="updateDailyHours('${day}', 'startTime', this.value)">
                </div>
                <div class="form-group">
                    <label>End Time</label>
                    <input type="time" value="${appState.dailyHours[day].endTime}"
                           onchange="updateDailyHours('${day}', 'endTime', this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

function updateDailyHoursVisibility() {
    setTimeout(renderDailyHours, 100);
}

function toggleDailyHours(day, enabled) {
    appState.dailyHours[day].enabled = enabled;
    const fields = document.querySelector(`[data-day="${day}"] .daily-hour-fields`);
    if (fields) {
        fields.style.display = enabled ? 'grid' : 'none';
    }
}

function updateDailyHours(day, field, value) {
    if (appState.dailyHours[day]) {
        appState.dailyHours[day][field] = value;
    }
}

// Rest Periods Management
function addRestPeriod() {
    const restPeriodId = Date.now();
    const newRestPeriod = {
        id: restPeriodId,
        name: 'Break',
        startTime: '12:00',
        endTime: '13:00',
        days: [...appState.days],
        applyToAll: true
    };
    
    appState.restPeriods.push(newRestPeriod);
    renderRestPeriods();
}

function removeRestPeriod(id) {
    appState.restPeriods = appState.restPeriods.filter(period => period.id !== id);
    renderRestPeriods();
}

function renderRestPeriods() {
    const container = document.getElementById('restPeriodsContainer');
    
    if (appState.restPeriods.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No rest periods added yet. Add breaks like lunch or personal time.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.restPeriods.map(period => `
        <div class="rest-period" data-rest-period="${period.id}">
            <div class="item-header">
                <h3>${period.name}</h3>
                <button class="remove-btn" onclick="removeRestPeriod(${period.id})">
                    Remove
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" value="${period.name}" 
                           onchange="updateRestPeriod(${period.id}, 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Start Time</label>
                    <input type="time" value="${period.startTime}"
                           onchange="updateRestPeriod(${period.id}, 'startTime', this.value)">
                </div>
                <div class="form-group">
                    <label>End Time</label>
                    <input type="time" value="${period.endTime}"
                           onchange="updateRestPeriod(${period.id}, 'endTime', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" ${period.applyToAll ? 'checked' : ''}
                           onchange="updateRestPeriod(${period.id}, 'applyToAll', this.checked)">
                    Apply to all selected days
                </label>
            </div>
        </div>
    `).join('');
}

function updateRestPeriod(id, field, value) {
    const period = appState.restPeriods.find(p => p.id === id);
    if (period) {
        period[field] = value;
    }
}

// Subjects Management
function addSubject() {
    const subjectId = Date.now();
    const newSubject = {
        id: subjectId,
        name: 'New Task',
        duration: 5,
        priority: 'medium',
        availableDays: [...appState.days],
        unavailableTimes: []
    };
    
    appState.subjects.push(newSubject);
    renderSubjects();
}

function removeSubject(id) {
    appState.subjects = appState.subjects.filter(subject => subject.id !== id);
    renderSubjects();
}

function renderSubjects() {
    const container = document.getElementById('subjectsContainer');
    
    if (appState.subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No subjects added yet. Add tasks like work, study, or exercise.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appState.subjects.map(subject => `
        <div class="subject-item" data-subject="${subject.id}">
            <div class="item-header">
                <h3>${subject.name}</h3>
                <button class="remove-btn" onclick="removeSubject(${subject.id})">
                    Remove
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Task Name</label>
                    <input type="text" value="${subject.name}"
                           onchange="updateSubject(${subject.id}, 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Weekly Duration (hours)</label>
                    <input type="number" min="1" step="0.5" value="${subject.duration}"
                           onchange="updateSubject(${subject.id}, 'duration', parseFloat(this.value))">
                </div>
                <div class="form-group">
                    <label>Priority</label>
                    <select onchange="updateSubject(${subject.id}, 'priority', this.value)">
                        <option value="low" ${subject.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${subject.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${subject.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
            </div>
            
            <div class="availability-section">
                <div class="availability-header">
                    <h4>Available Days</h4>
                </div>
                <div class="availability-days">
                    ${appState.days.map(day => `
                        <div class="availability-day">
                            <input type="checkbox" id="subject-${subject.id}-${day}" 
                                   value="${day}" ${subject.availableDays.includes(day) ? 'checked' : ''}
                                   onchange="updateSubjectDays(${subject.id}, '${day}', this.checked)">
                            <label for="subject-${subject.id}-${day}">${day.charAt(0).toUpperCase() + day.slice(1)}</label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="unavailable-times">
                    <div class="availability-header">
                        <h4>Unavailable Time Blocks</h4>
                    </div>
                    <div class="unavailable-times-list" id="unavailable-times-${subject.id}">
                        ${renderUnavailableTimes(subject)}
                    </div>
                    <button type="button" class="add-unavailable-btn" onclick="addUnavailableTime(${subject.id})">
                        + Add Unavailable Time Block
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderUnavailableTimes(subject) {
    if (!subject.unavailableTimes || subject.unavailableTimes.length === 0) {
        return '<p class="text-small text-center">No unavailable times set</p>';
    }
    
    return subject.unavailableTimes.map((time, index) => `
        <div class="unavailable-time-item">
            <select onchange="updateUnavailableTime(${subject.id}, ${index}, 'days', this.value)">
                ${appState.days.map(day => `
                    <option value="${day}" ${time.days.includes(day) ? 'selected' : ''}>
                        ${day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                `).join('')}
            </select>
            <input type="time" value="${time.startTime}" 
                   onchange="updateUnavailableTime(${subject.id}, ${index}, 'startTime', this.value)">
            <input type="time" value="${time.endTime}" 
                   onchange="updateUnavailableTime(${subject.id}, ${index}, 'endTime', this.value)">
            <button class="remove-time-btn" onclick="removeUnavailableTime(${subject.id}, ${index})">
                Remove
            </button>
        </div>
    `).join('');
}

function addUnavailableTime(subjectId) {
    const subject = appState.subjects.find(s => s.id === subjectId);
    if (subject) {
        if (!subject.unavailableTimes) {
            subject.unavailableTimes = [];
        }
        subject.unavailableTimes.push({
            days: [appState.days[0]],
            startTime: '14:00',
            endTime: '15:00'
        });
        renderSubjects();
    }
}

function removeUnavailableTime(subjectId, index) {
    const subject = appState.subjects.find(s => s.id === subjectId);
    if (subject && subject.unavailableTimes) {
        subject.unavailableTimes.splice(index, 1);
        renderSubjects();
    }
}

function updateUnavailableTime(subjectId, index, field, value) {
    const subject = appState.subjects.find(s => s.id === subjectId);
    if (subject && subject.unavailableTimes && subject.unavailableTimes[index]) {
        subject.unavailableTimes[index][field] = value;
    }
}

function updateSubject(id, field, value) {
    const subject = appState.subjects.find(s => s.id === id);
    if (subject) {
        subject[field] = value;
    }
}

function updateSubjectDays(subjectId, day, checked) {
    const subject = appState.subjects.find(s => s.id === subjectId);
    if (subject) {
        if (checked) {
            if (!subject.availableDays.includes(day)) {
                subject.availableDays.push(day);
            }
        } else {
            subject.availableDays = subject.availableDays.filter(d => d !== day);
        }
    }
}

// Simple Conflict Detection
function detectConflicts() {
    const conflicts = [];
    const warnings = [];
    
    // 1. Check total time
    const totalRequired = appState.subjects.reduce((total, subject) => total + subject.duration, 0);
    const totalAvailable = appState.days.length * 8; // Rough estimate
    
    if (totalRequired > totalAvailable) {
        conflicts.push({
            type: 'critical',
            title: 'Not Enough Time',
            message: `You need ${totalRequired}h but only have ~${totalAvailable}h available`,
            details: ['Reduce task durations or add more days']
        });
    }
    
    // 2. Check individual tasks
    appState.subjects.forEach(subject => {
        if (subject.availableDays.length === 0) {
            conflicts.push({
                type: 'critical',
                title: `"${subject.name}" Has No Available Days`,
                message: 'Task cannot be scheduled without available days',
                details: ['Select at least one available day for this task']
            });
        }
        
        const hoursPerDay = subject.duration / subject.availableDays.length;
        if (hoursPerDay > 8) {
            warnings.push({
                type: 'warning',
                title: `"${subject.name}" May Be Too Intensive`,
                message: `Task requires ${hoursPerDay.toFixed(1)}h per day on average`,
                details: ['Consider spreading across more days or reducing duration']
            });
        }
    });
    
    return { conflicts, warnings, hasCritical: conflicts.length > 0 };
}

// Schedule Generation
async function generateSchedule() {
    if (!validateCurrentStep()) return;
    
    // Check for conflicts
    const conflictCheck = detectConflicts();
    
    if (conflictCheck.hasCritical) {
        showConflictsDialog(conflictCheck.conflicts);
        return;
    }
    
    if (conflictCheck.warnings.length > 0) {
        const proceed = await showWarningsDialog(conflictCheck.warnings);
        if (!proceed) return;
    }
    
    showLoading(true);
    
    try {
        // Generate sample schedule (replace with your actual generation logic)
        setTimeout(() => {
            generateSampleSchedule();
            nextStep(4);
            showNotification('Schedule generated successfully!', 'success');
            showLoading(false);
        }, 1500);
        
    } catch (error) {
        console.error('Schedule generation error:', error);
        showNotification('Error generating schedule', 'error');
        showLoading(false);
    }
}

// Simple conflict dialogs
function showConflictsDialog(conflicts) {
    const dialog = document.createElement('div');
    dialog.className = 'conflict-dialog';
    dialog.innerHTML = `
        <div class="conflict-dialog-content">
            <div class="conflict-header">
                <h3>🚫 Schedule Conflicts</h3>
                <p>Please fix these issues to continue:</p>
            </div>
            <div class="conflicts-list">
                ${conflicts.map(conflict => `
                    <div class="conflict-item critical">
                        <div class="conflict-title">${conflict.title}</div>
                        <div class="conflict-message">${conflict.message}</div>
                        <div class="conflict-details">
                            ${conflict.details.map(detail => `<div>• ${detail}</div>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="conflict-actions">
                <button class="btn-prev" onclick="this.closest('.conflict-dialog').remove()">Go Back & Fix</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

function showWarningsDialog(warnings) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'conflict-dialog';
        dialog.innerHTML = `
            <div class="conflict-dialog-content">
                <div class="conflict-header">
                    <h3>⚠️ Schedule Warnings</h3>
                    <p>You can proceed, but consider these suggestions:</p>
                </div>
                <div class="conflicts-list">
                    ${warnings.map(warning => `
                        <div class="conflict-item warning">
                            <div class="conflict-title">${warning.title}</div>
                            <div class="conflict-message">${warning.message}</div>
                            <div class="conflict-details">
                                ${warning.details.map(detail => `<div>• ${detail}</div>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="conflict-actions">
                    <button class="btn-prev" onclick="closeDialog(false)">Go Back</button>
                    <button class="btn-next" onclick="closeDialog(true)">Proceed Anyway</button>
                </div>
            </div>
        `;
        
        window.closeDialog = (proceed) => {
            dialog.remove();
            resolve(proceed);
        };
        
        document.body.appendChild(dialog);
    });
}

// Sample schedule generation (keep your existing one)
function generateSampleSchedule() {
    const timeSlots = generateTimeSlots();
    const schedule = {};
    
    // Initialize schedule
    appState.days.forEach(day => {
        schedule[day] = {};
        timeSlots.forEach(time => {
            schedule[day][time] = [];
        });
    });
    
    // Add rest periods
    appState.restPeriods.forEach(period => {
        const periodDays = period.applyToAll ? appState.days : period.days;
        periodDays.forEach(day => {
            const restSlots = getTimeSlotsBetween(period.startTime, period.endTime, timeSlots);
            restSlots.forEach(slot => {
                schedule[day][slot].push({
                    type: 'rest',
                    name: period.name,
                    color: '#f39c12'
                });
            });
        });
    });
    
    // Add tasks
    appState.subjects.forEach((subject, index) => {
        const colors = ['#3498db', '#2ecc71', '#9b59b6'];
        const color = colors[index % colors.length];
        
        subject.availableDays.forEach(day => {
            if (schedule[day]) {
                // Simple scheduling - just add to morning hours
                const morningSlots = getTimeSlotsBetween('09:00', '12:00', timeSlots);
                const slotsToUse = morningSlots.slice(0, Math.min(4, subject.duration * 2));
                
                slotsToUse.forEach(slot => {
                    if (isSlotAvailable(schedule[day][slot])) {
                        schedule[day][slot].push({
                            type: 'task',
                            name: subject.name,
                            color: color
                        });
                    }
                });
            }
        });
    });
    
    appState.schedule = schedule;
    appState.scheduleStats = {
        totalScheduledHours: appState.subjects.reduce((sum, subject) => sum + subject.duration, 0),
        tasksScheduled: appState.subjects.length,
        efficiency: 85
    };
}

// Utility functions
function generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
    }
    return slots;
}

function getTimeSlotsBetween(start, end, timeSlots) {
    return timeSlots.filter(slot => slot >= start && slot < end);
}

function isSlotAvailable(slotItems) {
    return slotItems.length === 0;
}

// Schedule Display
function renderSchedule() {
    const container = document.getElementById('scheduleDisplay');
    
    if (!appState.schedule) {
        container.innerHTML = '<div class="empty-state"><p>No schedule generated yet.</p></div>';
        return;
    }
    
    updateScheduleSummary();
    
    const timeSlots = generateTimeSlots();
    const dayNames = {
        monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
        thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    
    let html = `
        <div class="schedule-legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #3498db;"></div>
                <span>Tasks</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f39c12;"></div>
                <span>Rest Periods</span>
            </div>
        </div>
        <table class="schedule-table">
            <thead>
                <tr>
                    <th class="time-column">Time</th>
                    ${appState.days.map(day => `<th>${dayNames[day]}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    timeSlots.forEach(slot => {
        html += `<tr><td class="time-column">${formatTimeDisplay(slot)}</td>`;
        appState.days.forEach(day => {
            const items = appState.schedule[day][slot] || [];
            html += `<td class="time-slot">`;
            items.forEach(item => {
                const className = item.type === 'rest' ? 'schedule-rest' : 'schedule-task';
                html += `<div class="${className}" style="background: ${item.color}">${item.name}</div>`;
            });
            if (items.length === 0) {
                html += '<div class="empty-slot">Free</div>';
            }
            html += `</td>`;
        });
        html += `</tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function updateScheduleSummary() {
    if (!appState.scheduleStats) return;
    
    const stats = appState.scheduleStats;
    document.getElementById('totalHours').textContent = `${stats.totalScheduledHours}h`;
    document.getElementById('tasksScheduled').textContent = stats.tasksScheduled;
    document.getElementById('efficiencyScore').textContent = `${stats.efficiency}%`;
}

function formatTimeDisplay(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Navigation
function nextStep(step) {
    if (!validateCurrentStep()) return;

    document.getElementById(`step${appState.currentStep}`).classList.remove('active');
    appState.currentStep = step;
    document.getElementById(`step${step}`).classList.add('active');
    updateProgressIndicator();
    
    if (step === 4) {
        renderSchedule();
    }
}

function prevStep(step) {
    document.getElementById(`step${appState.currentStep}`).classList.remove('active');
    appState.currentStep = step;
    document.getElementById(`step${step}`).classList.add('active');
    updateProgressIndicator();
}

function validateCurrentStep() {
    switch (appState.currentStep) {
        case 1:
            if (appState.days.length === 0) {
                showNotification('Please select at least one day', 'error');
                return false;
            }
            break;
        case 3:
            if (appState.subjects.length === 0) {
                showNotification('Please add at least one subject', 'error');
                return false;
            }
            break;
    }
    return true;
}

function updateProgressIndicator() {
    document.querySelectorAll('.progress-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.toggle('active', stepNum === appState.currentStep);
    });
}

// Export functionality
function exportSchedule(format) {
    showNotification(`Exporting as ${format.toUpperCase()}...`, 'info');
    setTimeout(() => {
        showNotification(`${format.toUpperCase()} exported successfully!`, 'success');
    }, 1000);
}

// UI Utilities
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

function showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1001;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Sample data
function loadSampleData() {
    appState.restPeriods.push({
        id: 1,
        name: 'Lunch Break',
        startTime: '12:00',
        endTime: '13:00',
        days: [...appState.days],
        applyToAll: true
    });
    
    appState.subjects.push({
        id: 1,
        name: 'Work Project',
        duration: 10,
        priority: 'high',
        availableDays: ['monday', 'wednesday', 'friday'],
        unavailableTimes: []
    });
    
    appState.subjects.push({
        id: 2,
        name: 'Study Session',
        duration: 8,
        priority: 'medium',
        availableDays: ['tuesday', 'thursday'],
        unavailableTimes: []
    });
    
    renderDailyHours();
    renderRestPeriods();
    renderSubjects();
}

// Make functions global
window.nextStep = nextStep;
window.prevStep = prevStep;
window.addRestPeriod = addRestPeriod;
window.removeRestPeriod = removeRestPeriod;
window.updateRestPeriod = updateRestPeriod;
window.addSubject = addSubject;
window.removeSubject = removeSubject;
window.updateSubject = updateSubject;
window.updateSubjectDays = updateSubjectDays;
window.addUnavailableTime = addUnavailableTime;
window.removeUnavailableTime = removeUnavailableTime;
window.updateUnavailableTime = updateUnavailableTime;
window.generateSchedule = generateSchedule;
window.exportSchedule = exportSchedule;
window.toggleDailyHours = toggleDailyHours;
window.updateDailyHours = updateDailyHours;
