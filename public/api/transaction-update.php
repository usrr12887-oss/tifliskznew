<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([ 'ok' => false, 'error' => 'Method not allowed' ]);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$txId = (int)($input['txId'] ?? 0);
$status = $input['status'] ?? '';
$reason = $input['reason'] ?? null;
$gameCode = $input['gameCode'] ?? null;

$txs = readJson('transactions.json');
$users = readJson('users.json');
if (empty($users)) {
  $users = [
    [ 'id' => 1, 'username' => 'admin', 'phone' => '0501112233', 'password' => 'admin', 'balance' => 1000, 'role' => 'admin', 'status' => 'active', 'gameCode' => null ],
    [ 'id' => 2, 'username' => 'user1', 'phone' => '0502223344', 'password' => '123', 'balance' => 500, 'role' => 'user', 'status' => 'active', 'gameCode' => null ],
  ];
}

$found = false;
foreach ($txs as $i => $t) {
  if ((int)$t['id'] === $txId) {
    $txs[$i]['status'] = $status;
    if ($reason !== null) $txs[$i]['reason'] = $reason;
    if ($gameCode !== null) $txs[$i]['gameCode'] = $gameCode;

    if ($status === 'approved') {
      $amount = (float)($t['amount'] ?? 0);
      $type = $t['type'] ?? 'deposit';
      $delta = ($type === 'deposit') ? $amount : -$amount;
      $un = $t['username'] ?? '';
      foreach ($users as $j => $u) {
        if (($u['username'] ?? '') === $un) {
          $users[$j]['balance'] = ((float)($u['balance'] ?? 0)) + $delta;
          if ($type === 'deposit' && $gameCode !== null) {
            $users[$j]['gameCode'] = $gameCode;
          }
          break;
        }
      }
    }
    $found = true;
    break;
  }
}

if (!$found) {
  http_response_code(404);
  echo json_encode([ 'ok' => false, 'error' => 'Transaction not found' ]);
  exit;
}

writeJson('transactions.json', $txs);
writeJson('users.json', $users);
echo json_encode([ 'ok' => true, 'transactions' => $txs ]);
?>
