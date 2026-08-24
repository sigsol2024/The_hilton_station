<?php

declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/db.php';
require_once dirname(__DIR__, 2) . '/includes/auth.php';

hs_require_admin();

$pdo = hs_db();
$q = trim((string) ($_GET['q'] ?? ''));
$sort = strtolower((string) ($_GET['sort'] ?? 'newest'));
$order = $sort === 'oldest' ? 'ASC' : 'DESC';
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 25;
$offset = ($page - 1) * $perPage;

$where = '';
$params = [];
if ($q !== '') {
    $where = 'WHERE email LIKE ? OR full_name LIKE ? OR phone LIKE ? OR CAST(id AS TEXT) LIKE ?';
    $like = '%' . $q . '%';
    $params = [$like, $like, $like, $like];
}

$countStmt = $pdo->prepare('SELECT COUNT(*) FROM leads ' . $where);
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();
$pages = max(1, (int) ceil($total / $perPage));

$listSql = 'SELECT id, full_name, email, phone, source, last_subscribed_at, notification_status, notification_method FROM leads '
    . $where . ' ORDER BY last_subscribed_at ' . $order . ' LIMIT ' . $perPage . ' OFFSET ' . $offset;
$listStmt = $pdo->prepare($listSql);
$listStmt->execute($params);
$leads = $listStmt->fetchAll();
$email = (string) ($_SESSION['admin_email'] ?? '');
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
    body { margin:0; background:var(--cream); font-family:"Hanken Grotesk",system-ui,sans-serif; color:#181818; }
    header { background:var(--green); color:#fff; padding:18px 24px; display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between; }
    header h1 { margin:0; font-family:Georgia,serif; font-size:22px; font-weight:400; }
    header a, header button { color:#fff; text-decoration:none; font-size:12px; letter-spacing:.1em; text-transform:uppercase; background:transparent; border:1px solid rgba(255,255,255,.35); padding:8px 12px; cursor:pointer; }
    header button.btn-green { background:var(--gold); border-color:var(--gold); color:#1E3D31; }
    main { max-width:1100px; margin:0 auto; padding:28px 20px 48px; }
    .meta { display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .total { font-size:15px; }
    .total strong { color:var(--green); }
    form.search { display:flex; gap:8px; flex-wrap:wrap; }
    input[type=search] { border:1px solid rgba(24,24,24,.18); padding:10px 12px; min-width:220px; }
    select, .btn { border:1px solid rgba(24,24,24,.18); background:#fff; padding:10px 12px; cursor:pointer; font-size:13px; }
    table { width:100%; border-collapse:collapse; background:#fff; }
    th, td { text-align:left; padding:12px 10px; border-bottom:1px solid rgba(24,24,24,.08); font-size:14px; vertical-align:top; }
    th { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:#666; }
    .pager { display:flex; gap:8px; margin-top:20px; flex-wrap:wrap; }
    .pager a { padding:8px 12px; background:#fff; border:1px solid rgba(24,24,24,.12); text-decoration:none; color:#181818; }
    .empty { padding:40px; text-align:center; background:#fff; color:#666; }
    .notify-sent { color:var(--green); }
    .notify-failed { color:#8a1f1f; }
    .notify-pending { color:#888; }
    @media (max-width:720px) {
      table, thead, tbody, th, td, tr { display:block; }
      thead { display:none; }
      tr { border:1px solid rgba(24,24,24,.08); margin-bottom:12px; background:#fff; padding:8px; }
      td { border:0; padding:6px 8px; }
      td::before { content:attr(data-label); display:block; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:#888; margin-bottom:2px; }
    }
  </style>
</head>
<body>
<header>
  <h1>Newsletter Signups</h1>
  <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
    <span style="opacity:.75;font-size:13px;"><?= htmlspecialchars($email, ENT_QUOTES, 'UTF-8') ?></span>
    <form method="post" action="download.php" style="margin:0;">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>"/>
      <button class="btn-green" type="submit">Download CSV</button>
    </form>
    <a href="logout.php">Logout</a>
  </div>
</header>
<main>
  <div class="meta">
    <p class="total">Total: <strong><?= $total ?></strong></p>
    <form class="search" method="get" action="">
      <input type="search" name="q" value="<?= htmlspecialchars($q, ENT_QUOTES, 'UTF-8') ?>" placeholder="Search name, email, phone, ID"/>
      <select name="sort">
        <option value="newest" <?= $sort !== 'oldest' ? 'selected' : '' ?>>Newest first</option>
        <option value="oldest" <?= $sort === 'oldest' ? 'selected' : '' ?>>Oldest first</option>
      </select>
      <button class="btn" type="submit">Search</button>
    </form>
  </div>

  <?php if (!$leads): ?>
    <div class="empty">No signups yet.</div>
  <?php else: ?>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Source</th>
        <th>Notify</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($leads as $lead):
      $status = (string) ($lead['notification_status'] ?? 'pending');
      $method = (string) ($lead['notification_method'] ?? 'none');
      $notifyLabel = $status . ($method !== 'none' ? ' / ' . $method : '');
      $notifyClass = $status === 'sent' ? 'notify-sent' : ($status === 'failed' ? 'notify-failed' : 'notify-pending');
    ?>
      <tr>
        <td data-label="ID"><?= (int) $lead['id'] ?></td>
        <td data-label="Name"><?= htmlspecialchars((string) $lead['full_name'], ENT_QUOTES, 'UTF-8') ?></td>
        <td data-label="Email"><?= htmlspecialchars((string) $lead['email'], ENT_QUOTES, 'UTF-8') ?></td>
        <td data-label="Phone"><?= htmlspecialchars((string) $lead['phone'], ENT_QUOTES, 'UTF-8') ?></td>
        <td data-label="Source"><?= htmlspecialchars((string) $lead['source'], ENT_QUOTES, 'UTF-8') ?></td>
        <td data-label="Notify" class="<?= $notifyClass ?>"><?= htmlspecialchars($notifyLabel, ENT_QUOTES, 'UTF-8') ?></td>
        <td data-label="Date"><?= htmlspecialchars((string) $lead['last_subscribed_at'], ENT_QUOTES, 'UTF-8') ?> UTC</td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php if ($pages > 1): ?>
  <div class="pager">
    <?php for ($i = 1; $i <= $pages; $i++): ?>
      <a href="?q=<?= urlencode($q) ?>&amp;sort=<?= urlencode($sort) ?>&amp;page=<?= $i ?>"><?= $i ?></a>
    <?php endfor; ?>
  </div>
  <?php endif; ?>
  <?php endif; ?>
</main>
</body>
</html>
