<?php
/**
 * User Registration
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../config/session.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

$first_name = sanitize($data['first_name'] ?? '');
$last_name = sanitize($data['last_name'] ?? '');
$email = sanitize($data['email'] ?? '');
$phone = sanitize($data['phone'] ?? '');
$password = $data['password'] ?? '';
$confirm_password = $data['confirm_password'] ?? '';
$role = sanitize($data['role'] ?? 'buyer'); // Default role is buyer

// Validation
$errors = [];

if (empty($first_name)) $errors[] = 'First name is required';
if (empty($last_name)) $errors[] = 'Last name is required';
if (empty($email) || !isValidEmail($email)) $errors[] = 'Valid email is required';
if (empty($phone) || !isValidPhone($phone)) $errors[] = 'Valid phone number is required';
if (strlen($password) < 8) $errors[] = 'Password must be at least 8 characters';
if ($password !== $confirm_password) $errors[] = 'Passwords do not match';
if (!in_array($role, ['farmer', 'buyer'])) $errors[] = 'Invalid role'; // Admin created manually

if (!empty($errors)) {
    jsonResponse(['error' => 'Validation failed', 'details' => $errors], 400);
}

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM User WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        jsonResponse(['error' => 'Email already registered'], 409);
    }

    // Check if phone already exists
    $stmt = $conn->prepare("SELECT id FROM User WHERE phone = ?");
    $stmt->execute([$phone]);
    
    if ($stmt->rowCount() > 0) {
        jsonResponse(['error' => 'Phone number already registered'], 409);
    }

    // Begin transaction
    $conn->beginTransaction();

    // Get role ID
    $stmt = $conn->prepare("SELECT id FROM User_Role WHERE role_name = ?");
    $stmt->execute([$role]);
    $role_row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$role_row) {
        throw new Exception("Invalid role");
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    // Create user
    $user_id = generateUUID();
    $stmt = $conn->prepare("
        INSERT INTO User (id, role_id, first_name, last_name, email, phone, password_hash) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$user_id, $role_row['id'], $first_name, $last_name, $email, $phone, $password_hash]);

    // Create role-specific profile
    if ($role === 'farmer') {
        $farm_name = sanitize($data['farm_name'] ?? $first_name . "'s Farm");
        $stmt = $conn->prepare("
            INSERT INTO Farmer (id, user_id, farm_name) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([generateUUID(), $user_id, $farm_name]);
    } else {
        $stmt = $conn->prepare("
            INSERT INTO Buyer (id, user_id) 
            VALUES (?, ?)
        ");
        $stmt->execute([generateUUID(), $user_id]);
    }

    // Log activity
    $stmt = $conn->prepare("
        INSERT INTO User_Activity_Log (id, user_id, activity_type, description) 
        VALUES (?, ?, 'registration', 'User registered successfully')
    ");
    $stmt->execute([generateUUID(), $user_id]);

    $conn->commit();

    jsonResponse([
        'success' => true,
        'message' => 'Registration successful',
        'user_id' => $user_id
    ], 201);

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    jsonResponse(['error' => 'Registration failed: ' . $e->getMessage()], 500);
}
?>
