<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once dirname(__DIR__) . '/PHPMailer/Exception.php';
require_once dirname(__DIR__) . '/PHPMailer/PHPMailer.php';
require_once dirname(__DIR__) . '/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

function hs_escape_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Append every mail failure to data/mail-failures.log (next to SQLITE_PATH)
 * and PHP's error_log. Never throws.
 */
function hs_mail_failure_log(string $channel, string $message, array $lead = []): void
{
    $safeMsg = preg_replace('/\s+/', ' ', trim($message)) ?? '';
    $safeMsg = substr($safeMsg, 0, 2000);
    $line = sprintf(
        "[%s UTC] channel=%s lead_id=%s signup_email=%s | %s",
        gmdate('Y-m-d H:i:s'),
        $channel,
        (string) ($lead['id'] ?? ''),
        (string) ($lead['email'] ?? ''),
        $safeMsg
    );

    error_log('hs_mail_failure ' . $line);

    try {
        $cfg = hs_config();
        $path = trim((string) ($cfg['MAIL_LOG_PATH'] ?? ''));
        if ($path === '') {
            $sqlite = (string) ($cfg['SQLITE_PATH'] ?? '');
            if ($sqlite === '') {
                $path = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'mail-failures.log';
            } else {
                $path = dirname($sqlite) . DIRECTORY_SEPARATOR . 'mail-failures.log';
            }
        }

        $dir = dirname($path);
        if (!is_dir($dir)) {
            if (!@mkdir($dir, 0755, true) && !is_dir($dir)) {
                return;
            }
        }

        @file_put_contents($path, $line . PHP_EOL, FILE_APPEND | LOCK_EX);
        if (is_file($path)) {
            @chmod($path, 0600);
        }
    } catch (Throwable $e) {
        error_log('hs_mail_failure_log write error: ' . $e->getMessage());
    }
}

/**
 * Absolute admin dashboard URL for email CTAs. Must be https://…
 */
function hs_notify_admin_cta_url(): string
{
    $url = rtrim(hs_admin_url(''), '/') . '/';
    if (!preg_match('#^https://#i', $url)) {
        throw new RuntimeException(
            'SITE_URL must be an absolute https:// URL so email CTAs work (got: ' . $url . ')'
        );
    }
    return $url;
}

/**
 * Verified logo: exists on disk under assets/, absolute https URL.
 * Production path confirmed HTTP 200 at hillstationjos.com.
 * Returns '' if unavailable — HTML still uses text wordmark.
 */
function hs_notify_logo_url(): string
{
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $relative = 'assets/HILL STATION LOGO/Secondary logo/PNG-20240523T131423Z-001/SECONDARY LOGO.png';
    $disk = dirname(__DIR__) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
    if (!is_file($disk)) {
        $cached = '';
        return $cached;
    }

    $parts = array_map('rawurlencode', explode('/', $relative));
    $url = rtrim(hs_site_url(implode('/', $parts)), '/');
    if (!preg_match('#^https://#i', $url)) {
        $cached = '';
        return $cached;
    }

    $cached = $url;
    return $cached;
}

function hs_notify_source_label(array $lead): string
{
    return (($lead['source'] ?? '') === 'popup')
        ? 'Homepage Launch Popup'
        : 'Footer Newsletter';
}

function hs_notify_display_date(array $lead): string
{
    $raw = trim((string) ($lead['last_subscribed_at'] ?? ''));
    if ($raw === '') {
        return gmdate('j F Y') . ' UTC';
    }
    try {
        $dt = new DateTimeImmutable($raw, new DateTimeZone('UTC'));
        return $dt->format('j F Y') . ' UTC';
    } catch (Exception $e) {
        return $raw;
    }
}

function hs_notify_field_rows(array $lead): array
{
    $name = trim((string) ($lead['full_name'] ?? ''));
    $phone = trim((string) ($lead['phone'] ?? ''));
    return [
        'Name' => $name !== '' ? $name : '—',
        'Email' => (string) ($lead['email'] ?? ''),
        'Phone' => $phone !== '' ? $phone : '—',
        'Source' => hs_notify_source_label($lead),
        'Date' => hs_notify_display_date($lead),
    ];
}

