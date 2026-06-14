<?php
/**
 * Metin2 Fantasy - Secure Registration Engine
 * Designed by DevSecOps & Security Specialist
 * 
 * Safe PDO Insert with strict constraint testing, CSRF protection, and regex sanitization.
 */

define('SECURE_ACCESS', true);
require_once 'config.php';

$response = [
    'success' => false,
    'message' => ''
];

// Verify if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Guard against CSRF attacks
    $csrfToken = $_POST['csrf_token'] ?? '';
    if (!validateCSRFToken($csrfToken)) {
        $response['message'] = 'Sessão inválida ou expirada. Por favor, recarregue a página.';
        echo json_encode($response);
        exit;
    }

    // 2. Extract and sanitize values
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $password_confirm = $_POST['password_confirm'] ?? '';
    $email = trim($_POST['email'] ?? '');
    $social_id = trim($_POST['social_id'] ?? ''); // Character deletion code, standard 7 digits

    // 3. Strict validation rules (Defensive Security)
    if (empty($username) || empty($password) || empty($password_confirm) || empty($email) || empty($social_id)) {
        $response['message'] = 'Todos os campos são obrigatórios.';
        echo json_encode($response);
        exit;
    }

    // Username pattern check: alphanumeric, 4 to 20 chars
    if (!preg_match('/^[a-zA-Z0-9]{4,20}$/', $username)) {
        $response['message'] = 'O nome de usuário deve conter apenas letras e números, entre 4 e 20 caracteres.';
        echo json_encode($response);
        exit;
    }

    // Password robust check
    if (strlen($password) < 6 || strlen($password) > 24) {
        $response['message'] = 'A senha de login deve ter entre 6 e 24 caracteres.';
        echo json_encode($response);
        exit;
    }

    if ($password !== $password_confirm) {
        $response['message'] = 'As senhas informadas não coincidem.';
        echo json_encode($response);
        exit;
    }

    // Email secure verification
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 64) {
        $response['message'] = 'Formato de e-mail inválido.';
        echo json_encode($response);
        exit;
    }

    // Deletion Code Check (Essential Metin2 secure parameter)
    if (!preg_match('/^[0-9]{7}$/', $social_id)) {
        $response['message'] = 'O Código de Exclusão de Personagem deve conter exatamente 7 números de 0 a 9.';
        echo json_encode($response);
        exit;
    }

    try {
        // 4. Secure DB Prepared Queries
        $pdo = DB::connect(DB_ACCOUNT);

        // Check if username/login already exists to prevent duplication error leaking details
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM account WHERE login = :login");
        $stmt->execute(['login' => $username]);
        if ($stmt->fetchColumn() > 0) {
            $response['message'] = 'Este nome de usuário já está sendo utilizado.';
            echo json_encode($response);
            exit;
        }

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM account WHERE email = :email");
        $stmt->execute(['email' => $email]);
        if ($stmt->fetchColumn() > 0) {
            $response['message'] = 'Este endereço de e-mail já está cadastrado no sistema.';
            echo json_encode($response);
            exit;
        }

        // 5. Encrypt password using standard MySQLPASSWORD hash conversion
        $hashedPassword = hashMetin2Password($password);

        // Standard Metin2 account schema creation query (with default service timers)
        $sql = "INSERT INTO account 
                (login, password, email, social_id, create_time, status, coins, silver_expire, safebox_expire, autoloot_expire, fish_mind_expire, gold_expire, marriage_fast_expire, money_drop_rate_expire) 
                VALUES 
                (:login, :password, :email, :social_id, NOW(), 'OK', 5000, 
                 DATE_ADD(NOW(), INTERVAL 30 DAY), 
                 DATE_ADD(NOW(), INTERVAL 30 DAY), 
                 DATE_ADD(NOW(), INTERVAL 30 DAY), 
                 DATE_ADD(NOW(), INTERVAL 30 DAY), 
                 DATE_ADD(NOW(), INTERVAL 30 DAY), 
                 DATE_ADD(NOW(), INTERVAL 30 DAY), 
                 DATE_ADD(NOW(), INTERVAL 30 DAY))";

        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([
            'login'     => $username,
            'password'  => $hashedPassword,
            'email'     => $email,
            'social_id' => $social_id
        ]);

        if ($result) {
            $response['success'] = true;
            $response['message'] = 'Sua conta de guerreiro foi criada com sucesso! Seja bem-vindo ao Metin2 Fantasy.';
            
            // Auto sign-in on registry
            $_SESSION['user_id'] = $username;
            $_SESSION['user_login'] = $username;
            $_SESSION['user_email'] = $email;
            $_SESSION['coins_balance'] = 5000; // Gift 5k starting CASH
        } else {
            $response['message'] = 'Erro ao processar cadastro no servidor. Tente novamente.';
        }

    } catch (PDOException $e) {
        error_log("[M2_SECURITY_REGISTRY_ERR] " . $e->getMessage());
        $response['message'] = 'Ocorreu um erro interno de banco de dados. Favor entrar em contato com o suporte.';
    }
} else {
    // If accessed directly without post, redirect safely
    header("Location: index.php");
    exit;
}

echo json_encode($response);
exit;
