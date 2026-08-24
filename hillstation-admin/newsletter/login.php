<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/db.php';
require_once dirname(__DIR__, 2) . '/includes/auth.php';

hs_start_session();
if (hs_admin_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hs_csrf_validate($_POST['csrf'] ?? null)) {
        $error = 'Invalid session. Please try again.';
    } elseif (hs_login_rate_limited(strtolower(trim((string) ($_POST['email'] ?? ''))))) {
        $error = 'Too many login attempts. Please wait and try again.';
    } elseif (hs_try_login((string) ($_POST['email'] ?? ''), (string) ($_POST['password'] ?? ''))) {
        header('Location: index.php');
        exit;
    } else {
        $error = 'Invalid email or password.';
    }
}

$csrf = hs_csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Newsletter Signups | The Hill Station</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"/>
  <style>
    :root { --green:#1E3D31; --gold:#A88750; --cream:#F6F6F4; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--cream); font-family:"Hanken Grotesk",system-ui,sans-serif; color:#181818; padding:24px; }
    .card { width:100%; max-width:420px; background:#fff; border:1px solid rgba(30,61,49,.12); padding:36px 28px; }
    .kicker { font-size:11px; letter-spacing:.28em; text-transform:uppercase; color:var(--gold); margin:0 0 8px; }
    h1 { font-family:Georgia,"Libre Caslon Text",serif; font-size:28px; font-weight:400; color:var(--green); margin:0 0 8px; }
    p.sub { margin:0 0 24px; color:#555; font-size:14px; }
    label { display:block; font-size:11px; letter-spacing:.12em; text-transform:uppercase; margin:0 0 6px; color:#444; }
    input { width:100%; border:1px solid rgba(24,24,24,.18); padding:12px 14px; font-size:15px; margin-bottom:16px; }
    button { width:100%; border:0; background:var(--green); color:#fff; padding:14px; font-size:12px; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; }
    button:hover { background:#163028; }
    .err { background:#fde8e8; color:#8a1f1f; padding:10px 12px; margin-bottom:16px; font-size:14px; }
  </style>
</head>
<body>
  <form class="card" method="post" action="">
    <p class="kicker">The Hill Station</p>
    <h1>Newsletter Signups</h1>
    <p class="sub">Sign in to view and export leads.</p>
    <?php if ($error !== ''): ?><div class="err"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div><?php endif; ?>
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>"/>
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required autocomplete="username"/>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" required autocomplete="current-password"/>
    <button type="submit">Sign In</button>
  </form>
</body>
</html>
