<?php
require_once 'data-manager.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// TOKEN və CHAT_ID yalnız burada saxlanılır (Server-side)
define('BOT_TOKEN', '8610192388:AAEswmzFCQWvECBNtwOFYaooa5ls7mDxhuo');
define('CHAT_ID', '-5110900613');

// 1. Telegram Webhook Handling (Bot əmrləri üçün)
$webhookInput = file_get_contents('php://input');
if ($webhookInput) {
    $update = json_decode($webhookInput, true);
    if (isset($update['message']['text'])) {
        $text = $update['message']['text'];
        $fromChatId = $update['message']['chat']['id'];
        
        if ($fromChatId == CHAT_ID) {
            handleBotCommands($text);
        }
    }
}

// 2. API Metodunu Tutmaq
$method = $_REQUEST['method'] ?? '';

// Sistem Metodları (Telegram-a aid olmayanlar)
if ($method === 'getSettings') {
    $settings = getData("settings");
    if (empty($settings)) $settings = ["adminCard" => "Məlumat yoxdur", "adminCardName" => "Admin"];
    echo json_encode($settings);
    exit;
}

if ($method === 'checkBlock') {
    $id = $_GET['id'] ?? '';
    $blockInfo = isUserBlocked($id);
    echo json_encode(['blocked' => $blockInfo !== false, 'until' => $blockInfo]);
    exit;
}

// Telegram Metodları üçün Generic Proxy
if ($method) {
    $url = 'https://api.telegram.org/bot' . BOT_TOKEN . '/' . $method;
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';

    // Multipart Request Handling (Photo Upload)
    if (strpos($contentType, 'multipart/form-data') !== false) {
        $postData = $_POST;
        $postData['chat_id'] = CHAT_ID; // Force our Chat ID
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        if (isset($_FILES['photo'])) {
            $postData['photo'] = new CURLFile($_FILES['photo']['tmp_name'], $_FILES['photo']['type'], $_FILES['photo']['name']);
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        echo curl_exec($ch);
        exit;
    } 
    // JSON & GET Request Handling
    else {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true) ?: [];
        
        // Always enforce Chat ID except for getUpdates
        if ($method !== 'getUpdates') {
            $data['chat_id'] = CHAT_ID;
        }
        
        // Security check for Blocking
        if (isset($data['text'])) {
             preg_match('/Müştəri ID:\s*(\d+)/', $data['text'], $matches);
             if (isset($matches[1]) && isUserBlocked($matches[1])) {
                 echo json_encode(['ok' => false, 'description' => 'User is blocked']);
                 exit;
             }
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || !empty($data)) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
        echo curl_exec($ch);
        exit;
    }
}

// Bot Əmrlərini İdarə Edən Funksiya
function handleBotCommands($text) {
    if (strpos($text, '/kart') === 0) {
        $parts = explode(' ', $text);
        if (count($parts) >= 2) {
            $newCard = $parts[1];
            $newName = isset($parts[2]) ? implode(' ', array_slice($parts, 2)) : "Admin";
            saveData("settings", ["adminCard" => $newCard, "adminCardName" => $newName]);
            sendSimpleMessage("✅ Kart uğurla dəyişdirildi:\n\n💳 Kart: $newCard\n👤 Ad: $newName");
        }
    } 
    elseif (strpos($text, '/blok') === 0) {
        $parts = explode(' ', $text);
        if (count($parts) >= 3) {
            $targetId = $parts[1];
            $minutes = intval($parts[2]);
            $blocks = getData("blocks");
            if ($minutes == 0) { $blocks[$targetId] = 0; $msg = "🚫 İstifadəçi (#$targetId) HƏMİŞƏLİK bloklandı."; }
            else { $expireAt = time() + ($minutes * 60); $blocks[$targetId] = $expireAt; $msg = "⏳ İstifadəçi (#$targetId) $minutes dəqiqəlik bloklandı."; }
            saveData("blocks", $blocks);
            sendSimpleMessage($msg);
        }
    }
    elseif (strpos($text, '/unblok') === 0) {
        $parts = explode(' ', $text);
        if (count($parts) >= 2) {
            $targetId = $parts[1];
            $blocks = getData("blocks");
            unset($blocks[$targetId]);
            saveData("blocks", $blocks);
            sendSimpleMessage("🔓 İstifadəçi (#$targetId) blokdan çıxarıldı.");
        }
    }
}

function sendSimpleMessage($msg) {
    $url = 'https://api.telegram.org/bot' . BOT_TOKEN . '/sendMessage';
    $data = ['chat_id' => CHAT_ID, 'text' => $msg, 'parse_mode' => 'HTML'];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
}
?>
