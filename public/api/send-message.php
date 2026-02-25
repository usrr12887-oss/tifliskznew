<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Məhdudiyyət üçün bunu yalnız öz saytınıza təyin edə bilərsiniz, məsələn: header('Access-Control-Allow-Origin: https://sizin-saytiniz.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(['ok' => false, 'error' => 'Only POST allowed']);
  exit;
}

// Telegram Token v? Group ID (backend-d? saxlan?l?r, t?hl?k?sizdir)
define('BOT_TOKEN', '8610192388:AAEswmzFCQWvECBNtwOFYaooa5ls7mDxhuo');
define('CHAT_ID', '-5110900613');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$text = isset($data['text']) ? $data['text'] : '';

if (empty($text)) {
    echo json_encode(['ok' => false, 'error' => 'Message text is empty']);
    exit;
}

$url = 'https://api.telegram.org/bot' . BOT_TOKEN . '/sendMessage';

$postData = [
    'chat_id' => CHAT_ID,
    'text' => $text,
    'parse_mode' => 'HTML'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

try {
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if(curl_errno($ch)){
        throw new Exception(curl_error($ch));
    }
    
    echo $result;
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => 'cURL error: ' . $e->getMessage()]);
}
?>
