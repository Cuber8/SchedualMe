// Global state
const appState = {
    currentStep: 1,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    dailyHours: {},
    restPeriods: [],
    subjects: [],
    schedule: null,
    scheduleStats: null,
    conflicts: []
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

    // Initialize daily hours for all days
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
    
    // Animate the new element
    const newElement = document.querySelector(`[data-rest-period="${restPeriodId}"]`);
    if (newElement) {
        newElement.style.animation = 'fadeInUp 0.5s ease';
    }
}

function removeRestPeriod(id) {
    const element = document.querySelector(`[data-rest-period="${id}"]`);
    if (element) {
        element.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            appState.restPeriods = appState.restPeriods.filter(period => period.id !== id);
            renderRestPeriods();
        }, 300);
    }
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
        duration: 5, // Weekly hours
        priority: 'medium',
        availableDays: [...appState.days],
        unavailableTimes: []
    };
    
    appState.subjects.push(newSubject);
    renderSubjects();
    
    // Animate the new element
    const newElement = document.querySelector(`[data-subject="${subjectId}"]`);
    if (newElement) {
        newElement.style.animation = 'fadeInUp 0.5s ease';
    }
}

function removeSubject(id) {
    const element = document.querySelector(`[data-subject="${id}"]`);
    if (element) {
        element.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            appState.subjects = appState.subjects.filter(subject => subject.id !== id);
            renderSubjects();
        }, 300);
    }
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
            <select onchange="updateUnavailableTime(${subject.id}, ${index}, 'days', this.value)" multiple>
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
        if (field === 'days') {
            const select = event.target;
            const selectedDays = Array.from(select.selectedOptions).map(option => option.value);
            subject.unavailableTimes[index].days = selectedDays;
        } else {
            subject.unavailableTimes[index][field] = value;
        }
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

// Enhanced Conflict Detection
function detectConflicts() {
    const conflicts = [];
    const warnings = [];
    
    // 1. Check total time feasibility
    const totalAvailableMinutes = calculateTotalAvailableTime();
    const totalRequiredMinutes = appState.subjects.reduce((total, subject) => total + (subject.duration * 60), 0);
    
    if (totalRequiredMinutes > totalAvailableMinutes) {
        conflicts.push({
            type: 'critical',
            title: 'Not Enough Time Available',
            message: `Total required time (${(totalRequiredMinutes/60).toFixed(1)}h) exceeds available time (${(totalAvailableMinutes/60).toFixed(1)}h)`,
            details: [
                `You need ${(totalRequiredMinutes/60).toFixed(1)} hours but only have ${(totalAvailableMinutes/60).toFixed(1)} hours available`,
                'Consider: Reducing task durations, Adding more days, or Removing some tasks'
            ],
            tasks: appState.subjects.map(s => s.name)
        });
    }
    
    // 2. Check individual subject feasibility
    appState.subjects.forEach(subject => {
        const subjectAvailableMinutes = calculateSubjectAvailableTime(subject);
        const subjectRequiredMinutes = subject.duration * 60;
        
        if (subjectRequiredMinutes > subjectAvailableMinutes) {
            conflicts.push({
                type: 'critical',
                title: `"${subject.name}" Cannot Be Scheduled`,
                message: `Task requires ${subject.duration}h but only ${(subjectAvailableMinutes/60).toFixed(1)}h available on selected days`,
                details: [
                    `Available days: ${subject.availableDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`,
                    `Required: ${subject.duration} hours`,
                    `Available: ${(subjectAvailableMinutes/60).toFixed(1)} hours`,
                    'Consider: Adding more available days or Reducing duration'
                ],
                tasks: [subject.name]
            });
        }
    });
    
    // 3. Check for overlapping rest periods
    const restPeriodConflicts = findRestPeriodConflicts();
    conflicts.push(...restPeriodConflicts);
    
    // 4. Check for task-rest period conflicts
    const taskRestConflicts = findTaskRestConflicts();
    conflicts.push(...taskRestConflicts);
    
    // 5. Check for overlapping unavailable times within same subject
    const unavailableTimeConflicts = findUnavailableTimeConflicts();
    conflicts.push(...unavailableTimeConflicts);
    
    // 6. Check if tasks can fit in daily work hours
    const workHourConflicts = findWorkHourConflicts();
    warnings.push(...workHourConflicts);
    
    appState.conflicts = conflicts;
    appState.warnings = warnings;
    
    return {
        conflicts: conflicts,
        warnings: warnings,
        hasCriticalConflicts: conflicts.some(c => c.type === 'critical'),
        hasWarnings: warnings.length > 0
    };
}

