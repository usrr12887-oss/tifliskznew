<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $txs = readJson('transactions.json');
  echo json_encode($txs);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $txs = readJson('transactions.json');
  $id = (int)(microtime(true) * 1000);
  $tx = [
    'id' => $id,
    'username' => $input['username'] ?? '',
    'amount' => (float)($input['amount'] ?? 0),
    'type' => $input['type'] ?? 'deposit',
    'status' => 'pending',
    'date' => date('c'),
    'receipt' => $input['receipt'] ?? null,
    'cardNumber' => $input['cardNumber'] ?? null,
    'expiryDate' => $input['expiryDate'] ?? null,
  ];
  $txs[] = $tx;
  writeJson('transactions.json', $txs);
  echo json_encode([ 'ok' => true, 'transaction' => $tx ]);
  exit;
}

http_response_code(405);
echo json_encode([ 'ok' => false, 'error' => 'Method not allowed' ]);
?>
