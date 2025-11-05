// Global state
const appState = {
    currentStep: 1,
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    dailyHours: {},
    restPeriods: [],
    subjects: [],
    schedule: null,
    scheduleStats: null
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

// Schedule Generation
async function generateSchedule() {
    if (!validateCurrentStep()) return;
    
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

// Local fallback schedule generation
function generateSampleSchedule() {
    const timeSlots = generateTimeSlots();
    const schedule = {};
    
    // Initialize empty schedule
    appState.days.forEach(day => {
        schedule[day] = {};
        timeSlots.forEach(time => {
            schedule[day][time] = [];
        });
    });
    
    // Add rest periods first
    appState.restPeriods.forEach(period => {
        const periodDays = period.applyToAll ? appState.days : period.days;
        periodDays.forEach(day => {
            if (schedule[day]) {
                const restSlots = getTimeSlotsBetween(period.startTime, period.endTime, timeSlots);
                restSlots.forEach(slot => {
                    if (schedule[day][slot]) {
                        schedule[day][slot].push({
                            type: 'rest',
                            name: period.name,
                            color: '#f39c12'
                        });
                    }
                });
            }
        });
    });
    
    // Schedule subjects in a more organized way
    const timeBlocks = {
        morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
        afternoon: ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
        evening: ['17:00', '17:30', '18:00', '18:30']
    };
    
    appState.subjects.forEach((subject, index) => {
        const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c'];
        const color = colors[index % colors.length];
        const subjectHours = subject.duration;
        
        // Distribute hours across available days
        const hoursPerDay = Math.ceil(subjectHours / subject.availableDays.length);
        
        subject.availableDays.forEach((day, dayIndex) => {
            if (!schedule[day]) return;
            
            // Choose time block based on day index
            const blockType = dayIndex % 3 === 0 ? 'morning' : 
                            dayIndex % 3 === 1 ? 'afternoon' : 'evening';
            const availableSlots = timeBlocks[blockType];
            
            if (availableSlots && availableSlots.length > 0) {
                // Schedule consecutive blocks
                const slotsToSchedule = Math.min(hoursPerDay * 2, 4); // Max 2 hours per day
                
                for (let i = 0; i < slotsToSchedule && i < availableSlots.length; i++) {
                    const slot = availableSlots[i];
                    
                    // Check if slot is available and not in unavailable times
                    if (isSlotAvailable(schedule[day][slot]) && 
                        !isTimeUnavailable(day, slot, subject)) {
                        schedule[day][slot].push({
                            type: 'task',
                            name: subject.name,
                            subjectId: subject.id,
                            color: color
                        });
                    }
                }
            }
        });
    });
    
    // Calculate stats
    let totalScheduledHours = 0;
    appState.days.forEach(day => {
        timeSlots.forEach(slot => {
            const tasks = schedule[day][slot].filter(item => item.type === 'task');
            totalScheduledHours += tasks.length * 0.5; // 0.5 hours per slot
        });
    });
    
    const totalRequiredHours = appState.subjects.reduce((total, subject) => total + subject.duration, 0);
    const efficiency = totalRequiredHours > 0 ? Math.round((totalScheduledHours / totalRequiredHours) * 100) : 0;
    
    appState.schedule = schedule;
    appState.scheduleStats = {
        totalScheduledHours: totalScheduledHours.toFixed(1),
        tasksScheduled: appState.subjects.length,
        efficiency: efficiency
    };
}

function isTimeUnavailable(day, time, subject) {
    if (!subject.unavailableTimes) return false;
    
    return subject.unavailableTimes.some(unavailable => {
        return unavailable.days.includes(day) && 
               isTimeInRange(time, unavailable.startTime, unavailable.endTime);
    });
}

function isSlotAvailable(slotItems) {
    return !slotItems.some(item => item.type === 'task' || item.type === 'rest');
}

function getTimeSlotsBetween(start, end, timeSlots) {
    return timeSlots.filter(slot => slot >= start && slot < end);
}

function isTimeInRange(time, start, end) {
    return time >= start && time < end;
}

function generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }
    }
    return slots;
}

