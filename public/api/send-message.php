<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Telegram Token və Group ID (backend-də saxlanılır, tam təhlükəsizdir, F12-də görünməz)
define('BOT_TOKEN', '8610192388:AAEswmzFCQWvECBNtwOFYaooa5ls7mDxhuo');
define('CHAT_ID', '-5110900613');

$method = $_REQUEST['method'] ?? '';
if (!$method) {
    echo json_encode(['ok' => false, 'error' => 'No method specified']);
    exit;
}

$url = 'https://api.telegram.org/bot' . BOT_TOKEN . '/' . $method;

// Şəkil yükləmək üçün oxuma forması (multipart/form-data)
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';

if (strpos($contentType, 'multipart/form-data') !== false) {
    $postData = $_POST;
    // Yalnız təyin edilmiş CHAT_ID-yə göndər
    $postData['chat_id'] = CHAT_ID;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    
    if (isset($_FILES['photo'])) {
        $cfile = new CURLFile($_FILES['photo']['tmp_name'], $_FILES['photo']['type'], $_FILES['photo']['name']);
        $postData['photo'] = $cfile;
    }
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);
    echo $result;
    exit;
} else {
    // Normal JSON (və ya GET) 
    $input = file_get_contents('php://input');
    
    if ($input) {
        $data = json_decode($input, true) ?: [];
    } else {
        $data = $_GET; 
    }
    
    // Yalnız təyin edilmiş CHAT_ID-dən məlumatları oxu və ya göndər (getUpdates istisna olmaqla, o da hamısı ilə işləyir)
    if ($method !== 'getUpdates') {
        $data['chat_id'] = CHAT_ID;
    }
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    if (!empty($data) || $_SERVER['REQUEST_METHOD'] === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    
    $result = curl_exec($ch);
    // curl_close buraxılır
    echo $result;
}
?>
