<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['schedule']) || !isset($input['format'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data']);
    exit;
}

$schedule = $input['schedule'];
$format = $input['format'];
$filename = 'schedule_' . date('Y-m-d_H-i-s');

try {
    switch ($format) {
        case 'png':
            $result = exportAsPNG($schedule, $filename);
            break;
        case 'pdf':
            $result = exportAsPDF($schedule, $filename);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Unsupported format']);
            exit;
    }
    
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Export failed: ' . $e->getMessage()]);
}

function exportAsPNG($schedule, $filename) {
    // For demo purposes, simulate PNG export
    return [
        'success' => true,
        'message' => 'PNG export functionality would be implemented here',
        'filename' => $filename . '.png',
        'url' => '#' // In real implementation, this would be the file URL
    ];
}

function exportAsPDF($schedule, $filename) {
    // For demo purposes, simulate PDF export
    return [
        'success' => true,
        'message' => 'PDF export functionality would be implemented here',
        'filename' => $filename . '.pdf',
        'url' => '#' // In real implementation, this would be the file URL
    ];
}
?>