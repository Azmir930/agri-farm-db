<?php
/**
 * Admin Order Management
 * Agriculture Product Marketplace
 */

require_once '../config/database.php';
require_once '../config/helpers.php';
require_once '../auth/middleware.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $user = requireApiRole('admin');
    $database = new Database();
    $conn = $database->getConnection();

    switch ($method) {
        case 'GET':
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 20);
            $status = sanitize($_GET['status'] ?? '');
            $buyer_id = sanitize($_GET['buyer_id'] ?? '');
            $date_from = sanitize($_GET['date_from'] ?? '');
            $date_to = sanitize($_GET['date_to'] ?? '');
            $order_id = sanitize($_GET['id'] ?? '');

            // Single order view
            if ($order_id) {
                $stmt = $conn->prepare("
                    SELECT o.*, 
                           u.first_name as buyer_first_name, u.last_name as buyer_last_name, u.email as buyer_email,
                           a.street, a.city, a.state, a.postal_code, a.country,
                           p.status as payment_status, p.payment_method, p.transaction_id, p.paid_at,
                           d.status as delivery_status, d.tracking_number, d.carrier, d.estimated_delivery, d.delivered_at
                    FROM Orders o
                    JOIN Buyer b ON o.buyer_id = b.id
                    JOIN User u ON b.user_id = u.id
                    LEFT JOIN Address a ON o.shipping_address_id = a.id
                    LEFT JOIN Payment p ON o.id = p.order_id
                    LEFT JOIN Delivery d ON o.id = d.order_id
                    WHERE o.id = ?
                ");
                $stmt->execute([$order_id]);
                $order = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$order) {
                    jsonResponse(['error' => 'Order not found'], 404);
                }

                // Get order items
                $stmt = $conn->prepare("
                    SELECT oi.*, pr.name as product_name, u.abbreviation as unit_abbr,
                           f.farm_name, usr.first_name as farmer_first_name, usr.last_name as farmer_last_name
                    FROM Order_Items oi
                    JOIN Product pr ON oi.product_id = pr.id
                    JOIN Unit_Of_Measure u ON pr.unit_id = u.id
                    JOIN Farmer f ON pr.farmer_id = f.id
                    JOIN User usr ON f.user_id = usr.id
                    WHERE oi.order_id = ?
                ");
                $stmt->execute([$order_id]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                jsonResponse(['success' => true, 'data' => $order]);
            }

            // Order listing
            $where = "WHERE 1=1";
            $params = [];

            if ($status) {
                $where .= " AND o.status = ?";
                $params[] = $status;
            }

            if ($buyer_id) {
                $where .= " AND o.buyer_id = ?";
                $params[] = $buyer_id;
            }

            if ($date_from) {
                $where .= " AND DATE(o.created_at) >= ?";
                $params[] = $date_from;
            }

            if ($date_to) {
                $where .= " AND DATE(o.created_at) <= ?";
                $params[] = $date_to;
            }

            // Get total
            $stmt = $conn->prepare("SELECT COUNT(*) as total FROM Orders o $where");
            $stmt->execute($params);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            $pagination = getPagination($page, $limit, $total);

            $params[] = $limit;
            $params[] = $pagination['offset'];

            $stmt = $conn->prepare("
                SELECT o.id, o.total_amount, o.status, o.created_at,
                       u.first_name as buyer_first_name, u.last_name as buyer_last_name,
                       d.status as delivery_status,
                       (SELECT COUNT(*) FROM Order_Items WHERE order_id = o.id) as item_count
                FROM Orders o
                JOIN Buyer b ON o.buyer_id = b.id
                JOIN User u ON b.user_id = u.id
                LEFT JOIN Delivery d ON o.id = d.order_id
                $where
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            jsonResponse([
                'success' => true,
                'data' => $orders,
                'pagination' => $pagination
            ]);
            break;

        case 'PUT':
            // Update order status
            $data = json_decode(file_get_contents("php://input"), true);
            $order_id = sanitize($data['id'] ?? $_GET['id'] ?? '');
            $status = sanitize($data['status'] ?? '');

            if (empty($order_id)) {
                jsonResponse(['error' => 'Order ID is required'], 400);
            }

            $valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
            
            if ($status && !in_array($status, $valid_statuses)) {
                jsonResponse(['error' => 'Invalid status'], 400);
            }

            $conn->beginTransaction();

            if ($status) {
                $stmt = $conn->prepare("UPDATE Orders SET status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$status, $order_id]);

                // Update delivery status if applicable
                if (in_array($status, ['shipped', 'delivered'])) {
                    $delivery_status = $status === 'delivered' ? 'delivered' : 'in_transit';
                    $delivered_at = $status === 'delivered' ? 'NOW()' : 'NULL';
                    
                    $stmt = $conn->prepare("
                        UPDATE Delivery SET status = ?, 
                        delivered_at = " . ($status === 'delivered' ? 'NOW()' : 'delivered_at') . ",
                        updated_at = NOW() 
                        WHERE order_id = ?
                    ");
                    $stmt->execute([$delivery_status, $order_id]);
                }
            }

            // Update delivery tracking if provided
            if (isset($data['tracking_number']) || isset($data['carrier'])) {
                $delivery_updates = [];
                $delivery_params = [];

                if (isset($data['tracking_number'])) {
                    $delivery_updates[] = "tracking_number = ?";
                    $delivery_params[] = sanitize($data['tracking_number']);
                }
                if (isset($data['carrier'])) {
                    $delivery_updates[] = "carrier = ?";
                    $delivery_params[] = sanitize($data['carrier']);
                }
                if (isset($data['estimated_delivery'])) {
                    $delivery_updates[] = "estimated_delivery = ?";
                    $delivery_params[] = sanitize($data['estimated_delivery']);
                }

                if (!empty($delivery_updates)) {
                    $delivery_updates[] = "updated_at = NOW()";
                    $delivery_params[] = $order_id;
                    
                    $stmt = $conn->prepare("UPDATE Delivery SET " . implode(', ', $delivery_updates) . " WHERE order_id = ?");
                    $stmt->execute($delivery_params);
                }
            }

            $conn->commit();

            jsonResponse([
                'success' => true,
                'message' => 'Order updated successfully'
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
