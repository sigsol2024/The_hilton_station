<?php
/**
 * Copy to config.php and fill in real values.
 * config.php is gitignored — never commit secrets.
 *
 * SQLITE_PATH must be an absolute path OUTSIDE the public web root.
 * Example: /home/user/hillstation-private/newsletter.sqlite
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

    // REQUIRED: absolute path outside public_html / site document root
    // Local sibling example (outside this repo folder):
    // dirname(__DIR__, 2) . '/hillstation-private/newsletter.sqlite'
    'SQLITE_PATH' => '/home/REPLACE/hillstation-private/newsletter.sqlite',

    // Optional. Defaults to same folder as SQLITE_PATH: mail-failures.log
    // 'MAIL_LOG_PATH' => '/home/REPLACE/hillstation-private/mail-failures.log',

    'SESSION_NAME' => 'hs_newsletter_admin',
    'SESSION_TIMEOUT' => 7200,
    'LOGIN_MAX_ATTEMPTS' => 8,
    'LOGIN_WINDOW_SECONDS' => 900,
    'SIGNUP_RATE_LIMIT' => 12,
    'SIGNUP_RATE_WINDOW' => 600,
];
