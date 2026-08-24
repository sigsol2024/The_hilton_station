<?php

declare(strict_types=1);

/**
 * One-time CLI seed for the newsletter admin user.
 * Usage: php scripts/seed-admin.php 'YourSecurePassword'
 *
 * Password is hashed with password_hash — never stored in config.php.
 * Do not commit plaintext passwords.
 */

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run from CLI only.\n");
    exit(1);
}

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/db.php';

$email = 'admin@hillstationjos.com';
$password = $argv[1] ?? '';

if ($password === '') {
    fwrite(STDERR, "Usage: php scripts/seed-admin.php 'YourSecurePassword'\n");
    fwrite(STDERR, "Creates or updates {$email} with a password_hash in SQLite.\n");
    exit(1);
}

if (strlen($password) < 10) {
    fwrite(STDERR, "Password must be at least 10 characters.\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$now = gmdate('Y-m-d H:i:s');

$pdo = hs_db();
$stmt = $pdo->prepare('SELECT id FROM admin_users WHERE email = ?');
$stmt->execute([$email]);
$existing = $stmt->fetch();

if ($existing) {
    $upd = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?');
    $upd->execute([$hash, (int) $existing['id']]);
    echo "Updated admin password hash for {$email}\n";
} else {
    $ins = $pdo->prepare('INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)');
    $ins->execute([$email, $hash, $now]);
    echo "Created admin {$email}\n";
}

echo "SQLite: " . hs_config()['SQLITE_PATH'] . "\n";
echo "Done.\n";
