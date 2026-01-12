<?php
/**
 * Farmer Product Management
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
            // List farmer's products
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);
            $search = sanitize($_GET['search'] ?? '');
            $category = sanitize($_GET['category'] ?? '');

            $where = "WHERE p.farmer_id = ?";
            $params = [$farmer_id];

            if ($search) {
                $where .= " AND (p.name LIKE ? OR p.description LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }

            if ($category) {
                $where .= " AND p.category_id = ?";
                $params[] = $category;
            }

            // Get total count
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Product p $where");
            $stmt->execute($params);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            $pagination = getPagination($page, $limit, $total);

            // Get products
            $stmt = $conn->prepare("
                SELECT p.*, c.name as category_name, u.name as unit_name,
                       (SELECT pi.image_url FROM Product_Image pi WHERE pi.product_id = p.id AND pi.is_primary = TRUE LIMIT 1) as primary_image
                FROM Product p
                LEFT JOIN Category c ON p.category_id = c.id
                LEFT JOIN Unit_Of_Measure u ON p.unit_id = u.id
                $where
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $params[] = $limit;
            $params[] = $pagination['offset'];
            $stmt->execute($params);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            jsonResponse([
                'success' => true,
                'data' => $products,
                'pagination' => $pagination
            ]);
            break;

        case 'POST':
            // Create new product
            $data = json_decode(file_get_contents("php://input"), true);

            $name = sanitize($data['name'] ?? '');
            $description = sanitize($data['description'] ?? '');
            $category_id = sanitize($data['category_id'] ?? '');
            $price = floatval($data['price'] ?? 0);
            $stock_quantity = intval($data['stock_quantity'] ?? 0);
            $unit_id = sanitize($data['unit_id'] ?? '');
            $min_order_quantity = intval($data['min_order_quantity'] ?? 1);

            // Validation
            $errors = [];
            if (empty($name)) $errors[] = 'Product name is required';
            if (empty($category_id)) $errors[] = 'Category is required';
            if ($price <= 0) $errors[] = 'Price must be greater than 0';
            if ($stock_quantity < 0) $errors[] = 'Stock cannot be negative';
            if (empty($unit_id)) $errors[] = 'Unit of measure is required';

            if (!empty($errors)) {
                jsonResponse(['error' => 'Validation failed', 'details' => $errors], 400);
            }

            $conn->beginTransaction();

            $product_id = generateUUID();
            $stmt = $conn->prepare("
                INSERT INTO Product (id, farmer_id, category_id, unit_id, name, description, 
                                    price, stock_quantity, min_order_quantity) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $product_id, $farmer_id, $category_id, $unit_id, $name, 
                $description, $price, $stock_quantity, $min_order_quantity
            ]);

            // Log inventory
            $stmt = $conn->prepare("
                INSERT INTO Inventory_Log (id, product_id, change_quantity, change_type, 
                                          previous_quantity, new_quantity, notes) 
                VALUES (?, ?, ?, 'initial_stock', 0, ?, 'Initial product stock')
            ");
            $stmt->execute([generateUUID(), $product_id, $stock_quantity, $stock_quantity]);

            $conn->commit();

            jsonResponse([
                'success' => true,
                'message' => 'Product created successfully',
                'product_id' => $product_id
            ], 201);
            break;

        case 'PUT':
            // Update product
            $data = json_decode(file_get_contents("php://input"), true);
            $product_id = sanitize($data['id'] ?? $_GET['id'] ?? '');

            if (empty($product_id)) {
                jsonResponse(['error' => 'Product ID is required'], 400);
            }

            // Verify ownership
            $stmt = $conn->prepare("SELECT id, stock_quantity FROM Product WHERE id = ? AND farmer_id = ?");
            $stmt->execute([$product_id, $farmer_id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                jsonResponse(['error' => 'Product not found or access denied'], 404);
            }

            $updates = [];
            $params = [];

            $fields = ['name', 'description', 'category_id', 'unit_id', 'min_order_quantity', 'is_active'];
            foreach ($fields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $field === 'is_active' ? (bool)$data[$field] : sanitize($data[$field]);
                }
            }

            if (isset($data['price'])) {
                $updates[] = "price = ?";
                $params[] = floatval($data['price']);
            }

            if (empty($updates)) {
                jsonResponse(['error' => 'No fields to update'], 400);
            }

            $updates[] = "updated_at = NOW()";
            $params[] = $product_id;

            $stmt = $conn->prepare("UPDATE Product SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);

            jsonResponse([
                'success' => true,
                'message' => 'Product updated successfully'
            ]);
            break;

        case 'DELETE':
            // Delete product (soft delete by setting is_active = false)
            $product_id = sanitize($_GET['id'] ?? '');

            if (empty($product_id)) {
                jsonResponse(['error' => 'Product ID is required'], 400);
            }

            // Verify ownership
            $stmt = $conn->prepare("SELECT id FROM Product WHERE id = ? AND farmer_id = ?");
            $stmt->execute([$product_id, $farmer_id]);

            if ($stmt->rowCount() === 0) {
                jsonResponse(['error' => 'Product not found or access denied'], 404);
            }

            $stmt = $conn->prepare("UPDATE Product SET is_active = FALSE, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$product_id]);

            jsonResponse([
                'success' => true,
                'message' => 'Product deleted successfully'
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
