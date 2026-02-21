<?php
require 'config.php';

$initialUsers = [
  [ 'id' => 1, 'username' => 'admin', 'phone' => '0501112233', 'password' => 'admin', 'balance' => 1000, 'role' => 'admin', 'status' => 'active', 'gameCode' => null ],
  [ 'id' => 2, 'username' => 'user1', 'phone' => '0502223344', 'password' => '123', 'balance' => 500, 'role' => 'user', 'status' => 'active', 'gameCode' => null ],
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $users = readJson('users.json');
  if (empty($users)) {
    $users = $initialUsers;
    writeJson('users.json', $users);
  }
  echo json_encode($users);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $users = readJson('users.json');
  if (empty($users)) {
    $users = $initialUsers;
  }
  $username = trim($input['username'] ?? '');
  $phone = trim($input['phone'] ?? '');
  $password = $input['password'] ?? '';

  foreach ($users as $u) {
    if (isset($u['username']) && $u['username'] === $username) {
      http_response_code(400);
      echo json_encode([ 'ok' => false, 'error' => 'Bu istifadəçi adı artıq mövcuddur.' ]);
      exit;
    }
    if (!empty($phone) && isset($u['phone']) && $u['phone'] === $phone) {
      http_response_code(400);
      echo json_encode([ 'ok' => false, 'error' => 'Bu telefon nömrəsi artıq qeydiyyatdadır.' ]);
      exit;
    }
  }

  $newId = 1;
  foreach ($users as $u) {
    $id = (int)($u['id'] ?? 0);
    if ($id >= $newId) $newId = $id + 1;
  }
  $newUser = [
    'id' => $newId,
    'username' => $username,
    'phone' => $phone,
    'password' => $password,
    'balance' => 0,
    'role' => 'user',
    'status' => 'active',
    'gameCode' => null
  ];
  $users[] = $newUser;
  writeJson('users.json', $users);
  echo json_encode([ 'ok' => true, 'user' => $newUser ]);
  exit;
}

http_response_code(405);
echo json_encode([ 'ok' => false, 'error' => 'Method not allowed' ]);
?>
