<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';
require_once dirname(__DIR__) . '/includes/db.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/mailer.php';

function hs_cors_origin(): string
{
    $allowed = rtrim((string) (hs_config()['SITE_URL'] ?? ''), '/');
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && rtrim($origin, '/') === $allowed) {
        return $origin;
    }
    return $allowed !== '' ? $allowed : '*';
}

function hs_clip(string $value, int $max): string
{
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max);
    }
    return substr($value, 0, $max);
}

function hs_sanitize_name(string $name): string
{
    $name = trim(preg_replace('/\s+/u', ' ', $name) ?? '');
    $name = preg_replace('/[^\p{L}\p{M}\p{N}\s\'.\-]/u', '', $name) ?? '';
    return hs_clip($name, 120);
}

function hs_sanitize_phone(string $phone): string
{
    $phone = trim($phone);
    $phone = preg_replace('/[^\d+\s\-().]/', '', $phone) ?? '';
    $phone = preg_replace('/\s+/', ' ', $phone) ?? '';
    return hs_clip($phone, 32);
}

try {
    $cors = hs_cors_origin();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: ' . $cors);
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Vary: Origin');
        exit;
    }

    header('Access-Control-Allow-Origin: ' . $cors);
    header('Vary: Origin');

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        hs_json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    if (!is_array($data)) {
        $data = $_POST;
    }

    // Honeypot
    if (!empty($data['website'])) {
        hs_json_response(['ok' => true, 'message' => 'Thanks']);
    }

    if (hs_signup_rate_limited()) {
        hs_json_response(['ok' => false, 'error' => 'Too many requests. Please try again later.'], 429);
    }
    hs_record_signup_attempt();

    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $fullName = hs_sanitize_name((string) ($data['full_name'] ?? ''));
    $phone = hs_sanitize_phone((string) ($data['phone'] ?? ''));
    $source = strtolower(trim((string) ($data['source'] ?? 'footer')));
    if ($source !== 'popup') {
        $source = 'footer';
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
        hs_json_response(['ok' => false, 'error' => 'Please enter a valid email address.'], 422);
    }

    if ($source === 'popup') {
        if ($fullName === '') {
            hs_json_response(['ok' => false, 'error' => 'Please enter your full name.'], 422);
        }
        if ($phone === '') {
            hs_json_response(['ok' => false, 'error' => 'Please enter your phone number.'], 422);
        }
    }

    $now = gmdate('Y-m-d H:i:s');
    $pdo = hs_db();

    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $stmt = $pdo->prepare(
            'INSERT INTO leads (
                email, full_name, phone, source, marketing_consent, consent_at,
                first_subscribed_at, last_subscribed_at,
                notification_status, notification_method, notification_error
            ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, \'pending\', \'none\', NULL)
            ON CONFLICT(email) DO UPDATE SET
                full_name = CASE WHEN excluded.full_name = \'\' THEN leads.full_name ELSE excluded.full_name END,
                phone = CASE WHEN excluded.phone = \'\' THEN leads.phone ELSE excluded.phone END,
                source = excluded.source,
                marketing_consent = 1,
                consent_at = excluded.consent_at,
                last_subscribed_at = excluded.last_subscribed_at,
                notification_status = \'pending\',
                notification_method = \'none\',
                notification_error = NULL'
        );
        $stmt->execute([$email, $fullName, $phone, $source, $now, $now, $now]);

        $idStmt = $pdo->prepare('SELECT id FROM leads WHERE email = ? LIMIT 1');
        $idStmt->execute([$email]);
        $leadId = (int) $idStmt->fetchColumn();
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('newsletter-signup save failed: ' . $e->getMessage());
        hs_json_response(['ok' => false, 'error' => 'Unable to save your signup. Please try again.'], 500);
    }

    $leadStmt = $pdo->prepare('SELECT * FROM leads WHERE id = ?');
    $leadStmt->execute([$leadId]);
    $lead = $leadStmt->fetch() ?: [
        'email' => $email,
        'full_name' => $fullName,
        'phone' => $phone,
        'source' => $source,
        'last_subscribed_at' => $now,
    ];

    $notify = hs_notify_signup($lead);
    $upd = $pdo->prepare(
        'UPDATE leads SET notification_status = ?, notification_method = ?, notification_error = ? WHERE id = ?'
    );
    $upd->execute([
        $notify['status'],
        $notify['method'],
        $notify['error'] !== null ? hs_clip((string) $notify['error'], 500) : null,
        $leadId,
    ]);

    hs_json_response([
        'ok' => true,
        'message' => 'Hooray — you’re among the first guests to claim 10% off at The Hill Station’s official launch.',
    ]);
} catch (Throwable $e) {
    error_log('newsletter-signup fatal: ' . $e->getMessage());
    hs_json_response(['ok' => false, 'error' => 'Unable to process your signup. Please try again.'], 500);
}