function calculateTotalAvailableTime() {
    let totalMinutes = 0;
    const timeSlots = generateTimeSlots();
    
    appState.days.forEach(day => {
        const dailyHours = appState.dailyHours[day];
        if (dailyHours && dailyHours.enabled) {
            const workSlots = getTimeSlotsBetween(dailyHours.startTime, dailyHours.endTime, timeSlots);
            totalMinutes += workSlots.length * 30; // 30 minutes per slot
        } else {
            // Default: assume 8 hours if no specific hours set
            totalMinutes += 8 * 60;
        }
    });
    
    // Subtract rest periods
    appState.restPeriods.forEach(period => {
        const periodDays = period.applyToAll ? appState.days : period.days;
        periodDays.forEach(day => {
            if (appState.days.includes(day)) {
                const restSlots = getTimeSlotsBetween(period.startTime, period.endTime, timeSlots);
                totalMinutes -= restSlots.length * 30;
            }
        });
    });
    
    return Math.max(0, totalMinutes);
}

function calculateSubjectAvailableTime(subject) {
    let availableMinutes = 0;
    const timeSlots = generateTimeSlots();
    
    subject.availableDays.forEach(day => {
        if (!appState.days.includes(day)) return;
        
        const dailyHours = appState.dailyHours[day];
        let daySlots = [];
        
        if (dailyHours && dailyHours.enabled) {
            daySlots = getTimeSlotsBetween(dailyHours.startTime, dailyHours.endTime, timeSlots);
        } else {
            // Default work day
            daySlots = getTimeSlotsBetween('09:00', '17:00', timeSlots);
        }
        
        // Subtract rest periods
        appState.restPeriods.forEach(period => {
            const periodDays = period.applyToAll ? appState.days : period.days;
            if (periodDays.includes(day)) {
                const restSlots = getTimeSlotsBetween(period.startTime, period.endTime, timeSlots);
                daySlots = daySlots.filter(slot => !restSlots.includes(slot));
            }
        });
        
        // Subtract subject's unavailable times
        if (subject.unavailableTimes) {
            subject.unavailableTimes.forEach(unavailable => {
                if (unavailable.days.includes(day)) {
                    const unavailableSlots = getTimeSlotsBetween(unavailable.startTime, unavailable.endTime, timeSlots);
                    daySlots = daySlots.filter(slot => !unavailableSlots.includes(slot));
                }
            });
        }
        
        availableMinutes += daySlots.length * 30;
    });
    
    return availableMinutes;
}

function findRestPeriodConflicts() {
    const conflicts = [];
    
    for (let i = 0; i < appState.restPeriods.length; i++) {
        for (let j = i + 1; j < appState.restPeriods.length; j++) {
            const period1 = appState.restPeriods[i];
            const period2 = appState.restPeriods[j];
            
            const commonDays = period1.applyToAll && period2.applyToAll ? appState.days : 
                             period1.applyToAll ? period2.days :
                             period2.applyToAll ? period1.days :
                             period1.days.filter(day => period2.days.includes(day));
            
            if (commonDays.length > 0 && doTimeRangesOverlap(period1.startTime, period1.endTime, period2.startTime, period2.endTime)) {
                conflicts.push({
                    type: 'warning',
                    title: 'Overlapping Rest Periods',
                    message: `"${period1.name}" and "${period2.name}" overlap`,
                    details: [
                        `Period 1: ${period1.startTime} - ${period1.endTime}`,
                        `Period 2: ${period2.startTime} - ${period2.endTime}`,
                        `Days: ${commonDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`,
                        'This may reduce available scheduling time'
                    ],
                    tasks: [period1.name, period2.name],
                    times: [`${period1.startTime}-${period1.endTime}`, `${period2.startTime}-${period2.endTime}`]
                });
            }
        }
    }
    
    return conflicts;
}

function findTaskRestConflicts() {
    const conflicts = [];
    const timeSlots = generateTimeSlots();
    
    appState.subjects.forEach(subject => {
        subject.availableDays.forEach(day => {
            if (!appState.days.includes(day)) return;
            
            appState.restPeriods.forEach(period => {
                const periodDays = period.applyToAll ? appState.days : period.days;
                if (periodDays.includes(day)) {
                    const restSlots = getTimeSlotsBetween(period.startTime, period.endTime, timeSlots);
                    
                    // Check if subject has unavailable times that conflict with rest periods
                    if (subject.unavailableTimes) {
                        subject.unavailableTimes.forEach(unavailable => {
                            if (unavailable.days.includes(day)) {
                                const unavailableSlots = getTimeSlotsBetween(unavailable.startTime, unavailable.endTime, timeSlots);
                                const conflictingSlots = restSlots.filter(slot => unavailableSlots.includes(slot));
                                
                                if (conflictingSlots.length > 0) {
                                    conflicts.push({
                                        type: 'warning',
                                        title: 'Task Unavailable During Rest Period',
                                        message: `"${subject.name}" is marked unavailable during "${period.name}"`,
                                        details: [
                                            `Day: ${day.charAt(0).toUpperCase() + day.slice(1)}`,
                                            `Rest Period: ${period.startTime} - ${period.endTime}`,
                                            `Unavailable: ${unavailable.startTime} - ${unavailable.endTime}`,
                                            'This overlap may cause scheduling issues'
                                        ],
                                        tasks: [subject.name, period.name],
                                        times: [`${unavailable.startTime}-${unavailable.endTime}`, `${period.startTime}-${period.endTime}`]
                                    });
                                }
                            }
                        });
                    }
                }
            });
        });
    });
    
    return conflicts;
}

