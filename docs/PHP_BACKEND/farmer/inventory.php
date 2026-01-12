<?php
/**
 * Farmer Inventory Management
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../auth/middleware.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $user = requireApiRole('farmer');
    $database = new Database();
    $conn = $database->getConnection();

    // Get farmer ID
    $stmt = $conn->prepare("SELECT id FROM Farmer WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    $farmer = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$farmer) {
        jsonResponse(['error' => 'Farmer profile not found'], 404);
    }

    $farmer_id = $farmer['id'];

    switch ($method) {
        case 'GET':
            // Get inventory logs for a product
            $product_id = sanitize($_GET['product_id'] ?? '');
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);

            if ($product_id) {
                // Verify ownership
                $stmt = $conn->prepare("SELECT id FROM Product WHERE id = ? AND farmer_id = ?");
                $stmt->execute([$product_id, $farmer_id]);
                if ($stmt->rowCount() === 0) {
                    jsonResponse(['error' => 'Product not found or access denied'], 404);
                }

                // Get logs
                $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Inventory_Log WHERE product_id = ?");
                $stmt->execute([$product_id]);
                $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

                $pagination = getPagination($page, $limit, $total);

                $stmt = $conn->prepare("
                    SELECT * FROM Inventory_Log 
                    WHERE product_id = ?
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                ");
                $stmt->execute([$product_id, $limit, $pagination['offset']]);
                $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

                jsonResponse([
                    'success' => true,
                    'data' => $logs,
                    'pagination' => $pagination
                ]);
            } else {
                // Get all products with low stock
                $low_stock_threshold = intval($_GET['threshold'] ?? 10);

                $stmt = $conn->prepare("
                    SELECT p.id, p.name, p.stock_quantity, u.name as unit_name
                    FROM Product p
                    LEFT JOIN Unit_Of_Measure u ON p.unit_id = u.id
                    WHERE p.farmer_id = ? AND p.stock_quantity <= ? AND p.is_active = TRUE
                    ORDER BY p.stock_quantity ASC
                ");
                $stmt->execute([$farmer_id, $low_stock_threshold]);
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

                jsonResponse([
                    'success' => true,
                    'data' => $products,
                    'threshold' => $low_stock_threshold
                ]);
            }
            break;

        case 'POST':
            // Update stock
            $data = json_decode(file_get_contents("php://input"), true);

            $product_id = sanitize($data['product_id'] ?? '');
            $change_quantity = intval($data['change_quantity'] ?? 0);
            $change_type = sanitize($data['change_type'] ?? '');
            $notes = sanitize($data['notes'] ?? '');

            $valid_types = ['restock', 'adjustment', 'damage', 'return'];

            if (empty($product_id)) {
                jsonResponse(['error' => 'Product ID is required'], 400);
            }
            if ($change_quantity === 0) {
                jsonResponse(['error' => 'Change quantity cannot be zero'], 400);
            }
            if (!in_array($change_type, $valid_types)) {
                jsonResponse(['error' => 'Invalid change type'], 400);
            }

            // Verify ownership and get current stock
            $stmt = $conn->prepare("SELECT id, stock_quantity FROM Product WHERE id = ? AND farmer_id = ?");
            $stmt->execute([$product_id, $farmer_id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                jsonResponse(['error' => 'Product not found or access denied'], 404);
            }

            $previous_quantity = $product['stock_quantity'];
            $new_quantity = $previous_quantity + $change_quantity;

            if ($new_quantity < 0) {
                jsonResponse(['error' => 'Insufficient stock for this operation'], 400);
            }

            $conn->beginTransaction();

            // Update product stock
            $stmt = $conn->prepare("UPDATE Product SET stock_quantity = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$new_quantity, $product_id]);

            // Log inventory change
            $stmt = $conn->prepare("
                INSERT INTO Inventory_Log (id, product_id, change_quantity, change_type, 
                                          previous_quantity, new_quantity, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                generateUUID(), $product_id, $change_quantity, $change_type,
                $previous_quantity, $new_quantity, $notes
            ]);

            $conn->commit();

            jsonResponse([
                'success' => true,
                'message' => 'Stock updated successfully',
                'previous_quantity' => $previous_quantity,
                'new_quantity' => $new_quantity
            ]);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }

} catch (Exception $e) {
    if (isset($conn)) {
        $conn->rollBack();
    }
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
