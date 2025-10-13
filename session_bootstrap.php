<?php
// Centralized session bootstrap with support for explicit session id header

function gamenest_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $sessionId = $_SERVER['HTTP_X_SESSION_ID'] ?? null;
    if (!$sessionId && isset($_GET['session_id'])) {
        $sessionId = $_GET['session_id'];
    } elseif (!$sessionId && isset($_POST['session_id'])) {
        $sessionId = $_POST['session_id'];
    }

    if ($sessionId && is_string($sessionId)) {
        if (preg_match('/^[A-Za-z0-9,-]{16,}$/', $sessionId) === 1) {
            session_id($sessionId);
        }
    }

    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    } else {
        session_set_cookie_params(0, '/');
    }

    session_start();
}
