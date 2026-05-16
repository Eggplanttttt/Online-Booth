<?php
declare(strict_types=1);

session_start();

const DB_NAME = 'online-booth';

function admin_db(): PDO
{
    $pdo = new PDO('mysql:host=localhost;dbname=' . DB_NAME . ';charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function admin_ensure_tables(): void
{
    $pdo = admin_db();

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS admin_users (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

}

function admin_find_user(string $username): ?array
{
    $pdo = admin_db();
    $statement = $pdo->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = :username LIMIT 1');
    $statement->execute([':username' => $username]);
    $user = $statement->fetch();

    return $user ?: null;
}

function admin_is_logged_in(): bool
{
    return !empty($_SESSION['online_booth_admin']);
}

function admin_require_login(): void
{
    if (!admin_is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function admin_escape(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}