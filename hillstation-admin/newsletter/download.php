<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/db.php';
require_once dirname(__DIR__, 2) . '/includes/auth.php';

hs_require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.php');
    exit;
}

$token = (string) ($_POST['csrf'] ?? '');
if (!hs_csrf_validate($token)) {
    http_response_code(403);
    echo 'Invalid CSRF token';
    exit;
}

$pdo = hs_db();
$rows = $pdo->query(
    'SELECT id, full_name, email, phone, source, first_subscribed_at, last_subscribed_at
     FROM leads ORDER BY id ASC'
)->fetchAll();

function hs_csv_safe(string $value): string
{
    if ($value !== '' && preg_match('/^[=+\-@]/', $value)) {
        return "'" . $value;
    }
    return $value;
}

$filename = 'hillstation-newsletter-leads-' . gmdate('Y-m-d') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-store');

$out = fopen('php://output', 'w');
fwrite($out, "\xEF\xBB\xBF");
fputcsv($out, ['ID', 'Name', 'Email', 'Phone', 'Source', 'First Subscribed', 'Last Subscribed']);
foreach ($rows as $row) {
    fputcsv($out, [
        (string) $row['id'],
        hs_csv_safe((string) $row['full_name']),
        hs_csv_safe((string) $row['email']),
        hs_csv_safe((string) $row['phone']),
        hs_csv_safe((string) $row['source']),
        (string) $row['first_subscribed_at'],
        (string) $row['last_subscribed_at'],
    ]);
}
fclose($out);
exit;
