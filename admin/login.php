<?php
require __DIR__ . '/config.php';
admin_ensure_tables();

if (admin_is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $user = admin_find_user($username);

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['online_booth_admin'] = true;
        $_SESSION['online_booth_admin_user'] = $user['username'];
        header('Location: index.php');
        exit;
    }

    $error = 'Invalid username or password.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Online Booth Admin</title>
  <link rel="icon" type="image/svg+xml" href="../assets/camera-svgrepo-com.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="admin.css">
</head>
<body>
  <main class="login-shell">
    <form class="login-card" method="post" action="login.php">
      <a class="admin-brand" href="../index.html">
        <img src="../assets/camera-svgrepo-com.svg" alt="">
        <span>Online Booth</span>
      </a>
      <div>
        <p class="kicker">Admin</p>
        <h1>Sign in</h1>
      </div>
      <?php if ($error !== ''): ?>
        <p class="form-error"><?= admin_escape($error) ?></p>
      <?php endif; ?>
      <label>
        <span>Username</span>
        <input type="text" name="username" autocomplete="username" required>
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" autocomplete="current-password" required>
      </label>
      <button type="submit">Open comments</button>
    </form>
  </main>
</body>
</html>
