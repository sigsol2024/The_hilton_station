<?php

declare(strict_types=1);

function hs_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $path = dirname(__DIR__) . '/config/config.php';
    if (!is_file($path)) {
        hs_fatal_config('Missing config/config.php — copy config/config.example.php');
    }
    $config = require $path;
    if (empty($config['SQLITE_PATH'])) {
        hs_fatal_config('SQLITE_PATH is required and must be outside the web root');
    }
    return $config;
}

function hs_fatal_config(string $message): void
{
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

function hs_json_response(array $payload, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload);
    exit;
}

function hs_site_url(string $path = ''): string
{
    $cfg = hs_config();
    $base = rtrim((string) ($cfg['SITE_URL'] ?? ''), '/');
    if ($path === '') {
        return $base;
    }
    // Preserve already-encoded segments (e.g. logo paths with %20)
    return $base . '/' . ltrim($path, '/');
}

/**
 * Absolute admin URL. Trailing slash for email CTAs.
 */
function hs_admin_url(string $path = ''): string
{
    $cfg = hs_config();
    $base = rtrim((string) ($cfg['ADMIN_BASE_PATH'] ?? '/hillstation-admin/newsletter'), '/');
    if ($path === '') {
        return rtrim(hs_site_url($base), '/') . '/';
    }
    return hs_site_url($base . '/' . ltrim($path, '/'));
}
