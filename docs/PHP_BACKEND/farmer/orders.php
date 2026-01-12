<?php
/**
 * Farmer Order Management
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
            // Get orders containing farmer's products
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 10);
            $status = sanitize($_GET['status'] ?? '');
            $order_id = sanitize($_GET['id'] ?? '');

            if ($order_id) {
                // Get single order details
                $stmt = $conn->prepare("
                    SELECT o.*, 
                           u.first_name as buyer_first_name, u.last_name as buyer_last_name,
                           a.street, a.city, a.state, a.postal_code,
                           d.status as delivery_status, d.tracking_number
                    FROM Orders o
                    JOIN Buyer b ON o.buyer_id = b.id
                    JOIN User u ON b.user_id = u.id
                    LEFT JOIN Address a ON o.shipping_address_id = a.id
                    LEFT JOIN Delivery d ON o.id = d.order_id
                    WHERE o.id = ?
                    AND EXISTS (
                        SELECT 1 FROM Order_Items oi 
                        JOIN Product p ON oi.product_id = p.id 
                        WHERE oi.order_id = o.id AND p.farmer_id = ?
                    )
                ");
                $stmt->execute([$order_id, $farmer_id]);
                $order = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$order) {
                    jsonResponse(['error' => 'Order not found'], 404);
                }

                // Get only this farmer's items in the order
                $stmt = $conn->prepare("
                    SELECT oi.*, p.name as product_name, u.name as unit_name
                    FROM Order_Items oi
                    JOIN Product p ON oi.product_id = p.id
                    LEFT JOIN Unit_Of_Measure u ON p.unit_id = u.id
                    WHERE oi.order_id = ? AND p.farmer_id = ?
                ");
                $stmt->execute([$order_id, $farmer_id]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                jsonResponse(['success' => true, 'data' => $order]);
            }

            // List orders
            $where = "";
            $params = [$farmer_id];

            if ($status) {
                $where = "AND o.status = ?";
                $params[] = $status;
            }

            // Get total count
            $stmt = $conn->prepare("
                SELECT COUNT(DISTINCT o.id) as total 
                FROM Orders o
                WHERE EXISTS (
                    SELECT 1 FROM Order_Items oi 
                    JOIN Product p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id AND p.farmer_id = ?
                ) $where
            ");
            $stmt->execute($params);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            $pagination = getPagination($page, $limit, $total);

            // Get orders
            $params[] = $limit;
            $params[] = $pagination['offset'];

            $stmt = $conn->prepare("
                SELECT o.id, o.status, o.created_at,
                       u.first_name as buyer_first_name, u.last_name as buyer_last_name,
                       (SELECT SUM(oi.subtotal) FROM Order_Items oi 
                        JOIN Product p ON oi.product_id = p.id 
                        WHERE oi.order_id = o.id AND p.farmer_id = ?) as farmer_total
                FROM Orders o
                JOIN Buyer b ON o.buyer_id = b.id
                JOIN User u ON b.user_id = u.id
                WHERE EXISTS (
                    SELECT 1 FROM Order_Items oi 
                    JOIN Product p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id AND p.farmer_id = ?
                ) $where
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            ");
            array_unshift($params, $farmer_id); // Add farmer_id for subquery
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            jsonResponse([
                'success' => true,
                'data' => $orders,
                'pagination' => $pagination
            ]);
            break;

        case 'PUT':
            // Update order item status (for farmer's products only)
            $data = json_decode(file_get_contents("php://input"), true);
            
            $order_id = sanitize($data['order_id'] ?? '');
            $status = sanitize($data['status'] ?? '');

            $valid_statuses = ['processing', 'shipped', 'ready_for_pickup'];

            if (empty($order_id) || empty($status)) {
                jsonResponse(['error' => 'Order ID and status are required'], 400);
            }

            if (!in_array($status, $valid_statuses)) {
                jsonResponse(['error' => 'Invalid status. Farmers can set: processing, shipped, ready_for_pickup'], 400);
            }

            // Verify order contains farmer's products
            $stmt = $conn->prepare("
                SELECT o.id FROM Orders o
                WHERE o.id = ?
                AND EXISTS (
                    SELECT 1 FROM Order_Items oi 
                    JOIN Product p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id AND p.farmer_id = ?
                )
            ");
            $stmt->execute([$order_id, $farmer_id]);

            if ($stmt->rowCount() === 0) {
                jsonResponse(['error' => 'Order not found or access denied'], 404);
            }

            // Note: In a real system, each order item might have its own status
            // For simplicity, we update the whole order status
            $stmt = $conn->prepare("UPDATE Orders SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $order_id]);

            jsonResponse([
                'success' => true,
                'message' => 'Order status updated successfully'
            ]);
            break;

        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }

} catch (Exception $e) {
    jsonResponse(['error' => 'Operation failed: ' . $e->getMessage()], 500);
}
?>
