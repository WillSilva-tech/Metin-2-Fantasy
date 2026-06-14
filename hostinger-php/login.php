<?php
/**
 * Metin2 Fantasy - Secure Authentication Engine
 * Designed by DevSecOps & Security Specialist
 * 
 * Strict session management, double-SHA1 password checking, AJAX integration, and anti-hijacking tracking.
 */

define('SECURE_ACCESS', true);
require_once 'config.php';

$response = [
    'success' => false,
    'message' => '',
    'user' => null
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrfToken = $_POST['csrf_token'] ?? '';
    if (!validateCSRFToken($csrfToken)) {
        $response['message'] = 'Sessão inválida. Reinicie o navegador.';
        echo json_encode($response);
        exit;
    }

    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $response['message'] = 'Nome de usuário e senha são obrigatórios.';
        echo json_encode($response);
        exit;
    }

    try {
        $pdo = DB::connect(DB_ACCOUNT);

        // Fetch account parameters
        $stmt = $pdo->prepare("SELECT login, password, email, status, coins FROM account WHERE login = :login LIMIT 1");
        $stmt->execute(['login' => $username]);
        $account = $stmt->fetch();

        if ($account) {
            // Verify Metin2 Double-SHA1 Hash Compatibility
            $providedHash = hashMetin2Password($password);
            
            // Mitigate timing attack profile by using native robust string comparison
            if (hash_equals($account['password'], $providedHash)) {
                
                // Account safety validation (Block frozen / banned accounts)
                if ($account['status'] !== 'OK') {
                    $response['message'] = 'Esta conta está suspensa ou banida temporariamente. Contate o suporte.';
                    echo json_encode($response);
                    exit;
                }

                // Setup safe session records
                $_SESSION['user_id'] = $account['login'];
                $_SESSION['user_login'] = $account['login'];
                $_SESSION['user_email'] = $account['email'];
                $_SESSION['coins_balance'] = intval($account['coins']);
                
                // Track session fingerprint metadata to prevent Session Hijacking
                $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
                $_SESSION['user_ip'] = $_SERVER['REMOTE_ADDR'];

                $response['success'] = true;
                $response['message'] = 'Autenticação bem-sucedida! Redirecionando...';
                $response['user'] = [
                    'login' => $account['login'],
                    'email' => $account['email'],
                    'cashBalance' => intval($account['coins'])
                ];
            } else {
                $response['message'] = 'Nome de usuário ou senha incorretos.';
            }
        } else {
            $response['message'] = 'Nome de usuário ou senha incorretos.';
        }

    } catch (PDOException $e) {
        error_log("[M2_SECURITY_LOGIN_ERR] " . $e->getMessage());
        $response['message'] = 'Erro interno ao autenticar sua conta de jogo.';
    }
} else {
    header("Location: index.php");
    exit;
}

echo json_encode($response);
exit;