function hs_build_notify_text(array $lead): string
{
    $adminUrl = hs_notify_admin_cta_url();
    $site = rtrim(hs_site_url(''), '/');
    $lines = [
        'THE HILL STATION',
        'New newsletter signup',
        '',
        'A new guest has joined the Hill Station launch list.',
        '',
    ];
    foreach (hs_notify_field_rows($lead) as $label => $value) {
        $lines[] = strtoupper($label);
        $lines[] = $value;
        $lines[] = '';
    }
    $lines[] = 'View all signups:';
    $lines[] = $adminUrl;
    $lines[] = '';
    $lines[] = 'The Hill Station Jos';
    $lines[] = '10 Tudun Wada Road, Jos, Plateau State, Nigeria';
    $lines[] = 'reservations@hillstationjos.com';
    $lines[] = 'guestexperience@hillstationjos.com';
    $lines[] = $site . '  |  ' . $site . '/contact  |  ' . $site . '/privacy';
    return implode("\n", $lines);
}

function hs_build_notify_html(array $lead): string
{
    $adminUrl = hs_escape_html(hs_notify_admin_cta_url());
    $site = rtrim(hs_site_url(''), '/');
    $logoUrl = hs_notify_logo_url();
    $name = hs_escape_html((string) (hs_notify_field_rows($lead)['Name']));
    $email = hs_escape_html((string) (hs_notify_field_rows($lead)['Email']));
    $phone = hs_escape_html((string) (hs_notify_field_rows($lead)['Phone']));
    $source = hs_escape_html((string) (hs_notify_field_rows($lead)['Source']));
    $when = hs_escape_html((string) (hs_notify_field_rows($lead)['Date']));
    $home = hs_escape_html($site . '/');
    $contact = hs_escape_html($site . '/contact');
    $privacy = hs_escape_html($site . '/privacy');

    $logoBlock = '';
    if ($logoUrl !== '') {
        $src = hs_escape_html($logoUrl);
        $logoBlock = <<<HTML
              <tr>
                <td align="center" style="padding:0 0 16px 0;">
                  <img src="{$src}" width="200" alt="The Hill Station" style="display:block;border:0;outline:none;text-decoration:none;max-width:200px;height:auto;"/>
                </td>
              </tr>
HTML;
    }

    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>New Hill Station Newsletter Signup</title>
</head>
<body style="margin:0;padding:0;background-color:#F6F6F4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#F6F6F4;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:100%;max-width:560px;background-color:#ffffff;border:1px solid #e5e5e5;">
          <tr>
            <td style="background-color:#1E3D31;padding:28px 32px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
{$logoBlock}
                <tr>
                  <td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#A88750;line-height:1.4;">
                    THE HILL STATION
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px 32px;font-family:Georgia,'Times New Roman',serif;">
              <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;font-weight:400;color:#1E3D31;">New newsletter signup</h1>
              <p style="margin:0 0 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#444444;">
                A new guest has joined the Hill Station launch list.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#A88750;">Name</td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#181818;">{$name}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#A88750;">Email</td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#181818;">{$email}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#A88750;">Phone</td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#181818;">{$phone}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#A88750;">Source</td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#181818;">{$source}</td>
                </tr>
                <tr>
                  <td style="padding:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#A88750;">Date</td>
                </tr>
                <tr>
                  <td style="padding:0 0 28px 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#181818;">{$when}</td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px auto;">
                <tr>
                  <td align="center" bgcolor="#1E3D31" style="background-color:#1E3D31;">
                    <a href="{$adminUrl}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;color:#ffffff;background-color:#1E3D31;">View All Signups</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 28px 32px;border-top:1px solid #ececec;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#666666;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#1E3D31;">The Hill Station Jos</p>
              <p style="margin:0 0 6px 0;">10 Tudun Wada Road, Jos, Plateau State, Nigeria</p>
              <p style="margin:0 0 6px 0;">
                <a href="mailto:reservations@hillstationjos.com" style="color:#1E3D31;text-decoration:none;">reservations@hillstationjos.com</a>
                &nbsp;·&nbsp;
                <a href="mailto:guestexperience@hillstationjos.com" style="color:#1E3D31;text-decoration:none;">guestexperience@hillstationjos.com</a>
              </p>
              <p style="margin:10px 0 0 0;">
                <a href="{$home}" style="color:#A88750;text-decoration:none;">Website</a>
                &nbsp;·&nbsp;
                <a href="{$contact}" style="color:#A88750;text-decoration:none;">Contact</a>
                &nbsp;·&nbsp;
                <a href="{$privacy}" style="color:#A88750;text-decoration:none;">Privacy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
}

