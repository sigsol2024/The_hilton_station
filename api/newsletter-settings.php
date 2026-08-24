<?php

declare(strict_types=1);

/**
 * Public newsletter UI settings only — no secrets.
 * Used by newsletter.js so config.php can force-show the homepage popup for testing.
 */

require_once dirname(__DIR__) . '/includes/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$cfg = hs_config();
$allowed = rtrim((string) ($cfg['SITE_URL'] ?? ''), '/');
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '' && rtrim($origin, '/') === $allowed) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
} elseif ($allowed !== '') {
    header('Access-Control-Allow-Origin: ' . $allowed);
    header('Vary: Origin');
}

echo json_encode([
    'ok' => true,
    // true = always show homepage popup (ignore 24h dismiss). Set false in production.
    'forcePopup' => !empty($cfg['NEWSLETTER_FORCE_POPUP']),
]);
