<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$comment = trim($_POST['comment'] ?? '');

$topics = [
    'camera' => 'Camera not working',
    'download' => 'Download issue',
    'layout' => 'Layout / strip question',
    'bug' => 'Found a bug',
    'other' => 'Other',
];

if ($name === '' || $email === '' || $subject === '' || $comment === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Please complete all fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

$topic = $topics[$subject] ?? 'Other';

try {
    $pdo = new PDO('mysql:host=localhost;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $pdo->exec('CREATE DATABASE IF NOT EXISTS `online-booth` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('USE `online-booth`');
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS support_comments (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(180) NOT NULL,
            subject VARCHAR(80) NOT NULL,
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $statement = $pdo->prepare(
        'INSERT INTO support_comments (name, email, subject, comment)
         VALUES (:name, :email, :subject, :comment)'
    );

    $statement->execute([
        ':name' => $name,
        ':email' => $email,
        ':subject' => $topic,
        ':comment' => $comment,
    ]);

    echo json_encode(['ok' => true, 'message' => 'Thank you for commenting! Your feedback has been saved.']);
} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Comment could not be saved. Please check that MySQL is running in XAMPP.'
    ]);
}