function findUnavailableTimeConflicts() {
    const conflicts = [];
    
    appState.subjects.forEach(subject => {
        if (!subject.unavailableTimes || subject.unavailableTimes.length < 2) return;
        
        for (let i = 0; i < subject.unavailableTimes.length; i++) {
            for (let j = i + 1; j < subject.unavailableTimes.length; j++) {
                const time1 = subject.unavailableTimes[i];
                const time2 = subject.unavailableTimes[j];
                
                const commonDays = time1.days.filter(day => time2.days.includes(day));
                
                if (commonDays.length > 0 && doTimeRangesOverlap(time1.startTime, time1.endTime, time2.startTime, time2.endTime)) {
                    conflicts.push({
                        type: 'warning',
                        title: 'Overlapping Unavailable Times',
                        message: `"${subject.name}" has overlapping unavailable periods`,
                        details: [
                            `Time 1: ${time1.startTime} - ${time1.endTime}`,
                            `Time 2: ${time2.startTime} - ${time2.endTime}`,
                            `Days: ${commonDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`,
                            'This may reduce available scheduling time unnecessarily'
                        ],
                        tasks: [subject.name],
                        times: [`${time1.startTime}-${time1.endTime}`, `${time2.startTime}-${time2.endTime}`]
                    });
                }
            }
        }
    });
    
    return conflicts;
}

function findWorkHourConflicts() {
    const warnings = [];
    
    appState.subjects.forEach(subject => {
        subject.availableDays.forEach(day => {
            const dailyHours = appState.dailyHours[day];
            if (dailyHours && dailyHours.enabled) {
                // Check if subject's unavailable times conflict with work hours
                if (subject.unavailableTimes) {
                    subject.unavailableTimes.forEach(unavailable => {
                        if (unavailable.days.includes(day)) {
                            if (doTimeRangesOverlap(unavailable.startTime, unavailable.endTime, dailyHours.startTime, dailyHours.endTime)) {
                                warnings.push({
                                    type: 'info',
                                    title: 'Unavailable Time During Work Hours',
                                    message: `"${subject.name}" is unavailable during work hours on ${day.charAt(0).toUpperCase() + day.slice(1)}`,
                                    details: [
                                        `Work Hours: ${dailyHours.startTime} - ${dailyHours.endTime}`,
                                        `Unavailable: ${unavailable.startTime} - ${unavailable.endTime}`,
                                        'This reduces available scheduling time'
                                    ],
                                    tasks: [subject.name],
                                    times: [`${unavailable.startTime}-${unavailable.endTime}`]
                                });
                            }
                        }
                    });
                }
            }
        });
    });
    
    return warnings;
}

function doTimeRangesOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
}

// Enhanced Schedule Generation with Conflict Detection
async function generateSchedule() {
    if (!validateCurrentStep()) return;
    
    // First, detect conflicts
    const conflictCheck = detectConflicts();
    
    if (conflictCheck.hasCriticalConflicts) {
        showConflictsDialog(conflictCheck);
        return;
    }
    
    if (conflictCheck.hasWarnings || conflictCheck.conflicts.length > 0) {
        const proceed = await showWarningsDialog(conflictCheck);
        if (!proceed) return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('schedule-generator.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                days: appState.days,
                dailyHours: appState.dailyHours,
                restPeriods: appState.restPeriods,
                subjects: appState.subjects
            })
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error('Server returned non-JSON response');
        }
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Server error');
        }
        
        if (result.success) {
            appState.schedule = result.schedule;
            appState.scheduleStats = result.stats;
            nextStep(4);
        } else {
            throw new Error(result.error || 'Schedule generation failed');
        }
    } catch (error) {
        console.error('Schedule generation error:', error);
        showNotification('Error generating schedule. Using local fallback...', 'warning');
        
        // Fallback: Generate sample schedule locally
        setTimeout(() => {
            generateSampleSchedule();
            nextStep(4);
            showNotification('Sample schedule generated successfully!', 'success');
        }, 1000);
    } finally {
        showLoading(false);
    }
}

