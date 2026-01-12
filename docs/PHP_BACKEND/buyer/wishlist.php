<?php
/**
 * Buyer Wishlist Management
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../auth/middleware.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $user = requireApiRole('buyer');
    $database = new Database();
    $conn = $database->getConnection();

    // Get buyer ID
    $stmt = $conn->prepare("SELECT id FROM Buyer WHERE user_id = ?");
    $stmt->execute([$user['user_id']]);
    $buyer = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$buyer) {
        jsonResponse(['error' => 'Buyer profile not found'], 404);
    }

    $buyer_id = $buyer['id'];

    switch ($method) {
        case 'GET':
            // Get wishlist
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 12);

            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Wishlist WHERE buyer_id = ?");
            $stmt->execute([$buyer_id]);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            $pagination = getPagination($page, $limit, $total);

            $stmt = $conn->prepare("
                SELECT w.id as wishlist_id, w.created_at as added_at,
                       p.id as product_id, p.name, p.price, p.stock_quantity, p.is_active,
                       c.name as category_name, u.abbreviation as unit_abbr,
                       f.farm_name,
                       (SELECT image_url FROM Product_Image WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image,
                       (SELECT AVG(rating) FROM Review WHERE product_id = p.id) as avg_rating
                FROM Wishlist w
                JOIN Product p ON w.product_id = p.id
                JOIN Category c ON p.category_id = c.id
                JOIN Unit_Of_Measure u ON p.unit_id = u.id
                JOIN Farmer f ON p.farmer_id = f.id
                WHERE w.buyer_id = ?
                ORDER BY w.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$buyer_id, $limit, $pagination['offset']]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            jsonResponse([
                'success' => true,
                'data' => $items,
                'pagination' => $pagination
            ]);
            break;

        case 'POST':
            // Add to wishlist
            $data = json_decode(file_get_contents("php://input"), true);
            $product_id = sanitize($data['product_id'] ?? '');

            if (empty($product_id)) {
                jsonResponse(['error' => 'Product ID is required'], 400);
            }

            // Verify product exists
            $stmt = $conn->prepare("SELECT id FROM Product WHERE id = ? AND is_active = TRUE");
            $stmt->execute([$product_id]);
            
            if ($stmt->rowCount() === 0) {
                jsonResponse(['error' => 'Product not found'], 404);
            }

            // Check if already in wishlist
            $stmt = $conn->prepare("SELECT id FROM Wishlist WHERE buyer_id = ? AND product_id = ?");
            $stmt->execute([$buyer_id, $product_id]);
            
            if ($stmt->rowCount() > 0) {
                jsonResponse(['error' => 'Product already in wishlist'], 409);
            }

            // Add to wishlist
            $wishlist_id = generateUUID();
            $stmt = $conn->prepare("INSERT INTO Wishlist (id, buyer_id, product_id) VALUES (?, ?, ?)");
            $stmt->execute([$wishlist_id, $buyer_id, $product_id]);

            jsonResponse([
                'success' => true,
                'message' => 'Added to wishlist',
                'wishlist_id' => $wishlist_id
            ], 201);
            break;

        case 'DELETE':
            // Remove from wishlist
            $product_id = sanitize($_GET['product_id'] ?? '');
            $wishlist_id = sanitize($_GET['id'] ?? '');

            if (empty($product_id) && empty($wishlist_id)) {
                jsonResponse(['error' => 'Product ID or Wishlist ID is required'], 400);
            }

            if ($wishlist_id) {
                $stmt = $conn->prepare("DELETE FROM Wishlist WHERE id = ? AND buyer_id = ?");
                $stmt->execute([$wishlist_id, $buyer_id]);
            } else {
                $stmt = $conn->prepare("DELETE FROM Wishlist WHERE product_id = ? AND buyer_id = ?");
                $stmt->execute([$product_id, $buyer_id]);
            }

            if ($stmt->rowCount() === 0) {
                jsonResponse(['error' => 'Item not found in wishlist'], 404);
            }

            jsonResponse([
                'success' => true,
                'message' => 'Removed from wishlist'
            ]);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }

} catch (Exception $e) {
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
