<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$baseDir = __DIR__ . '/data';
if (!is_dir($baseDir)) {
  mkdir($baseDir, 0755, true);
}
define('DATA_DIR', $baseDir);

function readJson($file) {
  $path = DATA_DIR . '/' . $file;
  if (!file_exists($path)) return [];
  $raw = file_get_contents($path);
  $data = json_decode($raw, true);
  return $data ?: [];
}

function writeJson($file, $data) {
  $path = DATA_DIR . '/' . $file;
  file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
?>
