<?php
// public/api/data-manager.php
// Server tarafında dataları idarə etmək üçün köməkçi fayl

function getData($file) {
    $path = __DIR__ . "/data/" . $file . ".json";
    if (!file_exists($path)) return [];
    return json_decode(file_get_contents($path), true) ?: [];
}

function saveData($file, $data) {
    $path = __DIR__ . "/data/" . $file . ".json";
    if (!is_dir(__DIR__ . "/data")) mkdir(__DIR__ . "/data", 0755, true);
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Bloklama yoxlanışı
function isUserBlocked($usernameOrId) {
    $blocks = getData("blocks");
    foreach ($blocks as $target => $time) {
        if ($target == $usernameOrId) {
            if ($time == 0) return "permanent"; // Həmişəlik
            if ($time > time()) return date("H:i", $time); // Müvəqqəti
        }
    }
    return false;
}
?>
