<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/db.php';

function hs_client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 64);
}

function hs_start_session(): void
{
    $cfg = hs_config();
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name((string) ($cfg['SESSION_NAME'] ?? 'hs_newsletter_admin'));
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function hs_csrf_token(): string
{
    hs_start_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return (string) $_SESSION['csrf'];
}

function hs_csrf_validate(?string $token): bool
{
    hs_start_session();
    return is_string($token)
        && isset($_SESSION['csrf'])
        && hash_equals((string) $_SESSION['csrf'], $token);
}

function hs_admin_logged_in(): bool
{
    hs_start_session();
    $cfg = hs_config();
    if (empty($_SESSION['admin_id']) || empty($_SESSION['admin_email'])) {
        return false;
    }
    $timeout = (int) ($cfg['SESSION_TIMEOUT'] ?? 7200);
    $last = (int) ($_SESSION['last_active'] ?? 0);
    if ($last > 0 && (time() - $last) > $timeout) {
        hs_admin_logout();
        return false;
    }
    $_SESSION['last_active'] = time();
    return true;
}

function hs_require_admin(): void
{
    if (!hs_admin_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function hs_admin_logout(): void
{
    hs_start_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'] ?? '', (bool) $p['secure'], (bool) $p['httponly']);
    }
    session_destroy();
}

function hs_login_rate_limited(string $email): bool
{
    $cfg = hs_config();
    $pdo = hs_db();
    $window = (int) ($cfg['LOGIN_WINDOW_SECONDS'] ?? 900);
    $max = (int) ($cfg['LOGIN_MAX_ATTEMPTS'] ?? 8);
    $since = time() - $window;
    $ip = hs_client_ip();
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip = ? AND attempted_at >= ?');
    $stmt->execute([$ip, $since]);
    return (int) $stmt->fetchColumn() >= $max;
}

function hs_record_login_attempt(string $email): void
{
    $pdo = hs_db();
    $stmt = $pdo->prepare('INSERT INTO login_attempts (ip, email, attempted_at) VALUES (?, ?, ?)');
    $stmt->execute([hs_client_ip(), strtolower($email), time()]);
}

function hs_try_login(string $email, string $password): bool
{
    $email = strtolower(trim($email));
    if ($email === '' || $password === '') {
        return false;
    }
    if (hs_login_rate_limited($email)) {
        return false;
    }
    $pdo = hs_db();
    $stmt = $pdo->prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, (string) $user['password_hash'])) {
        hs_record_login_attempt($email);
        return false;
    }
    hs_start_session();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int) $user['id'];
    $_SESSION['admin_email'] = (string) $user['email'];
    $_SESSION['last_active'] = time();
    return true;
}

function hs_signup_rate_limited(): bool
{
    $cfg = hs_config();
    $pdo = hs_db();
    $window = (int) ($cfg['SIGNUP_RATE_WINDOW'] ?? 600);
    $max = (int) ($cfg['SIGNUP_RATE_LIMIT'] ?? 12);
    $since = time() - $window;
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM signup_rate WHERE ip = ? AND attempted_at >= ?');
    $stmt->execute([hs_client_ip(), $since]);
    return (int) $stmt->fetchColumn() >= $max;
}

function hs_record_signup_attempt(): void
{
    $pdo = hs_db();
    $stmt = $pdo->prepare('INSERT INTO signup_rate (ip, attempted_at) VALUES (?, ?)');
    $stmt->execute([hs_client_ip(), time()]);
}
