<?php
/**
 * Authentication Middleware
 * Agriculture Product Marketplace
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';
require_once __DIR__ . '/../config/session.php';

/**
 * Validate API token from Authorization header
 */
function validateToken() {
    $headers = getallheaders();
    $auth_header = $headers['Authorization'] ?? '';
    
    if (empty($auth_header)) {
        return null;
    }

    $token = str_replace('Bearer ', '', $auth_header);
    
    if (empty($token)) {
        return null;
    }

    try {
        $database = new Database();
        $conn = $database->getConnection();

        $stmt = $conn->prepare("
            SELECT s.user_id, u.email, r.role_name, u.first_name, u.last_name
            FROM User_Session s
            JOIN User u ON s.user_id = u.id
            JOIN User_Role r ON u.role_id = r.id
            WHERE s.token = ? AND s.expires_at > NOW() AND u.is_active = TRUE
        ");
        $stmt->execute([$token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($session) {
            // Update last activity
            $stmt = $conn->prepare("UPDATE User_Session SET last_activity = NOW() WHERE token = ?");
            $stmt->execute([$token]);
            return $session;
        }

        return null;

    } catch (Exception $e) {
        return null;
    }
}

/**
 * Require valid authentication
 */
function requireApiAuth() {
    $user = validateToken();
    
    if (!$user) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    
    return $user;
}

/**
 * Require specific role via API
 */
function requireApiRole($required_role) {
    $user = requireApiAuth();
    
    if ($user['role_name'] !== $required_role && $user['role_name'] !== 'admin') {
        jsonResponse(['error' => 'Forbidden: Insufficient permissions'], 403);
    }
    
    return $user;
}

/**
 * Require any of the specified roles
 */
function requireApiRoles($roles) {
    $user = requireApiAuth();
    
    if (!in_array($user['role_name'], $roles) && $user['role_name'] !== 'admin') {
        jsonResponse(['error' => 'Forbidden: Insufficient permissions'], 403);
    }
    
    return $user;
}

/**
 * Get current authenticated user from token or session
 */
function getAuthenticatedUser() {
    // Try token first (for API calls)
    $user = validateToken();
    
    if ($user) {
        return $user;
    }
    
    // Fall back to session (for web pages)
    if (isLoggedIn()) {
        return [
            'user_id' => getCurrentUserId(),
            'email' => $_SESSION['email'] ?? null,
            'role_name' => getCurrentUserRole(),
            'first_name' => explode(' ', $_SESSION['name'] ?? '')[0],
            'last_name' => explode(' ', $_SESSION['name'] ?? '')[1] ?? ''
        ];
    }
    
    return null;
}
?>