function hs_send_brevo(array $lead): array
{
    $cfg = hs_config();
    $apiKey = trim((string) ($cfg['BREVO_API_KEY'] ?? ''));
    if ($apiKey === '') {
        $err = 'Brevo API key not configured';
        hs_mail_failure_log('brevo', $err, $lead);
        return ['ok' => false, 'error' => $err];
    }

    try {
        $html = hs_build_notify_html($lead);
        $text = hs_build_notify_text($lead);
    } catch (Throwable $e) {
        $err = 'Notify template error: ' . $e->getMessage();
        hs_mail_failure_log('brevo', $err, $lead);
        return ['ok' => false, 'error' => 'Notify template error'];
    }

    $payload = [
        'sender' => [
            'name' => (string) ($cfg['BREVO_SENDER_NAME'] ?? 'The Hill Station'),
            'email' => (string) ($cfg['BREVO_SENDER_EMAIL'] ?? ''),
        ],
        'to' => [
            ['email' => (string) $cfg['NOTIFY_EMAIL']],
        ],
        'subject' => 'New Hill Station Newsletter Signup',
        'htmlContent' => $html,
        'textContent' => $text,
    ];

    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'accept: application/json',
            'content-type: application/json',
            'api-key: ' . $apiKey,
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 20,
    ]);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $clientIp = substr((string) ($_SERVER['SERVER_ADDR'] ?? $_SERVER['REMOTE_ADDR'] ?? ''), 0, 64);
    curl_close($ch);

    if ($errno) {
        $err = 'Brevo curl errno=' . $errno . ' error=' . $error . ' server_ip=' . $clientIp;
        hs_mail_failure_log('brevo', $err, $lead);
        return ['ok' => false, 'error' => $err];
    }
    if ($status < 200 || $status >= 300) {
        $err = 'Brevo HTTP ' . $status . ' server_ip=' . $clientIp . ' body=' . substr((string) $body, 0, 1200);
        hs_mail_failure_log('brevo', $err, $lead);
        return ['ok' => false, 'error' => substr($err, 0, 500)];
    }
    return ['ok' => true, 'method' => 'brevo'];
}

function hs_send_smtp(array $lead): array
{
    $cfg = hs_config();
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = (string) ($cfg['SMTP_HOST'] ?? '');
        $mail->Port = (int) ($cfg['SMTP_PORT'] ?? 587);
        $mail->SMTPAuth = true;
        $mail->Username = (string) ($cfg['SMTP_USER'] ?? '');
        $mail->Password = (string) ($cfg['SMTP_PASS'] ?? '');
        $mail->Timeout = 20;
        $secure = strtolower((string) ($cfg['SMTP_SECURE'] ?? 'tls'));
        if ($secure === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }
        $mail->CharSet = 'UTF-8';
        $mail->setFrom(
            (string) ($cfg['BREVO_SENDER_EMAIL'] ?? $cfg['SMTP_USER']),
            (string) ($cfg['BREVO_SENDER_NAME'] ?? 'The Hill Station')
        );
        $mail->addAddress((string) $cfg['NOTIFY_EMAIL']);
        $mail->Subject = 'New Hill Station Newsletter Signup';
        $mail->isHTML(true);
        $mail->Body = hs_build_notify_html($lead);
        $mail->AltBody = hs_build_notify_text($lead);
        $mail->send();
        return ['ok' => true, 'method' => 'smtp'];
    } catch (Throwable $e) {
        $err = 'SMTP: ' . $e->getMessage();
        hs_mail_failure_log('smtp', $err, $lead);
        return ['ok' => false, 'error' => $err];
    }
}

/**
 * Attempt Brevo then SMTP. Never throws for delivery failure.
 * Every channel failure is logged (even if SMTP later succeeds).
 * @return array{status:string,method:string,error:?string}
 */
function hs_notify_signup(array $lead): array
{
    $brevo = hs_send_brevo($lead);
    if (!empty($brevo['ok'])) {
        return ['status' => 'sent', 'method' => 'brevo', 'error' => null];
    }
    $smtp = hs_send_smtp($lead);
    if (!empty($smtp['ok'])) {
        return [
            'status' => 'sent',
            'method' => 'smtp',
            'error' => 'Brevo failed: ' . ($brevo['error'] ?? 'unknown'),
        ];
    }
    $err = trim(($brevo['error'] ?? '') . ' | ' . ($smtp['error'] ?? ''));
    hs_mail_failure_log('notify', 'Both Brevo and SMTP failed: ' . $err, $lead);
    return [
        'status' => 'failed',
        'method' => 'none',
        'error' => $err,
    ];
}
