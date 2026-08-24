<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function hs_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $cfg = hs_config();
    $path = (string) $cfg['SQLITE_PATH'];
    hs_assert_sqlite_path($path);
    $dir = dirname($path);
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true) && !is_dir($dir)) {
            throw new RuntimeException('Cannot create SQLite directory at: ' . $dir);
        }
    }

    $pdo = new PDO('sqlite:' . $path, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('PRAGMA journal_mode = WAL');
    hs_migrate($pdo);
    if (is_file($path)) {
        @chmod($path, 0600);
    }
    return $pdo;
}

/** SQLITE_PATH must be a non-empty absolute path (staging may live under the site folder). */
function hs_assert_sqlite_path(string $path): void
{
    if ($path === '' || !preg_match('#^([A-Za-z]:[\\\\/]|/)#', $path)) {
        throw new RuntimeException('SQLITE_PATH must be an absolute filesystem path.');
    }
}

function hs_migrate(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            full_name TEXT NOT NULL DEFAULT \'\',
            phone TEXT NOT NULL DEFAULT \'\',
            source TEXT NOT NULL DEFAULT \'footer\',
            marketing_consent INTEGER NOT NULL DEFAULT 1,
            consent_at TEXT,
            first_subscribed_at TEXT NOT NULL,
            last_subscribed_at TEXT NOT NULL,
            notification_status TEXT NOT NULL DEFAULT \'pending\',
            notification_method TEXT NOT NULL DEFAULT \'none\',
            notification_error TEXT
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            email TEXT NOT NULL,
            attempted_at INTEGER NOT NULL
        )'
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS signup_rate (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            attempted_at INTEGER NOT NULL
        )'
    );

    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts (ip, attempted_at)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_signup_rate_ip_time ON signup_rate (ip, attempted_at)');

    hs_ensure_lead_ids_start_at_1001($pdo);
}

/** First real lead id should be 1001+ (plan). */
function hs_ensure_lead_ids_start_at_1001(PDO $pdo): void
{
    $count = (int) $pdo->query('SELECT COUNT(*) FROM leads')->fetchColumn();
    if ($count > 0) {
        return;
    }
    $pdo->exec(
        "INSERT INTO leads (
            id, email, full_name, phone, source, marketing_consent, consent_at,
            first_subscribed_at, last_subscribed_at, notification_status, notification_method
         ) VALUES (
            1000, '__id_anchor__@invalid.local', '', '', 'footer', 0, NULL,
            '1970-01-01 00:00:00', '1970-01-01 00:00:00', 'none', 'none'
         )"
    );
    $pdo->exec("DELETE FROM leads WHERE id = 1000");
}
