<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([ 'ok' => false, 'error' => 'Method not allowed' ]);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$userId = (int)($input['userId'] ?? 0);
$balanceDelta = (float)($input['balanceDelta'] ?? 0);
$gameCode = isset($input['gameCode']) ? (string)$input['gameCode'] : null;
$wheelSpun = isset($input['wheelSpun']) ? (bool)$input['wheelSpun'] : null;
$bonusPercent = isset($input['bonusPercent']) ? (int)$input['bonusPercent'] : null;

$users = readJson('users.json');
$initialUsers = [
  [ 'id' => 1, 'username' => 'admin', 'phone' => '0501112233', 'password' => 'admin', 'balance' => 1000, 'role' => 'admin', 'status' => 'active', 'gameCode' => null ],
  [ 'id' => 2, 'username' => 'user1', 'phone' => '0502223344', 'password' => '123', 'balance' => 500, 'role' => 'user', 'status' => 'active', 'gameCode' => null ],
];
if (empty($users)) {
  $users = $initialUsers;
}

$found = false;
foreach ($users as $i => $u) {
  if ((int)($u['id'] ?? 0) === $userId) {
    $users[$i]['balance'] = ((float)($u['balance'] ?? 0)) + $balanceDelta;
    if ($gameCode !== null) $users[$i]['gameCode'] = $gameCode;
    if ($wheelSpun !== null) $users[$i]['wheelSpun'] = $wheelSpun;
    if ($bonusPercent !== null) $users[$i]['bonusPercent'] = $bonusPercent;
    $found = true;
    break;
  }
}

if (!$found) {
  http_response_code(404);
  echo json_encode([ 'ok' => false, 'error' => 'User not found' ]);
  exit;
}

writeJson('users.json', $users);
echo json_encode([ 'ok' => true, 'users' => $users ]);
?>