// Conflict Display Dialogs
function showConflictsDialog(conflictCheck) {
    const dialog = document.createElement('div');
    dialog.className = 'conflict-dialog';
    dialog.innerHTML = `
        <div class="conflict-dialog-content">
            <div class="conflict-header">
                <h3>🚫 Schedule Conflicts Detected</h3>
                <p>The following issues prevent schedule generation:</p>
            </div>
            <div class="conflicts-list">
                ${conflictCheck.conflicts.filter(c => c.type === 'critical').map(conflict => `
                    <div class="conflict-item critical">
                        <div class="conflict-title">${conflict.title}</div>
                        <div class="conflict-message">${conflict.message}</div>
                        <div class="conflict-details">
                            ${conflict.details.map(detail => `<div class="conflict-detail">• ${detail}</div>`).join('')}
                        </div>
                        ${conflict.tasks ? `<div class="conflict-tasks">Affected: ${conflict.tasks.join(', ')}</div>` : ''}
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

async function showWarningsDialog(conflictCheck) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'conflict-dialog';
        dialog.innerHTML = `
            <div class="conflict-dialog-content">
                <div class="conflict-header">
                    <h3>⚠️ Schedule Warnings</h3>
                    <p>The following issues were detected. You can proceed, but some tasks may not schedule optimally.</p>
                </div>
                <div class="conflicts-list">
                    ${[...conflictCheck.conflicts.filter(c => c.type === 'warning'), ...conflictCheck.warnings].map(conflict => `
                        <div class="conflict-item warning">
                            <div class="conflict-title">${conflict.title}</div>
                            <div class="conflict-message">${conflict.message}</div>
                            <div class="conflict-details">
                                ${conflict.details.map(detail => `<div class="conflict-detail">• ${detail}</div>`).join('')}
                            </div>
                            ${conflict.tasks ? `<div class="conflict-tasks">Affected: ${conflict.tasks.join(', ')}</div>` : ''}
                            ${conflict.times ? `<div class="conflict-times">Times: ${conflict.times.join(', ')}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
                <div class="conflict-actions">
                    <button class="btn-prev" onclick="closeDialog(false)">Go Back & Fix</button>
                    <button class="btn-next" onclick="closeDialog(true)">Proceed Anyway</button>
                </div>
            </div>
        `;
        
        function closeDialog(proceed) {
            dialog.remove();
            resolve(proceed);
        }
        
        window.closeDialog = closeDialog;
        document.body.appendChild(dialog);
    });
}

// Add CSS for conflict dialogs
const conflictStyles = `
.conflict-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1002;
    animation: fadeIn 0.3s ease;
}

.conflict-dialog-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.conflict-header {
    text-align: center;
    margin-bottom: 25px;
}

.conflict-header h3 {
    color: #e74c3c;
    margin-bottom: 10px;
    font-size: 1.5rem;
}

.conflicts-list {
    margin-bottom: 25px;
}

.conflict-item {
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    border-left: 4px solid;
}

.conflict-item.critical {
    background: #ffeaea;
    border-left-color: #e74c3c;
}

.conflict-item.warning {
    background: #fff4e6;
    border-left-color: #f39c12;
}

.conflict-item.info {
    background: #e8f4fd;
    border-left-color: #3498db;
}

.conflict-title {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 1.1rem;
}

.conflict-message {
    margin-bottom: 10px;
    color: #555;
}

.conflict-details {
    margin-bottom: 8px;
}

.conflict-detail {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 4px;
}

.conflict-tasks, .conflict-times {
    font-size: 0.85rem;
    color: #777;
    margin-top: 5px;
    padding-top: 5px;
    border-top: 1px solid rgba(0,0,0,0.1);
}

.conflict-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
}
`;

// Inject conflict styles
if (!document.querySelector('#conflict-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'conflict-styles';
    styleSheet.textContent = conflictStyles;
    document.head.appendChild(styleSheet);
}

// ... (Keep all the existing functions from the previous script: generateSampleSchedule, renderSchedule, export functions, etc.)

// Make sure to include all the existing functions from the previous script below this point
// (generateSampleSchedule, isTimeUnavailable, isSlotAvailable, getTimeSlotsBetween, 
// isTimeInRange, generateTimeSlots, renderSchedule, groupTimeSlotsIntoPeriods, 
// renderScheduleItems, updateScheduleSummary, animateScheduleAppearance, formatTimeDisplay,
// export functions, navigation functions, UI utilities, etc.)

// The rest of your existing functions continue here...
// [Include all the remaining functions from the previous script]
