<?php
/**
 * Metin2 Fantasy - Secure Coupon Redeemer Engine
 *
 * Atomic coupon redemption with duplicate-use protection. The endpoint fails
 * closed when the database is unavailable, so CASH is never simulated.
 */

define('SECURE_ACCESS', true);
require_once 'config.php';

header('Content-Type: application/json');

$response = [
    'success' => false,
    'message' => ''
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: index.php");
    exit;
}

if (!isset($_SESSION['user_login'])) {
    $response['message'] = 'Por favor, efetue o login para resgatar cupons.';
    echo json_encode($response);
    exit;
}

$csrfToken = $_POST['csrf_token'] ?? '';
if (!validateCSRFToken($csrfToken)) {
    $response['message'] = 'Sessao vencida. Atualize a pagina.';
    echo json_encode($response);
    exit;
}

$code = strtoupper(trim($_POST['code'] ?? ''));
if (empty($code)) {
    $response['message'] = 'Por favor, informe seu codigo de cupom.';
    echo json_encode($response);
    exit;
}

$vouchersList = [
    'FANTASYNEW' => 5000,
    'MAGMABOSS' => 15000,
    'SORTE50' => 50000,
    'GMGIFT' => 100000
];

if (!array_key_exists($code, $vouchersList)) {
    $response['message'] = 'Codigo de cupom invalido ou ja utilizado em sua conta.';
    echo json_encode($response);
    exit;
}

$prizeAmount = $vouchersList[$code];
$username = $_SESSION['user_login'];

try {
    $pdo = DB::connect(DB_ACCOUNT);

    $pdo->exec("CREATE TABLE IF NOT EXISTS web_coupon_logs (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        login VARCHAR(30) NOT NULL,
        coupon VARCHAR(64) NOT NULL,
        date_redeemed DATETIME NOT NULL,
        amount INT NOT NULL,
        UNIQUE KEY uniq_web_coupon_login_coupon (login, coupon)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->beginTransaction();

    $logStmt = $pdo->prepare(
        "INSERT INTO web_coupon_logs (login, coupon, date_redeemed, amount)
         VALUES (:login, :code, NOW(), :amount)"
    );
    $logStmt->execute([
        'login' => $username,
        'code' => $code,
        'amount' => $prizeAmount
    ]);

    $updateStmt = $pdo->prepare("UPDATE account SET coins = coins + :prize WHERE login = :login");
    $success = $updateStmt->execute([
        'prize' => $prizeAmount,
        'login' => $username
    ]);

    if (!$success || $updateStmt->rowCount() !== 1) {
        $pdo->rollBack();
        $response['message'] = 'Falha ao processar a premiacao do cupom. Contate um Administrador.';
        echo json_encode($response);
        exit;
    }

    $pdo->commit();

    $_SESSION['coins_balance'] = intval($_SESSION['coins_balance'] ?? 0) + $prizeAmount;

    $response['success'] = true;
    $response['message'] = 'Cupom [' . htmlspecialchars($code) . '] ativado com sucesso! Foram adicionadas +' . number_format($prizeAmount, 0, ',', '.') . ' moedas de CASH na sua conta.';
    $response['cashBalance'] = $_SESSION['coins_balance'];
} catch (PDOException $e) {
    error_log("[M2_SECURITY_REDEEM_ERR] " . $e->getMessage());

    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ($e->getCode() === '23000') {
        $response['message'] = 'Voce ja resgatou este cupom nesta conta.';
    } else {
        $response['message'] = 'Erro interno ao processar o cupom. Nenhum CASH foi creditado.';
    }
}

echo json_encode($response);
exit;
