<?php
/**
 * User Login
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../config/session.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$email = sanitize($data['email'] ?? '');
$password = $data['password'] ?? '';

// Validation
if (empty($email) || empty($password)) {
    jsonResponse(['error' => 'Email and password are required'], 400);
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Get user with role
    $stmt = $conn->prepare("
        SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, 
               u.is_active, r.role_name
        FROM User u
        JOIN User_Role r ON u.role_id = r.id
        WHERE u.email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        jsonResponse(['error' => 'Invalid email or password'], 401);
    }

    if (!$user['is_active']) {
        jsonResponse(['error' => 'Account is deactivated'], 403);
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        // Log failed attempt
        $stmt = $conn->prepare("
            INSERT INTO User_Activity_Log (id, user_id, activity_type, description, ip_address) 
            VALUES (?, ?, 'login_failed', 'Failed login attempt', ?)
        ");
        $stmt->execute([generateUUID(), $user['id'], $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
        
        jsonResponse(['error' => 'Invalid email or password'], 401);
    }

    // Create session record
    $session_id = generateUUID();
    $token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $stmt = $conn->prepare("
        INSERT INTO User_Session (id, user_id, token, expires_at, ip_address, user_agent) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $session_id, 
        $user['id'], 
        $token, 
        $expires_at,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);

    // Update last login
    $stmt = $conn->prepare("UPDATE User SET last_login = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Log successful login
    $stmt = $conn->prepare("
        INSERT INTO User_Activity_Log (id, user_id, activity_type, description, ip_address) 
        VALUES (?, ?, 'login', 'Successful login', ?)
    ");
    $stmt->execute([generateUUID(), $user['id'], $_SERVER['REMOTE_ADDR'] ?? 'unknown']);

    // Set session
    setUserSession(
        $user['id'],
        $user['email'],
        $user['role_name'],
        $user['first_name'] . ' ' . $user['last_name']
    );

    jsonResponse([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email'],
            'role' => $user['role_name']
        ],
        'token' => $token,
        'expires_at' => $expires_at
    ]);

} catch (Exception $e) {
    jsonResponse(['error' => 'Login failed: ' . $e->getMessage()], 500);
}
?>
