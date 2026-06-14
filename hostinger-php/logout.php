<?php
/**
 * Metin2 Fantasy - Secure Logout Engine
 * Designed by DevSecOps & Security Specialist
 * 
 * Safely flushes session data and deletes local authentication cookies.
 */

define('SECURE_ACCESS', true);
require_once 'config.php';

// Unset all of the session variables
$_SESSION = array();

// If it's desired to kill the session, also delete the session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy the session
session_destroy();

// Redirect back to landing page
header("Location: index.php");
exit;
