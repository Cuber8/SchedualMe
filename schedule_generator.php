<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data']);
    exit;
}

try {
    $result = generateSchedule($input);
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Schedule generation failed: ' . $e->getMessage()]);
}

function generateSchedule($data) {
    $days = $data['days'] ?? [];
    $dailyHours = $data['dailyHours'] ?? [];
    $restPeriods = $data['restPeriods'] ?? [];
    $subjects = $data['subjects'] ?? [];
    
    $schedule = [];
    $timeSlots = generateTimeSlots();
    $stats = [
        'totalScheduledHours' => 0,
        'tasksScheduled' => 0,
        'efficiency' => 0
    ];
    
    // Initialize schedule structure
    foreach ($days as $day) {
        $schedule[$day] = [];
        foreach ($timeSlots as $slot) {
            $schedule[$day][$slot] = [];
        }
    }
    
    // Add rest periods
    foreach ($restPeriods as $period) {
        $periodDays = $period['applyToAll'] ? $days : array_intersect($period['days'], $days);
        
        foreach ($periodDays as $day) {
            if (!isset($schedule[$day])) continue;
            
            $restSlots = getTimeSlotsBetween($period['startTime'], $period['endTime'], $timeSlots);
            foreach ($restSlots as $slot) {
                if (isset($schedule[$day][$slot])) {
                    $schedule[$day][$slot][] = [
                        'type' => 'rest',
                        'name' => $period['name'],
                        'color' => '#f39c12'
                    ];
                }
            }
        }
    }
    
    // Sort subjects by priority (high first)
    usort($subjects, function($a, $b) {
        $priorityOrder = ['high' => 3, 'medium' => 2, 'low' => 1];
        $aPriority = $priorityOrder[$a['priority'] ?? 'medium'] ?? 2;
        $bPriority = $priorityOrder[$b['priority'] ?? 'medium'] ?? 2;
        return $bPriority - $aPriority;
    });
    
    // Calculate total required minutes per subject
    $subjectRequirements = [];
    foreach ($subjects as $subject) {
        $subjectId = $subject['id'] ?? uniqid();
        $duration = $subject['duration'] ?? 0;
        $availableDays = $subject['availableDays'] ?? [];
        
        $subjectRequirements[$subjectId] = [
            'requiredMinutes' => $duration * 60,
            'scheduledMinutes' => 0,
            'availableDays' => $availableDays
        ];
    }
    
    // Schedule subjects
    foreach ($subjects as $subject) {
        $subjectId = $subject['id'] ?? uniqid();
        $subjectName = $subject['name'] ?? 'Unnamed Task';
        $color = generateColor($subjectId);
        $requiredMinutes = $subjectRequirements[$subjectId]['requiredMinutes'] ?? 0;
        $scheduledMinutes = 0;
        $availableDays = $subject['availableDays'] ?? [];
        
        // Try to schedule this subject
        foreach ($availableDays as $day) {
            if ($scheduledMinutes >= $requiredMinutes) break;
            if (!in_array($day, $days)) continue;
            
            $availableSlots = findAvailableSlots($day, $subject, $schedule, $timeSlots);
            
            foreach ($availableSlots as $slot) {
                if ($scheduledMinutes >= $requiredMinutes) break;
                
                // Check if this slot is available
                if (isSlotAvailable($schedule[$day][$slot])) {
                    $schedule[$day][$slot][] = [
                        'type' => 'task',
                        'name' => $subjectName,
                        'subjectId' => $subjectId,
                        'color' => $color
                    ];
                    $scheduledMinutes += 30; // Each slot is 30 minutes
                    $stats['totalScheduledHours'] += 0.5;
                }
            }
        }
        
        if ($scheduledMinutes > 0) {
            $stats['tasksScheduled']++;
        }
        
        // Update efficiency calculation
        if (isset($subjectRequirements[$subjectId])) {
            $subjectRequirements[$subjectId]['scheduledMinutes'] = $scheduledMinutes;
        }
    }
    
    // Calculate efficiency
    $totalRequired = 0;
    $totalScheduled = 0;
    foreach ($subjectRequirements as $requirement) {
        $totalRequired += $requirement['requiredMinutes'];
        $totalScheduled += $requirement['scheduledMinutes'];
    }
    
    $stats['efficiency'] = $totalRequired > 0 ? round(($totalScheduled / $totalRequired) * 100) : 0;
    $stats['totalScheduledHours'] = round($stats['totalScheduledHours'], 1);
    
    return [
        'success' => true,
        'schedule' => $schedule,
        'stats' => $stats
    ];
}

function isSlotAvailable($slotItems) {
    foreach ($slotItems as $item) {
        if (($item['type'] ?? '') === 'task' || ($item['type'] ?? '') === 'rest') {
            return false;
        }
    }
    return true;
}

function findAvailableSlots($day, $subject, $schedule, $timeSlots) {
    $availableSlots = [];
    $unavailableTimes = $subject['unavailableTimes'] ?? [];
    
    foreach ($timeSlots as $slot) {
        // Check if slot is in unavailable times
        $isUnavailable = false;
        foreach ($unavailableTimes as $unavailable) {
            $unavailableDays = $unavailable['days'] ?? [];
            $startTime = $unavailable['startTime'] ?? '00:00';
            $endTime = $unavailable['endTime'] ?? '00:00';
            
            if (in_array($day, $unavailableDays) && 
                isTimeInRange($slot, $startTime, $endTime)) {
                $isUnavailable = true;
                break;
            }
        }
        
        if ($isUnavailable) continue;
        
        // Check if slot is already occupied
        if (isset($schedule[$day][$slot]) && isSlotAvailable($schedule[$day][$slot])) {
            $availableSlots[] = $slot;
        }
    }
    
    return $availableSlots;
}

function generateTimeSlots() {
    $slots = [];
    for ($hour = 8; $hour <= 20; $hour++) {
        for ($minute = 0; $minute < 60; $minute += 30) {
            $slots[] = sprintf('%02d:%02d', $hour, $minute);
        }
    }
    return $slots;
}

function getTimeSlotsBetween($start, $end, $timeSlots) {
    return array_filter($timeSlots, function($slot) use ($start, $end) {
        return $slot >= $start && $slot < $end;
    });
}

function isTimeInRange($time, $start, $end) {
    return $time >= $start && $time < $end;
}

function generateColor($seed) {
    $colors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c', '#34495e', '#f1c40f', '#e67e22'];
    
    if (is_numeric($seed)) {
        return $colors[$seed % count($colors)];
    } else {
        // Generate hash-based color for string seeds
        $hash = md5($seed);
        return '#' . substr($hash, 0, 6);
    }
}
?>