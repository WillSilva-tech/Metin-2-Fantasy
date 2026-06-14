<?php
/**
 * Metin2 Fantasy - Secure Configuration Engine
 * Designed by DevSecOps & Security Specialist
 * 
 * Strict access control, prepared inputs, cookie fortification, and secure PDO connection.
 */

// Block direct access to config
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    header("HTTP/1.1 403 Forbidden");
    exit("Acesso negado.");
}

// Fortify session cookies before session start
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    
    // Auto-detect HTTPS to activate secure cookie attribute
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        $isSecure = true;
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        $isSecure = true;
    }
    
    if ($isSecure) {
        ini_set('session.cookie_secure', 1);
    }
    
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    session_start();
}

// Security Headers against Clickjacking, XSS, and sniff sniffing
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: no-referrer-when-downgrade");

// Database Configurations - Replace with your Hostinger or Game DB Server credentials
define('DB_HOST', '127.0.0.1'); // Normally game server IP or 'localhost' on Hostinger
define('DB_PORT', '3306');
define('DB_USER', 'metin2_web');
define('DB_PASS', 'S3cur3_Pa$$w0rd_H3r3'); // Protect this string!
define('DB_ACCOUNT', 'account');
define('DB_PLAYER', 'player');

// Security Key for extra local cookies encryption / hash salts
define('SECURITY_SALT', 'F4nt4sy2_SuP3r_S3cr3t_S4lt_Ch4ng3_Th1s_In_Pr0duct10n!');

/**
 * PDO Singleton Connection Helper for Metin2 Databases
 */
class DB {
    private static $instances = [];

    public static function connect($dbName) {
        if (!isset(self::$instances[$dbName])) {
            try {
                $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . $dbName . ";charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ];
                self::$instances[$dbName] = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                // Securely log DB error privately without leaking credentials/structure to public
                error_log("[M2_SECURITY_DB_ERR] " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
                
                // Friendly error message for end-player
                die("<div style='background:#150a04;color:#ff6a00;font-family:sans-serif;padding:20px;border:1px solid #c92a00;border-radius:6px;max-w:500px;margin:100px auto;text-align:center;'>
                        <h3 style='margin-top:0;text-shadow:0 0 10px rgba(255,106,0,0.5)'>Servidor em Manutenção</h3>
                        <p style='color:#ccc;font-size:14px;line-height:1.6;'>Estamos realizando melhorias na nossa infraestrutura de banco de dados para garantir o melhor desempenho e segurança. Por favor, tente novamente em alguns instantes.</p>
                     </div>");
            }
        }
        return self::$instances[$dbName];
    }
}

/**
 * XSS Helper Function
 */
function sanitize($str) {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Generate CSRF Token for Forms to block Cross-Site Request Forgery
 */
function getCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF Token
 */
function validateCSRFToken($token) {
    if (!isset($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Hash Metin2 Passwords securely.
 * Metin2 traditionally uses SQL PASSWORD() function or standard *PASSWORD (double SHA1).
 * For Hostinger-PHP, we'll implement both standard double-SHA1 and support.
 */
function hashMetin2Password($password) {
    // Standard Metin2 algorithm: SHA1(SHA1(password, true)) inside SQL
    // In PHP, we compute hex string of sha1(sha1(password, true)) inside upper case prefixed with "*"
    return "*" . strtoupper(sha1(sha1($password, true)));
}
