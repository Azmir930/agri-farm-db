<?php
/**
 * Buyer Reviews Management
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
            // Get buyer's reviews
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);

            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Review WHERE buyer_id = ?");
            $stmt->execute([$buyer_id]);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            $pagination = getPagination($page, $limit, $total);

            $stmt = $conn->prepare("
                SELECT r.*, p.name as product_name,
                       (SELECT image_url FROM Product_Image WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image
                FROM Review r
                JOIN Product p ON r.product_id = p.id
                WHERE r.buyer_id = ?
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$buyer_id, $limit, $pagination['offset']]);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

            jsonResponse([
                'success' => true,
                'data' => $reviews,
                'pagination' => $pagination
            ]);
            break;

        case 'POST':
            // Create review
            $data = json_decode(file_get_contents("php://input"), true);

            $product_id = sanitize($data['product_id'] ?? '');
            $order_id = sanitize($data['order_id'] ?? '');
            $rating = intval($data['rating'] ?? 0);
            $comment = sanitize($data['comment'] ?? '');

            // Validation
            if (empty($product_id)) {
                jsonResponse(['error' => 'Product ID is required'], 400);
            }
            if ($rating < 1 || $rating > 5) {
                jsonResponse(['error' => 'Rating must be between 1 and 5'], 400);
            }

            // Verify buyer purchased this product
            $stmt = $conn->prepare("
                SELECT oi.id 
                FROM Order_Items oi
                JOIN Orders o ON oi.order_id = o.id
                WHERE o.buyer_id = ? AND oi.product_id = ? AND o.status = 'delivered'
                LIMIT 1
            ");
            $stmt->execute([$buyer_id, $product_id]);
            
            if ($stmt->rowCount() === 0) {
                jsonResponse(['error' => 'You can only review products you have purchased and received'], 403);
            }

            // Check if already reviewed
            $stmt = $conn->prepare("SELECT id FROM Review WHERE buyer_id = ? AND product_id = ?");
            $stmt->execute([$buyer_id, $product_id]);
            
            if ($stmt->rowCount() > 0) {
                jsonResponse(['error' => 'You have already reviewed this product'], 409);
            }

            // Create review
            $review_id = generateUUID();
            $stmt = $conn->prepare("
                INSERT INTO Review (id, product_id, buyer_id, order_id, rating, comment) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$review_id, $product_id, $buyer_id, $order_id ?: null, $rating, $comment]);

            jsonResponse([
                'success' => true,
                'message' => 'Review submitted successfully',
                'review_id' => $review_id
            ], 201);
            break;

        case 'PUT':
            // Update review
            $data = json_decode(file_get_contents("php://input"), true);
            $review_id = sanitize($data['id'] ?? $_GET['id'] ?? '');

            if (empty($review_id)) {
                jsonResponse(['error' => 'Review ID is required'], 400);
            }

            // Verify ownership
            $stmt = $conn->prepare("SELECT id FROM Review WHERE id = ? AND buyer_id = ?");
            $stmt->execute([$review_id, $buyer_id]);
            
            if ($stmt->rowCount() === 0) {
                jsonResponse(['error' => 'Review not found or access denied'], 404);
            }

            $updates = [];
            $params = [];

            if (isset($data['rating'])) {
                $rating = intval($data['rating']);
                if ($rating < 1 || $rating > 5) {
                    jsonResponse(['error' => 'Rating must be between 1 and 5'], 400);
                }
                $updates[] = "rating = ?";
                $params[] = $rating;
            }

            if (isset($data['comment'])) {
                $updates[] = "comment = ?";
                $params[] = sanitize($data['comment']);
            }

            if (empty($updates)) {
                jsonResponse(['error' => 'No fields to update'], 400);
            }

            $updates[] = "updated_at = NOW()";
            $params[] = $review_id;

            $stmt = $conn->prepare("UPDATE Review SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);

            jsonResponse([
                'success' => true,
                'message' => 'Review updated successfully'
            ]);
            break;

        case 'DELETE':
            // Delete review
            $review_id = sanitize($_GET['id'] ?? '');

            if (empty($review_id)) {
                jsonResponse(['error' => 'Review ID is required'], 400);
            }

            // Verify ownership
            $stmt = $conn->prepare("SELECT id FROM Review WHERE id = ? AND buyer_id = ?");
            $stmt->execute([$review_id, $buyer_id]);
            
            if ($stmt->rowCount() === 0) {
                jsonResponse(['error' => 'Review not found or access denied'], 404);
            }

            $stmt = $conn->prepare("DELETE FROM Review WHERE id = ?");
            $stmt->execute([$review_id]);

            jsonResponse([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }

} catch (Exception $e) {
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
