<?php
require __DIR__ . '/config.php';
admin_ensure_tables();
admin_require_login();

$comments = [];
$error = '';

try {
    $pdo = admin_db();
    $statement = $pdo->query(
        'SELECT id, name, email, subject, comment, created_at
         FROM support_comments
         ORDER BY created_at DESC, id DESC'
    );
    $comments = $statement->fetchAll();
} catch (PDOException $exception) {
    $error = 'Unable to load support comments. Check that MySQL is running and the support_comments table exists.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Comments | Online Booth Admin</title>
  <link rel="icon" type="image/svg+xml" href="../assets/camera-svgrepo-com.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="admin.css">
</head>
<body>
  <main class="admin-shell">
    <header class="admin-topbar">
      <a class="admin-brand" href="../index.html">
        <img src="../assets/camera-svgrepo-com.svg" alt="">
        <span>Online Booth</span>
      </a>
      <a class="logout-link" href="logout.php">Logout</a>
    </header>

    <section class="admin-heading">
      <p class="kicker">Admin</p>
      <h1>Support comments</h1>
    </section>

    <?php if ($error !== ''): ?>
      <p class="form-error"><?= admin_escape($error) ?></p>
    <?php elseif (!$comments): ?>
      <div class="empty-state">
        <h2>No comments yet</h2>
        <p>Submitted support comments will appear here.</p>
      </div>
    <?php else: ?>
      <div class="comments-table-wrap">
        <table class="comments-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($comments as $index => $comment): ?>
              <tr>
                <td><?= admin_escape((string) ($index + 1)) ?></td>
                <td><?= admin_escape($comment['name']) ?></td>
                <td><?= admin_escape($comment['email']) ?></td>
                <td><?= admin_escape($comment['subject']) ?></td>
                <td><?= nl2br(admin_escape($comment['comment'])) ?></td>
                <td><?= admin_escape($comment['created_at']) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </main>
</body>
</html>