// Schedule Display - Organized Table Layout
function renderSchedule() {
    const container = document.getElementById('scheduleDisplay');
    
    if (!appState.schedule) {
        container.innerHTML = '<div class="empty-state"><p>No schedule generated yet.</p></div>';
        return;
    }
    
    updateScheduleSummary();
    
    const timeSlots = generateTimeSlots();
    const dayNames = {
        monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
        thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday'
    };
    
    let html = `
        <div class="schedule-legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #3498db;"></div>
                <span>Work Tasks</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #2ecc71;"></div>
                <span>Study Tasks</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #9b59b6;"></div>
                <span>Personal Tasks</span>
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
                    ${appState.days.map(day => `
                        <th class="day-column">${dayNames[day]}</th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    // Group time slots into periods for better organization
    const timePeriods = groupTimeSlotsIntoPeriods(timeSlots);
    
    timePeriods.forEach(period => {
        // Add period header row
        html += `
            <tr>
                <td colspan="${appState.days.length + 1}" class="time-period time-period-${period.period.toLowerCase()}">
                    ${period.period}
                </td>
            </tr>
        `;
        
        // Add time slots for this period
        period.slots.forEach(slot => {
            html += `
                <tr>
                    <td class="time-column">${formatTimeDisplay(slot)}</td>
                    ${appState.days.map(day => {
                        const scheduleItems = appState.schedule[day]?.[slot] || [];
                        return `
                            <td class="time-slot">
                                ${renderScheduleItems(scheduleItems)}
                            </td>
                        `;
                    }).join('')}
                </tr>
            `;
        });
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    
    animateScheduleAppearance();
}

function groupTimeSlotsIntoPeriods(timeSlots) {
    const periods = [
        { period: 'Morning', slots: [] },
        { period: 'Afternoon', slots: [] },
        { period: 'Evening', slots: [] }
    ];
    
    timeSlots.forEach(slot => {
        const [hours] = slot.split(':').map(Number);
        
        if (hours < 12) {
            periods[0].slots.push(slot);
        } else if (hours < 17) {
            periods[1].slots.push(slot);
        } else {
            periods[2].slots.push(slot);
        }
    });
    
    return periods;
}

function renderScheduleItems(items) {
    if (items.length === 0) {
        return '<div class="empty-slot">Available</div>';
    }
    
    return items.map(item => {
        const className = item.type === 'rest' ? 'schedule-rest' : 'schedule-task';
        const compactClass = items.length > 2 ? 'compact' : '';
        
        return `
            <div class="${className} ${compactClass}" 
                 style="background: ${item.color}" 
                 title="${item.name}">
                ${item.name}
            </div>
        `;
    }).join('');
}

function updateScheduleSummary() {
    if (!appState.scheduleStats) return;
    
    const stats = appState.scheduleStats;
    document.getElementById('totalHours').textContent = `${stats.totalScheduledHours}h`;
    document.getElementById('tasksScheduled').textContent = stats.tasksScheduled;
    document.getElementById('efficiencyScore').textContent = `${stats.efficiency}%`;
}

function animateScheduleAppearance() {
    setTimeout(() => {
        const taskBlocks = document.querySelectorAll('.schedule-task');
        taskBlocks.forEach((block, index) => {
            block.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);
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

    const currentStepEl = document.getElementById(`step${appState.currentStep}`);
    currentStepEl.classList.add('fade-out');
    
    setTimeout(() => {
        currentStepEl.classList.remove('active', 'fade-out');
        appState.currentStep = step;
        
        const nextStepEl = document.getElementById(`step${step}`);
        nextStepEl.classList.add('active');
        
        updateProgressIndicator();
        
        if (step === 4) {
            renderSchedule();
        }
    }, 300);
}

function prevStep(step) {
    const currentStepEl = document.getElementById(`step${appState.currentStep}`);
    currentStepEl.classList.add('fade-out');
    
    setTimeout(() => {
        currentStepEl.classList.remove('active', 'fade-out');
        appState.currentStep = step;
        
        const prevStepEl = document.getElementById(`step${step}`);
        prevStepEl.classList.add('active');
        
        updateProgressIndicator();
    }, 300);
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
            
            // Validate that subjects have available days
            for (const subject of appState.subjects) {
                if (subject.availableDays.length === 0) {
                    showNotification(`"${subject.name}" has no available days selected`, 'error');
                    return false;
                }
                
                // Check if weekly duration is reasonable
                const weeklyMinutes = subject.duration * 60;
                const availableMinutes = subject.availableDays.length * 8 * 60; // Approximate 8 hours per day
                if (weeklyMinutes > availableMinutes) {
                    showNotification(`"${subject.name}" may not fit in available days (${subject.duration}h needed, ${Math.round(availableMinutes/60)}h available)`, 'warning');
                }
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
    showNotification(`Exporting schedule as ${format.toUpperCase()}...`, 'info');
    
    // Simulate export process
    setTimeout(() => {
        // In a real implementation, this would make an API call
        const link = document.createElement('a');
        link.download = `schedule_${new Date().toISOString().split('T')[0]}.${format}`;
        
        // Create a simple data URL for demonstration
        if (format === 'png') {
            link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        } else {
            link.href = 'data:application/pdf;base64,JVBERi0xLg10cmFpbGVyPDwvUm9vdDw8L1BhZ2VzPDwvS2lkc1s8PC9NZWRpYUJveFswIDAgMyAzXT4+XT4+Pj4+Pg==';
        }
        
        link.click();
        showNotification(`Schedule exported as ${format.toUpperCase()}!`, 'success');
    }, 1500);
}

// UI Utilities
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : type === 'warning' ? '#f39c12' : '#3498db',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '1001',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification styles
const notificationStyles = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.notification-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.schedule-legend {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
}

.task-block.compact {
    padding: 4px 6px;
    font-size: 0.75rem;
    margin-bottom: 2px;
}

.time-period-morning { background: #e8f4f8; }
.time-period-afternoon { background: #f8f4e8; }
.time-period-evening { background: #f4e8f8; }
`;

// Inject styles
if (!document.querySelector('#notification-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-styles';
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
}

// Sample data for demonstration
function loadSampleData() {
    // Add sample rest period
    appState.restPeriods.push({
        id: 1,
        name: 'Lunch Break',
        startTime: '12:00',
        endTime: '13:00',
        days: [...appState.days],
        applyToAll: true
    });
    
    // Add sample subjects with weekly durations
    appState.subjects.push({
        id: 1,
        name: 'Work Project',
        duration: 15,
        priority: 'high',
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        unavailableTimes: [
            {
                days: ['monday', 'wednesday', 'friday'],
                startTime: '14:00',
                endTime: '15:00'
            }
        ]
    });
    
    appState.subjects.push({
        id: 2,
        name: 'Study Session',
        duration: 10,
        priority: 'medium',
        availableDays: ['monday', 'tuesday', 'thursday'],
        unavailableTimes: []
    });
    
    appState.subjects.push({
        id: 3,
        name: 'Exercise',
        duration: 5,
        priority: 'low',
        availableDays: ['monday', 'wednesday', 'friday'],
        unavailableTimes: []
    });
    
    // Enable daily hours for weekdays
    appState.dailyHours.monday.enabled = true;
    appState.dailyHours.tuesday.enabled = true;
    appState.dailyHours.wednesday.enabled = true;
    appState.dailyHours.thursday.enabled = true;
    appState.dailyHours.friday.enabled = true;
    
    renderDailyHours();
    renderRestPeriods();
    renderSubjects();
}

// Make functions globally available
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