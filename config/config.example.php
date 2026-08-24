<?php
/**
 * Copy to config.php and fill in real values.
 * config.php is gitignored — never commit secrets.
 *
 * Staging: SQLITE_PATH may live under this site in /data/ (protected by data/.htaccess).
 */
return [
    'SITE_URL' => 'https://hillstationjos.com', // must be absolute https:// for email CTAs
    'ADMIN_BASE_PATH' => '/hillstation-admin/newsletter',

    'NOTIFY_EMAIL' => 'reservations@hillstationjos.com',

    'BREVO_API_KEY' => '',
    'BREVO_SENDER_EMAIL' => 'reservations@hillstationjos.com',
    'BREVO_SENDER_NAME' => 'The Hill Station',

    'SMTP_HOST' => 'smtp-relay.brevo.com',
    'SMTP_PORT' => 587,
    'SMTP_USER' => '',
    'SMTP_PASS' => '',
    'SMTP_SECURE' => 'tls',

    // Staging default: inside the site under /data/ (blocked from web by .htaccess)
    'SQLITE_PATH' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'newsletter.sqlite',

    // Optional override; defaults to data/mail-failures.log next to the DB
    // 'MAIL_LOG_PATH' => dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'mail-failures.log',

    'SESSION_NAME' => 'hs_newsletter_admin',
    'SESSION_TIMEOUT' => 7200,
    'LOGIN_MAX_ATTEMPTS' => 8,
    'LOGIN_WINDOW_SECONDS' => 900,
    'SIGNUP_RATE_LIMIT' => 12,
    'SIGNUP_RATE_WINDOW' => 600,

    // Testing: true = homepage launch popup always shows (ignores “Dismiss for 24 hours”).
    // Set false (or omit) in production.
    'NEWSLETTER_FORCE_POPUP' => false,
];
